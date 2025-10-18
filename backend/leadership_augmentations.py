"""
Leadership Scoring Augmentations using Azure OpenAI
Adds sentiment analysis and quantitative evidence detection for outcome_impact,
and partner/diversity detection with engagement grading for stakeholder_complexity.
"""
import os
import json
import re
from typing import Dict, List, Any, Optional
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

# Azure OpenAI client configuration (reuse existing setup)
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_API_VERSION = "2025-01-01-preview"
# Use same deployment as career narrative generation, or fallback to gpt-4o-mini
AZURE_CHAT_DEPLOYMENT = os.getenv("AZURE_CHAT_DEPLOYMENT", "gpt-5-mini")

if AZURE_API_KEY and AZURE_ENDPOINT:
    client = AzureOpenAI(
        api_key=AZURE_API_KEY,
        azure_endpoint=AZURE_ENDPOINT,
        api_version=AZURE_API_VERSION,
        default_headers={"Ocp-Apim-Subscription-Key": AZURE_API_KEY}
    )
else:
    client = None
    print("⚠️ Azure OpenAI not configured. Augmentations will return default values.")


def analyze_outcome_impact_augmented(projects: List[Dict]) -> Dict[str, Any]:
    """
    Augment outcome impact scoring with Azure OpenAI sentiment analysis 
    and quantitative evidence extraction.
    
    Returns:
        {
            'sentiment': {'label': str, 'confidence': float},
            'quantitative_metrics': [{'metric_text': str, 'metric_type': str, 
                                      'value': float, 'baseline': str, 'timeframe': str}],
            'Q': float,  # Quantitative evidence score [0-1]
            'S': float,  # Sentiment score [0-1]
            'augmented_outcome': float  # Combined score [0-1]
        }
    """
    if not client or not projects:
        # Fallback: return neutral values with boosted baseline
        return {
            'sentiment': {'label': 'neutral', 'confidence': 0.6},
            'quantitative_metrics': [],
            'Q': 0.0,
            'S': 0.55,  # Boosted from 0.5 to align with less harsh grading
            'augmented_outcome': 0.25  # Increased from 0.15
        }
    
    # Collect all outcome text
    outcome_texts = []
    for project in projects:
        outcomes = project.get('outcomes', [])
        description = project.get('description', '')
        if isinstance(outcomes, list):
            outcome_texts.extend([str(o) for o in outcomes if o])
        outcome_texts.append(description)
    
    combined_text = " ".join([t for t in outcome_texts if t]).strip()
    if not combined_text:
        return {
            'sentiment': {'label': 'neutral', 'confidence': 0.6},
            'quantitative_metrics': [],
            'Q': 0.0,
            'S': 0.55,
            'augmented_outcome': 0.25
        }
    
    # Prepare Azure OpenAI prompt for structured extraction
    system_prompt ="""You are an expert business and leadership analyst. 
Your task is to perform detailed sentiment analysis and quantitative evidence extraction from a list of project outcomes. 
Analyze each outcome independently first, then combine them into a weighted overall sentiment summary.

Your response must strictly follow the JSON structure below:

{
  "individual_analyses": [
    {
      "outcome_text": "original outcome text",
      "sentiment": {
        "label": "positive|neutral|negative",
        "score": 0.0–1.0
      },
      "reasoning": "brief reasoning for the score"
    }
  ],
  "overall_sentiment": {
    "label": "positive|neutral|negative",
    "score": 0.0–1.0,
    "confidence": 0.0–1.0,
    "explanation": "explain how the individual scores were weighted and averaged"
  },
  "quantitative_metrics": [
    {
      "metric_text": "original text excerpt",
      "metric_type": "percentage|ratio|absolute|achievement",
      "value": numeric_value,
      "baseline": "baseline if mentioned",
      "timeframe": "timeframe if mentioned"
    }
  ]
}

Scoring guidelines for sentiment (examples to learn from):
- "Raise our number of subscribers for our website page by 15%" → sentiment score ≈ 0.80
- "Mentored new interns in HR department, with 60% going on to take on senior roles in various departments" → sentiment score ≈ 0.75
- "In charge of resolving the technical issues of finance staff" → sentiment score ≈ 0.50
- "Reduce overall turnover rate by 96%" → sentiment score ≈ 0.94

Sentiment scoring logic:
- **Positive** outcomes that show tangible improvement, measurable results, or successful initiatives → 0.75–1.0  
- **Neutral** or task-based statements without measurable outcomes → 0.5–0.75  
- **Negative** or problem-focused statements (without resolution) → 0.2–0.5  

Quantitative metrics detection rules:
- Prioritize percentage-based or ratio improvements (e.g., “increased by 25%”, “cut time by half”)
- Include baselines and timeframes if mentioned
- Return empty list if no metrics are found

After analyzing each outcome, calculate the overall sentiment as a **weighted average** of all individual sentiment scores.
Weigh higher-impact outcomes (those mentioning numbers, results, or clear progress) more strongly in the final score.
"""

    user_prompt = f"Analyze these project outcomes and extract metrics:\n\n{combined_text[:2000]}"
    
    try:
        response = client.chat.completions.create(
            model=AZURE_CHAT_DEPLOYMENT,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        print(f"📊 Outcome Impact Augmentation: {json.dumps(result, indent=2)}")
        
        # === SCORING CONFIGURATION: Sentiment Confidence Boost ===
        # Parameters to reduce harshness in outcome-impact grading
        SENTIMENT_CONFIDENCE_BOOST = 2.5  # Multiplicative boost to sentiment confidence
        SENTIMENT_CONFIDENCE_FLOOR = 0.60  # Minimum confidence to prevent over-penalization
        SENTIMENT_WEIGHT_IN_FINAL = 0.45  # Increased from 0.3 to give more credit to sentiment
        
        # Extract sentiment score S with boosted confidence
        sentiment = result.get('sentiment', {'label': 'neutral', 'confidence': 0.5})
        label = sentiment.get('label', 'neutral').lower()
        raw_confidence = float(sentiment.get('confidence', 0.5))
        
        # Apply confidence boost and floor (capped at 0.95 to avoid inflation)
        boosted_confidence = min(0.95, max(SENTIMENT_CONFIDENCE_FLOOR, raw_confidence * SENTIMENT_CONFIDENCE_BOOST))
        
        # Map sentiment label to base numeric score [0-1]
        sentiment_mapping = {'negative': 0.3, 'neutral': 0.65, 'positive': 1.0}  # Raised floor for negative/neutral
        base_sentiment_score = sentiment_mapping.get(label, 0.65)
        
        # Apply smoothing transform (softplus-like) to reduce volatility
        # This reduces sensitivity to small fluctuations
        smoothed_sentiment = base_sentiment_score ** 0.7  # Power <1 compresses low scores upward
        
        # Final sentiment score with boosted confidence
        S = smoothed_sentiment * boosted_confidence
        
        # Extract quantitative metrics and compute Q
        metrics = result.get('quantitative_metrics', [])
        
        if not metrics:
            Q = 0.0
        else:
            # Presence score: more metrics = higher signal
            num_metrics = len(metrics)
            presence_score = min(1.0, 0.2 * num_metrics)
            
            # Magnitude score: normalize primary metric
            primary_metric = metrics[0]  # Take first/most important
            metric_value = float(primary_metric.get('value', 0))
            metric_type = primary_metric.get('metric_type', 'percentage')
            
            # Domain-aware normalization
            if metric_type == 'percentage' or metric_type == 'achievement':
                # Cap at 100%
                magnitude_score = min(metric_value / 100.0, 1.0)
            elif metric_type == 'ratio':
                # Assume ratio improvements: normalize by log scale
                magnitude_score = min(1.0, (metric_value - 1.0) / 4.0) if metric_value > 1 else 0.0
            else:  # absolute
                # For absolute values, use log transform to [0,1]
                magnitude_score = min(1.0, abs(metric_value) / 100.0)
            
            magnitude_score = max(0.0, min(1.0, magnitude_score))
            
            # Combined quantitative score
            Q = 0.6 * magnitude_score + 0.4 * presence_score
        
        # Final augmented outcome score with increased sentiment weight
        # Changed from: 0.7 * Q + 0.3 * S
        # To give more credit to sentiment-based assessment
        augmented_outcome = (1.0 - SENTIMENT_WEIGHT_IN_FINAL) * Q + SENTIMENT_WEIGHT_IN_FINAL * S
        
        return {
            'sentiment': sentiment,
            'quantitative_metrics': metrics,
            'Q': round(Q, 3),
            'S': round(S, 3),
            'augmented_outcome': round(augmented_outcome, 3)
        }
        
    except Exception as e:
        print(f"⚠️ Outcome impact augmentation error: {e}")
        # Graceful fallback with boosted baseline
        return {
            'sentiment': {'label': 'neutral', 'confidence': 0.6},
            'quantitative_metrics': [],
            'Q': 0.0,
            'S': 0.55,
            'augmented_outcome': 0.25
        }


def analyze_stakeholder_complexity_augmented(projects: List[Dict], experiences: List[Dict]) -> Dict[str, Any]:
    """
    Augment stakeholder complexity scoring with Azure OpenAI partner/diversity detection
    and engagement quality grading.
    
    Returns:
        {
            'num_distinct_stakeholder_groups': int,
            'stakeholder_types': {'internal': int, 'cross_functional': int, 'external': int, 'senior': int},
            'engagement_quality': {'label': 'low|medium|high', 'confidence': float},
            'complexity_score_raw': float [0-1],
            'diversity_factor': float,
            'external_factor': float,
            'seniority_factor': float,
            'stakeholder_complexity_augmented': float
        }
    """
    if not client or (not projects and not experiences):
        # Fallback
        return {
            'num_distinct_stakeholder_groups': 0,
            'stakeholder_types': {'internal': 0, 'cross_functional': 0, 'external': 0, 'senior': 0},
            'engagement_quality': {'label': 'medium', 'confidence': 0.5},
            'complexity_score_raw': 0.5,
            'diversity_factor': 0.0,
            'external_factor': 0.0,
            'seniority_factor': 0.0,
            'stakeholder_complexity_augmented': 0.25
        }
    
    # Collect stakeholder descriptions
    stakeholder_texts = []
    for project in (projects or []):
        desc = project.get('description', '')
        stakeholder_texts.append(desc)
    for exp in (experiences or []):
        focus = exp.get('focus', '')
        stakeholder_texts.append(focus)
    
    combined_text = " ".join([t for t in stakeholder_texts if t]).strip()
    if not combined_text:
        return {
            'num_distinct_stakeholder_groups': 0,
            'stakeholder_types': {'internal': 0, 'cross_functional': 0, 'external': 0, 'senior': 0},
            'engagement_quality': {'label': 'medium', 'confidence': 0.5},
            'complexity_score_raw': 0.5,
            'diversity_factor': 0.0,
            'external_factor': 0.0,
            'seniority_factor': 0.0,
            'stakeholder_complexity_augmented': 0.25
        }
    
    # Azure OpenAI prompt for stakeholder analysis
    system_prompt = """You are an expert analyst assessing stakeholder complexity in projects.

Return a JSON object with:
{
  "distinct_stakeholder_groups": ["group1", "group2", ...],
  "stakeholder_types": {
    "internal": count_of_same_org_groups,
    "cross_functional": count_of_other_units_same_org,
    "external": count_of_partner_vendor_customer_groups,
    "senior": count_of_executive_senior_leadership
  },
  "engagement_quality": {
    "label": "low|medium|high",
    "confidence": 0.0-1.0
  },
  "complexity_assessment": {
    "score": 0.0-1.0,
    "rationale": "brief explanation"
  }
}

Extract:
- Distinct stakeholder groups/organizations mentioned
- Classify as internal, cross-functional, external partners, or senior/executive level
- Assess engagement quality based on described coordination difficulty
- Rate overall complexity (0=simple single-team, 1=highly complex multi-org/executive)"""

    user_prompt = f"Analyze stakeholder engagement complexity:\n\n{combined_text[:2000]}"
    
    try:
        response = client.chat.completions.create(
            model=AZURE_CHAT_DEPLOYMENT,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        print(f"👥 Stakeholder Complexity Augmentation: {json.dumps(result, indent=2)}")
        
        # Extract data
        distinct_groups = result.get('distinct_stakeholder_groups', [])
        num_distinct = len(distinct_groups)
        
        stakeholder_types = result.get('stakeholder_types', {
            'internal': 0, 'cross_functional': 0, 'external': 0, 'senior': 0
        })
        
        engagement = result.get('engagement_quality', {'label': 'medium', 'confidence': 0.5})
        complexity_raw = float(result.get('complexity_assessment', {}).get('score', 0.5))
        
        # Compute scoring factors
        diversity_factor = min(1.0, 0.25 * num_distinct)
        
        external_count = stakeholder_types.get('external', 0)
        external_factor = min(1.0, external_count / max(1, num_distinct)) if num_distinct > 0 else 0.0
        
        senior_count = stakeholder_types.get('senior', 0)
        seniority_factor = min(1.0, 0.5 * senior_count)
        
        # Map engagement quality to numeric
        engagement_label = engagement.get('label', 'medium').lower()
        engagement_mapping = {'low': 0.25, 'medium': 0.6, 'high': 1.0}
        E = engagement_mapping.get(engagement_label, 0.6)
        
        # Compute augmented stakeholder complexity
        base_augmented = (
            0.5 * complexity_raw +
            0.2 * diversity_factor +
            0.2 * external_factor +
            0.1 * seniority_factor
        )
        
        # Adjust by engagement quality (poor engagement reduces credit)
        final_augmented = base_augmented * (0.5 + 0.5 * E)
        
        return {
            'num_distinct_stakeholder_groups': num_distinct,
            'stakeholder_types': stakeholder_types,
            'engagement_quality': engagement,
            'complexity_score_raw': round(complexity_raw, 3),
            'diversity_factor': round(diversity_factor, 3),
            'external_factor': round(external_factor, 3),
            'seniority_factor': round(seniority_factor, 3),
            'stakeholder_complexity_augmented': round(final_augmented, 3)
        }
        
    except Exception as e:
        print(f"⚠️ Stakeholder complexity augmentation error: {e}")
        # Graceful fallback
        return {
            'num_distinct_stakeholder_groups': 0,
            'stakeholder_types': {'internal': 0, 'cross_functional': 0, 'external': 0, 'senior': 0},
            'engagement_quality': {'label': 'medium', 'confidence': 0.5},
            'complexity_score_raw': 0.5,
            'diversity_factor': 0.0,
            'external_factor': 0.0,
            'seniority_factor': 0.0,
            'stakeholder_complexity_augmented': 0.25
        }
