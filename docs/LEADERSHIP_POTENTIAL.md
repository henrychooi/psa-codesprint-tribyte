# 📊 Leadership Potential - Explainable AI-Augmented Scoring

![All Users](https://img.shields.io/badge/Access-All%20Users-green)
![Azure OpenAI](https://img.shields.io/badge/Powered%20by-Azure%20OpenAI-412991)
![Explainability](https://img.shields.io/badge/AI-Explainable%20Scoring-blue)

**Leadership Potential** provides evidence-based leadership assessment combining heuristic analysis with Azure OpenAI sentiment augmentations for transparent, actionable talent development insights.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [4-Component Scoring Model](#4-component-scoring-model)
- [Azure OpenAI Augmentations](#azure-openai-augmentations)
- [Scoring Algorithms](#scoring-algorithms)
- [Explainability Features](#explainability-features)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Configuration & Calibration](#configuration--calibration)

---

## Overview

### Purpose

Leadership Potential assesses employee leadership readiness through quantifiable metrics and AI-powered analysis, providing transparent, actionable insights for talent development. The system delivers:

- **Transparent Scoring**: 4-component breakdown with clear evidence linking
- **AI Augmentation**: Azure OpenAI sentiment analysis and stakeholder detection for enhanced accuracy
- **Actionable Insights**: Personalized improvement suggestions based on component performance
- **Percentile Ranking**: Comparative assessment to understand relative positioning
- **Explainability**: Full methodology disclosure and citation trails for trust and transparency

### Key Features

- **Evidence-Based Assessment**: Every score component links to specific projects, competencies, or career progression milestones
- **Hybrid Scoring Methodology**: Combines 60% heuristic base scoring with 40% Azure OpenAI augmentation for balanced accuracy
- **Real-Time Computation**: Optimized algorithms return comprehensive results in under 5 seconds
- **Interactive Visualizations**: Bar charts, score cards, and evidence modals for intuitive understanding
- **Feedback Loop**: Continuous improvement through user feedback on scoring accuracy

### Access Control

**Available to All Users**: Leadership Potential assessment is accessible to both employees (for self-assessment and development) and administrators (for talent management and succession planning). Employees can view their own leadership potential, while administrators can assess all employees.

---

## Architecture

### System Flow

```
API Request (/api/leadership-potential/<employee_id>)
    ↓
[Fetch Employee Data] → Single employee query (optimized)
    ↓
[Apply Static Max Metrics] → Avoid full dataset normalization
    ↓
[Compute Leadership Potential]
    ├── [Base Heuristic Scoring]
    │   ├── Extract quantified outcomes (regex)
    │   ├── Count distinct stakeholders (keywords)
    │   ├── Check change management competencies
    │   └── Calculate progression velocity (dateutil)
    │
    ├── [Azure OpenAI Augmentations] (optional, controlled by use_augmentations flag)
    │   ├── Outcome Impact: Sentiment analysis + quantitative extraction
    │   └── Stakeholder Complexity: Partner detection + engagement grading
    │
    └── [Merge Scores] → 60% base + 40% augmented
    ↓
[Generate Evidence] → Link scores to specific projects/competencies
    ↓
[Estimate Percentile] → Score-range mapping (no full dataset query)
    ↓
[Generate Improvement Suggestions] → Component-specific recommendations
    ↓
[Return JSON Response] → Overall score + components + evidence + suggestions
```

### Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│             Frontend (leadership.js)                         │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │ Employee   │  │ Score Card   │  │ Component         │    │
│  │ Search     │  │ (Overall +   │  │ Breakdown         │    │
│  │            │  │ Percentile)  │  │ (Bar Chart)       │    │
│  └────────────┘  └──────────────┘  └───────────────────┘    │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │ Evidence   │  │ Feedback     │  │ Improvement       │    │
│  │ Modal      │  │ Modal        │  │ Suggestions       │    │
│  └────────────┘  └──────────────┘  └───────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│        Backend (leadership_potential.py)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ compute_leadership_potential(employee, max_metrics,   │  │
│  │                               use_augmentations=True) │  │
│  │                                                        │  │
│  │  Component 1: Outcome Impact (25% weight)             │  │
│  │   - extract_quantified_outcomes()                     │  │
│  │   - [AUGMENT] analyze_outcome_impact_augmented()      │  │
│  │   - Merge: 60% base + 40% augmented                   │  │
│  │                                                        │  │
│  │  Component 2: Stakeholder Complexity (25% weight)     │  │
│  │   - count_distinct_stakeholders()                     │  │
│  │   - [AUGMENT] analyze_stakeholder_complexity_augmented() │
│  │   - Merge: 60% base + 40% augmented                   │  │
│  │                                                        │  │
│  │  Component 3: Change Management (20% weight)          │  │
│  │   - has_competency("Change") or has_competency("Transformation") │
│  │                                                        │  │
│  │  Component 4: Progression Velocity (30% weight)       │  │
│  │   - calculate_progression_velocity()                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│    Backend (leadership_augmentations.py)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Azure OpenAI Client (gpt-5-mini)                       │  │
│  │                                                        │  │
│  │ analyze_outcome_impact_augmented(projects)            │  │
│  │  → Sentiment analysis (positive/neutral/negative)     │  │
│  │  → Quantitative metrics extraction (%, ratios)        │  │
│  │  → Confidence scoring with 2.5x boost, 0.60 floor     │  │
│  │  → Returns: Q (quantitative) + S (sentiment) scores   │  │
│  │                                                        │  │
│  │ analyze_stakeholder_complexity_augmented(projects, exp) │
│  │  → Stakeholder type classification (internal/external)│  │
│  │  → Engagement quality grading (low/medium/high)       │  │
│  │  → Diversity & seniority factor calculation           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 4-Component Scoring Model

### Overview

Leadership potential scored on 0-100 scale as weighted composite:
```
Overall Score = (0.25 × Outcome Impact) +
                (0.25 × Stakeholder Complexity) +
                (0.20 × Change Management) +
                (0.30 × Progression Velocity)
```

### Component 1: Outcome Impact (25% Weight)

**Measures**: Quantifiable results delivered through projects and initiatives.

**Base Heuristic**:
```python
def extract_quantified_outcomes(projects):
    """
    Extract percentage values from project outcomes using regex.
    Examples: "30% cost reduction", "99.95% availability", "22% improvement"
    """
    outcomes = []
    for project in projects:
        text_sources = [project.description] + project.outcomes
        for text in text_sources:
            # Pattern: "30%", "99.95%"
            matches = re.findall(r'(\d+(?:\.\d+)?)\s*%', text)
            for match in matches:
                value = float(match)
                outcomes.append(min(value, 100))  # Cap at 100%
    
    if outcomes:
        avg_outcome = sum(outcomes) / len(outcomes)
        max_outcome = max_metrics['max_outcome']  # Static: 100
        return min(avg_outcome / max_outcome, 1.0)
    else:
        return 0.5  # Default if no metrics
```

**Azure OpenAI Augmentation**:
```python
def analyze_outcome_impact_augmented(projects):
    """
    Augment with sentiment analysis and quantitative extraction.
    
    System Prompt instructs GPT to:
    1. Analyze each outcome individually for sentiment (positive/neutral/negative)
    2. Extract quantitative metrics (percentages, ratios, absolute values)
    3. Calculate weighted average sentiment across all outcomes
    4. Return structured JSON with sentiment scores and metrics
    """
    # Scoring configuration (calibrated to reduce harshness)
    SENTIMENT_CONFIDENCE_BOOST = 2.5  # Multiply confidence
    SENTIMENT_CONFIDENCE_FLOOR = 0.60  # Minimum confidence
    SENTIMENT_WEIGHT_IN_FINAL = 0.45   # Increased from 0.30
    
    # Sentiment mapping
    sentiment_scores = {
        'negative': 0.3,   # Raised from 0.2
        'neutral': 0.65,   # Raised from 0.5
        'positive': 1.0
    }
    
    # Example Azure response:
    {
        "overall_sentiment": {
            "label": "positive",
            "score": 0.862,
            "confidence": 0.87
        },
        "quantitative_metrics": [
            {
                "metric_text": "30% infrastructure cost reduction",
                "metric_type": "percentage",
                "value": 30.0
            }
        ]
    }
    
    # Compute Q (quantitative score)
    Q = (0.6 × magnitude_score) + (0.4 × presence_score)
    
    # Compute S (sentiment score) with smoothing
    S = (sentiment_base_score ^ 0.7) × boosted_confidence
    
    # Final augmented outcome
    augmented_outcome = (1 - SENTIMENT_WEIGHT_IN_FINAL) × Q + SENTIMENT_WEIGHT_IN_FINAL × S
```

**Merge Strategy**:
```python
outcome_impact = 0.6 × outcome_impact_base + 0.4 × augmented_outcome_score
```

**Evidence Linking**:
```python
evidence = [
    "Hybrid Cloud Migration: 30% infrastructure cost reduction, 99.95% availability",
    "Vulnerability Management Platform: 22% Mean Time To Remediate reduction"
]
```

---

### Component 2: Stakeholder Complexity (25% Weight)

**Measures**: Breadth and depth of stakeholder engagement across organizational boundaries.

**Base Heuristic**:
```python
def count_distinct_stakeholders(projects, experiences):
    """
    Count unique stakeholder groups using keyword matching.
    
    Keywords: executive, c-suite, board, cross-functional, vendors, partners,
              customers, regulatory, global, regional, etc.
    """
    stakeholder_keywords = {
        'executive', 'c-suite', 'senior management', 'board',
        'cross-functional', 'multi-disciplinary', 'diverse teams',
        'business units', 'departments', 'divisions',
        'vendors', 'suppliers', 'partners', 'external stakeholders',
        'customers', 'clients', 'end-users',
        'regulatory', 'compliance', 'audit',
        'global', 'regional', 'international'
    }
    
    found_stakeholders = set()
    for project in projects:
        for keyword in stakeholder_keywords:
            if keyword in project.description.lower():
                found_stakeholders.add(keyword)
    
    unique_count = len(found_stakeholders)
    max_stakeholders = max_metrics['max_stakeholders']  # Static: 15
    return min(unique_count / max_stakeholders, 1.0)
```

**Azure OpenAI Augmentation**:
```python
def analyze_stakeholder_complexity_augmented(projects, experiences):
    """
    Use GPT to:
    1. Identify distinct stakeholder groups/organizations
    2. Classify as internal, cross-functional, external, senior
    3. Assess engagement quality (low/medium/high)
    4. Rate overall complexity (0-1)
    """
    # Example Azure response:
    {
        "distinct_stakeholder_groups": [
            "Treasury operations",
            "Finance leadership (CFO)",
            "Banks and custodial partners",
            "Risk & compliance"
        ],
        "stakeholder_types": {
            "internal": 4,
            "cross_functional": 1,
            "external": 2,
            "senior": 1
        },
        "engagement_quality": {
            "label": "medium",
            "confidence": 0.75
        },
        "complexity_assessment": {
            "score": 0.65,
            "rationale": "Multiple internal teams plus external banking partners..."
        }
    }
    
    # Compute factors
    diversity_factor = min(1.0, 0.25 × num_distinct_groups)
    external_factor = external_count / num_distinct_groups
    seniority_factor = min(1.0, 0.5 × senior_count)
    
    # Compute base augmented
    base_augmented = (0.5 × complexity_raw) +
                     (0.2 × diversity_factor) +
                     (0.2 × external_factor) +
                     (0.1 × seniority_factor)
    
    # Adjust by engagement quality
    E = engagement_mapping[engagement_label]  # low:0.25, medium:0.6, high:1.0
    final_augmented = base_augmented × (0.5 + 0.5 × E)
```

**Merge Strategy**:
```python
stakeholder_complexity = 0.6 × stakeholder_base + 0.4 × augmented_stakeholder
```

**Evidence Linking**:
```python
evidence = [
    "FX Risk Optimisation Initiative: Engaged treasury, finance leadership, external banking partners",
    "Recognition Program Relaunch: Coordinated with HR, L&D, IT, 1200+ employees"
]
```

---

### Component 3: Change Management (20% Weight)

**Measures**: Demonstrated capability to lead transformational initiatives.

**Heuristic** (No augmentation):
```python
def has_competency(competencies, competency_name):
    """
    Check if employee has change/transformation competency at any level.
    """
    competency_name_lower = competency_name.lower()
    for comp in competencies:
        comp_name = comp.name.lower()
        if competency_name_lower in comp_name or comp_name in competency_name_lower:
            return True
    return False

# Scoring
has_change = has_competency(competencies, "Change") or 
             has_competency(competencies, "Transformation")

change_mgmt_score = 1.0 if has_change else 0.5
```

**Evidence Linking**:
```python
evidence = [
    "Competency: Change & Transformation Management (Advanced)",
    "Project: Hybrid Cloud Migration"  # If description contains "migration", "transformation", "change"
]
```

---

### Component 4: Progression Velocity (30% Weight)

**Measures**: Career advancement rate as proxy for leadership trajectory.

**Heuristic**:
```python
def calculate_progression_velocity(positions_history, hire_date):
    """
    Calculate levels advanced per year of tenure.
    """
    role_levels = {
        'trainee': 1, 'junior': 1, 'analyst': 2, 'engineer': 2,
        'senior': 3, 'lead': 4, 'manager': 4,
        'principal': 5, 'director': 6, 'head': 6, 'vp': 7
    }
    
    position_levels = []
    for pos in positions_history:
        title_lower = pos.role_title.lower()
        level = 2  # Default
        for keyword, lvl in role_levels.items():
            if keyword in title_lower:
                level = max(level, lvl)
        position_levels.append(level)
    
    levels_advanced = max(position_levels) - min(position_levels)
    
    hire_dt = datetime.fromisoformat(hire_date)
    years_tenure = (datetime.now() - hire_dt).days / 365.25
    years_tenure = max(years_tenure, 1)  # Minimum 1 year
    
    progression_rate = levels_advanced / years_tenure
    max_progression = max_metrics['max_progression']  # Static: 1.5
    return min(progression_rate / max_progression, 1.0)
```

**Evidence Linking**:
```python
evidence = "2 levels advanced in 3.5 years"
```

---

## Azure OpenAI Augmentations

### System Architecture

```python
# leadership_augmentations.py

from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=AZURE_API_KEY,
    azure_endpoint=AZURE_ENDPOINT,  # APIM endpoint
    api_version="2025-01-01-preview",
    default_headers={"Ocp-Apim-Subscription-Key": AZURE_API_KEY}
)
```

### Outcome Impact Augmentation

**GPT Prompt**:
```
You are an expert business and leadership analyst.

Analyze these project outcomes and extract metrics:

{combined_outcome_text}

Return JSON:
{
  "individual_analyses": [
    {
      "outcome_text": "...",
      "sentiment": {"label": "positive|neutral|negative", "score": 0.0-1.0},
      "reasoning": "..."
    }
  ],
  "overall_sentiment": {
    "label": "positive|neutral|negative",
    "score": 0.0-1.0,
    "confidence": 0.0-1.0,
    "explanation": "how individual scores were weighted"
  },
  "quantitative_metrics": [
    {
      "metric_text": "...",
      "metric_type": "percentage|ratio|absolute|achievement",
      "value": numeric_value,
      "baseline": "...",
      "timeframe": "..."
    }
  ]
}

Scoring guidelines:
- Positive outcomes with measurable results → 0.75-1.0
- Neutral/task-based statements → 0.5-0.75
- Problem-focused without resolution → 0.2-0.5
```

**API Call**:
```python
response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ],
    response_format={"type": "json_object"}
)
```

**Calibration (Less Harsh Grading)**:
- **Sentiment Confidence Boost**: 2.5x multiplier (raises low confidence scores)
- **Sentiment Confidence Floor**: 0.60 minimum (prevents over-penalization)
- **Raised Base Sentiment Scores**: negative=0.3 (was 0.2), neutral=0.65 (was 0.5)
- **Power Smoothing**: `score^0.7` compresses low scores upward
- **Increased Sentiment Weight**: 45% (was 30%) in final merge

**Result**:
- Before calibration: "Bank reconciliation time reduced by 50%" → Overall 0.48 (too harsh)
- After calibration: Same outcome → Overall 0.71 (fair recognition)

### Stakeholder Complexity Augmentation

**GPT Prompt**:
```
You are an expert analyst assessing stakeholder complexity in projects.

Analyze stakeholder engagement:

{combined_stakeholder_text}

Return JSON:
{
  "distinct_stakeholder_groups": ["group1", "group2", ...],
  "stakeholder_types": {
    "internal": count,
    "cross_functional": count,
    "external": count,
    "senior": count
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

Rate complexity (0=simple single-team, 1=highly complex multi-org/executive)
```

**API Call**: Same structure as outcome impact.

**Result**:
- Detects external partners (banks, vendors) that keyword matching might miss
- Identifies senior stakeholders (CFO, VP) from context
- Grades engagement quality based on described coordination difficulty

---

## Scoring Algorithms

### Static Max Metrics (Performance Optimization)

Instead of querying all employees for normalization:

```python
max_metrics = {
    'max_outcome': 100,      # Realistic upper bound for percentage improvements
    'max_stakeholders': 15,  # Typical maximum stakeholder types
    'max_progression': 1.5   # Maximum career progression rate (levels/year)
}
```

**Benefit**: Reduces API response time from 30+ seconds to <5 seconds.

### Percentile Estimation (No Full Dataset Query)

Score-range mapping instead of actual percentile calculation:

```python
def estimate_percentile_rank(score):
    if score >= 85: return 95
    elif score >= 75: return 85
    elif score >= 65: return 70
    elif score >= 55: return 50
    elif score >= 45: return 30
    else: return 15
```

**Tradeoff**: Less precise but acceptable for UX (user cares about "top 15%" more than exact "92nd percentile").

---

## Explainability Features

### 1. Component Breakdown Visualization

**Bar Chart** (Recharts):
- Horizontal bars for each component
- Color-coded by score range (red <50, yellow 50-70, green >70)
- Click to view evidence modal
- Percentages displayed on bars

### 2. Evidence Modal

**Structure**:
```json
{
  "outcome_impact": [
    "Hybrid Cloud Migration: 30% cost reduction, 99.95% availability",
    "Vulnerability Management: 22% MTTR reduction"
  ],
  "stakeholder_complexity": [
    "FX Risk Initiative: Treasury, CFO, external banking partners",
    "Recognition Program: HR, L&D, IT, 1200+ employees"
  ],
  "change_management": [
    "Competency: Change & Transformation Management (Advanced)",
    "Project: Hybrid Cloud Migration"
  ],
  "progression_velocity": "2 levels advanced in 3.5 years"
}
```

**Display**: Modal with tabs for each component, bulleted evidence lists.

### 3. Methodology Disclosure

**Collapsible Section** showing:
- Weight distribution (25%/25%/20%/30%)
- Normalization approach (static max metrics)
- Augmentation merge strategy (60/40 split)
- Percentile estimation method

### 4. Improvement Suggestions

**Algorithm**:
```python
def generate_improvement_suggestions(components, evidence):
    suggestions = []
    
    if components['outcome_impact'] < 60:
        suggestions.append(
            "Focus on quantifying project outcomes with metrics (% improvements, cost savings)"
        )
    
    if components['stakeholder_complexity'] < 60:
        suggestions.append(
            "Lead a cross-functional initiative to boost stakeholder management experience"
        )
    
    if components['change_management'] < 80:
        suggestions.append(
            "Seek transformation projects and document change management approaches"
        )
    
    if components['progression_velocity'] < 60:
        suggestions.append(
            "Discuss career advancement with manager and identify skill gaps for next level"
        )
    
    return suggestions
```

### 5. Feedback Modal

**Fields**:
- `feedback_type`: too_high | too_low | missing_evidence | weights_issue
- `comments`: Free text

**Purpose**: Collect user feedback for future model improvements (currently logged, not stored in DB).

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Base Scoring** | Python 3.8+ | Heuristic algorithms |
| **Augmentations** | Azure OpenAI (gpt-5-mini) | Sentiment & stakeholder analysis |
| **Regex** | re module | Quantitative metrics extraction |
| **Date Handling** | python-dateutil | Progression velocity calculation |
| **Database** | SQLAlchemy + SQLite | Employee data retrieval |
| **Frontend** | React 18 + Next.js 14 | UI components |
| **Visualization** | Recharts 2 | Bar charts, score cards |

---

## API Endpoints

### `GET /api/leadership-potential/<employee_id>`

**Authentication**: Required (All Users)

**Response**:
```json
{
  "success": true,
  "employee_id": "EMP-20001",
  "employee_name": "Samantha Lee",
  "overall_score": 76.8,
  "percentile_rank": 85,
  "components": {
    "outcome_impact": 82.3,
    "stakeholder_complexity": 71.5,
    "change_management": 100.0,
    "progression_velocity": 57.1
  },
  "evidence": {
    "outcome_impact": [...],
    "stakeholder_complexity": [...],
    "change_management": [...],
    "progression_velocity": "2 levels in 3.5 years"
  },
  "improvement_suggestions": [
    "Discuss career advancement opportunities with manager..."
  ],
  "raw_metrics": {
    "avg_outcome": 53.9,
    "unique_stakeholders": 8,
    "has_change_competency": true,
    "levels_advanced": 2,
    "years_tenure": 3.5
  }
}
```

### `POST /api/leadership-feedback`

**Request Body**:
```json
{
  "employee_id": "EMP-20001",
  "feedback_type": "missing_evidence",
  "comments": "My cross-departmental project wasn't captured"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you. Your feedback helps us improve leadership assessment for everyone."
}
```

---

## Configuration & Calibration

### Augmentation Parameters (`leadership_augmentations.py`)

```python
# Outcome Impact Sentiment Scoring
SENTIMENT_CONFIDENCE_BOOST = 2.5      # Multiplier for confidence
SENTIMENT_CONFIDENCE_FLOOR = 0.60     # Minimum confidence
SENTIMENT_WEIGHT_IN_FINAL = 0.45      # Weight in final score
SENTIMENT_BASE_SCORES = {
    'negative': 0.3,   # Raised from 0.2
    'neutral': 0.65,   # Raised from 0.5
    'positive': 1.0
}

# Stakeholder Complexity Engagement Mapping
ENGAGEMENT_SCORES = {
    'low': 0.25,
    'medium': 0.6,
    'high': 1.0
}
```

### Merge Strategy (`leadership_potential.py`)

```python
# Component merge weights
BASE_WEIGHT = 0.6        # Heuristic base score
AUGMENTED_WEIGHT = 0.4   # Azure AI augmented score

outcome_impact = BASE_WEIGHT × base_outcome + AUGMENTED_WEIGHT × augmented_outcome
stakeholder_complexity = BASE_WEIGHT × base_stakeholder + AUGMENTED_WEIGHT × augmented_stakeholder
```

### Component Weights (Final Composite)

```python
WEIGHTS = {
    'outcome_impact': 0.25,
    'stakeholder_complexity': 0.25,
    'change_management': 0.20,
    'progression_velocity': 0.30
}

overall_score = sum(component_score × weight for component, weight in WEIGHTS.items()) × 100
```

---

## Performance Optimization

### 1. Single Employee Query
```python
# BEFORE (slow): Fetch all employees for normalization
all_employees = session.query(Employee).all()
max_metrics = calculate_max_metrics(all_employees)  # Iterates all

# AFTER (fast): Use static max metrics
max_metrics = {'max_outcome': 100, 'max_stakeholders': 15, 'max_progression': 1.5}
employee = session.query(Employee).filter_by(employee_id=employee_id).first()
```

**Impact**: ~27 seconds saved (for 5 employees, scales linearly).

### 2. Conditional Augmentations
```python
def compute_leadership_potential(employee, max_metrics, use_augmentations=True):
    # Only call Azure OpenAI when use_augmentations=True
    if AUGMENTATIONS_AVAILABLE and use_augmentations:
        outcome_augmentation = analyze_outcome_impact_augmented(projects)
```

**Usage**:
- `use_augmentations=True`: Target employee (full scoring)
- `use_augmentations=False`: Batch/percentile calculations (skip expensive AI calls)

### 3. Graceful Fallback
```python
try:
    augmentation_result = analyze_outcome_impact_augmented(projects)
except Exception as e:
    print(f"⚠️ Augmentation error: {e}")
    augmentation_result = {'augmented_outcome': 0.5}  # Default
```

**Benefit**: System works even if Azure OpenAI is unavailable.

---

## Future Enhancements

1. **Database Storage**: Store scores for historical trend analysis
2. **Quarterly Trends**: "+2.1 from last quarter" feature
3. **Timeline Visualization**: Show progression over time in evidence modal
4. **PDF Export**: Downloadable leadership reports
5. **Bulk Assessment**: Manager view for entire team
6. **Custom Weights**: Role-specific weight configurations (e.g., technical roles weight progression higher)
7. **Feedback Analysis**: ML model to auto-adjust weights based on user feedback
8. **External Benchmarking**: Compare against industry standards

---

**🔗 Related Documentation**:
- [Compass Copilot](./COMPASS_COPILOT.md)
- [Career Roadmap](./CAREER_ROADMAP.md)
- [Main README](../README.md)

---

**Built with 💙 by Team Tribyte for PSA Code Sprint Singapore 2025**
