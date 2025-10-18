"""
AI Engine for Career Compass
- OpenAI embeddings generation (Azure OpenAI via APIM)
- Cosine similarity matching
- Narrative generation using gpt-5-mini (deployment)
"""
import os
import numpy as np
from openai import AzureOpenAI
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
from dotenv import load_dotenv

# Local embeddings fallback
try:
    from sentence_transformers import SentenceTransformer
    print("📦 Loading local embedding model (all-MiniLM-L6-v2)...")
    LOCAL_EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    USE_LOCAL_EMBEDDINGS = True
    print("✅ Using local sentence-transformers for embeddings")
except Exception as e:
    LOCAL_EMBEDDING_MODEL = None
    USE_LOCAL_EMBEDDINGS = False
    print(f"⚠️ Failed to load sentence-transformers: {type(e).__name__}: {e}")
    print("⚠️ Will use Azure OpenAI instead")

# -------------------------
# Load environment variables
# -------------------------
# Required:
#   AZURE_OPENAI_API_KEY=<your APIM subscription key>
#   AZURE_OPENAI_ENDPOINT=https://psacodesprint2025.azure-api.net/openai/
#   AZURE_EMBED_DEPLOYMENT=<your embeddings deployment name, e.g., text-embedding-3-small>
load_dotenv()

AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")   # usually includes /openai/
AZURE_API_VERSION = "2025-01-01-preview"

if not AZURE_API_KEY or not AZURE_ENDPOINT:
    raise RuntimeError("Missing AZURE_OPENAI_API_KEY or AZURE_OPENAI_ENDPOINT in environment.")

# -------------------------------------------------
# Azure OpenAI client (via APIM). We also send the
# APIM subscription key header to be safe.
# -------------------------------------------------
client = AzureOpenAI(
    api_key=AZURE_API_KEY,
    azure_endpoint=AZURE_ENDPOINT,
    api_version=AZURE_API_VERSION,
    default_headers={"Ocp-Apim-Subscription-Key": AZURE_API_KEY}
)

# ----------------------------
# Embeddings helper
# ----------------------------
def generate_embedding(text: str, model: str = None) -> List[float]:
    """
    Generate embedding vector for given text.
    Uses local sentence-transformers if available, otherwise Azure OpenAI.
    Args:
        text: Input text to embed
        model: Embeddings deployment name (only used for Azure). If None, uses AZURE_EMBED_DEPLOYMENT
    """
    # Try local embeddings first (fast and free!)
    if USE_LOCAL_EMBEDDINGS and LOCAL_EMBEDDING_MODEL:
        try:
            embedding = LOCAL_EMBEDDING_MODEL.encode(text)
            return embedding.tolist()
        except Exception as e:
            print(f"⚠️ Local embedding failed: {e}, falling back to Azure...")
    
    # Fallback to Azure OpenAI
    embed_deployment = model or os.getenv("AZURE_EMBED_DEPLOYMENT")
    if not embed_deployment:
        raise RuntimeError("Set AZURE_EMBED_DEPLOYMENT to your embeddings deployment name or install sentence-transformers.")

    try:
        response = client.embeddings.create(input=text, model=embed_deployment)
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Error generating embedding: {e}")
        return []

# ----------------------------
# Profile/role text builders
# ----------------------------
def create_profile_text(employee: Dict[str, Any]) -> str:
    parts = []
    employment = employee.get('employment_info', {})
    parts.append(f"Job Title: {employment.get('job_title', 'Unknown')}")
    parts.append(f"Department: {employment.get('department', 'Unknown')}")
    parts.append(f"Unit: {employment.get('unit', 'Unknown')}")

    skills = employee.get('skills', [])
    if skills:
        parts.append(f"Skills: {', '.join([s.get('skill_name', '') for s in skills])}")

    competencies = employee.get('competencies', [])
    if competencies:
        comp_text = ', '.join([f"{c.get('name')} ({c.get('level')})" for c in competencies])
        parts.append(f"Competencies: {comp_text}")

    experiences = employee.get('experiences', [])
    if experiences:
        exp_text = '; '.join([f"{e.get('program', '')} - {e.get('focus', '')}" for e in experiences])
        parts.append(f"Experience: {exp_text}")

    projects = employee.get('projects', [])
    if projects:
        parts.append(f"Projects: {'; '.join([p.get('project_name', '') for p in projects])}")

    return ' | '.join(parts)

def create_role_text(role: Dict[str, Any]) -> str:
    parts = []
    parts.append(f"Role: {role.get('title', 'Unknown')}")
    parts.append(f"Department: {role.get('department', 'Unknown')}")

    req_skills = role.get('required_skills', [])
    if req_skills:
        parts.append(f"Required Skills: {', '.join(req_skills)}")

    pref_skills = role.get('preferred_skills', [])
    if pref_skills:
        parts.append(f"Preferred Skills: {', '.join(pref_skills)}")

    req_comp = role.get('required_competencies', [])
    if req_comp:
        comp_text = ', '.join([f"{c.get('name')} ({c.get('min_level')}+)" for c in req_comp])
        parts.append(f"Required Competencies: {comp_text}")

    if role.get('description'):
        parts.append(f"Description: {role['description']}")

    return ' | '.join(parts)

# ----------------------------
# Matching + scoring
# ----------------------------
def calculate_skill_match(employee_skills: List[str], required_skills: List[str],
                          preferred_skills: List[str] = None) -> Dict[str, Any]:
    if preferred_skills is None:
        preferred_skills = []

    employee_set = set(employee_skills)
    required_set = set(required_skills)
    preferred_set = set(preferred_skills)

    required_matched = employee_set.intersection(required_set)
    required_missing = required_set - employee_set
    preferred_matched = employee_set.intersection(preferred_set)

    required_score = len(required_matched) / len(required_set) if required_set else 1.0
    preferred_score = len(preferred_matched) / len(preferred_set) if preferred_set else 0.0
    overall_score = (required_score * 0.7) + (preferred_score * 0.3)

    return {
        'overall_score': round(overall_score * 100, 1),
        'required_match_count': len(required_matched),
        'required_total': len(required_set),
        'required_matched': list(required_matched),
        'required_missing': list(required_missing),
        'preferred_match_count': len(preferred_matched),
        'preferred_total': len(preferred_set),
        'preferred_matched': list(preferred_matched)
    }

def match_employee_to_roles(employee: Dict[str, Any], roles: List[Dict[str, Any]],
                            top_k: int = 5) -> List[Dict[str, Any]]:
    if not roles:
        return []

    employee_text = create_profile_text(employee)
    employee_embedding = generate_embedding(employee_text)
    if not employee_embedding:
        return []

    employee_skills = [s.get('skill_name', '') for s in employee.get('skills', [])]
    matches = []

    for role in roles:
        role_text = create_role_text(role)
        role_embedding = generate_embedding(role_text)
        if not role_embedding:
            continue

        similarity = cosine_similarity([employee_embedding], [role_embedding])[0][0]
        skill_match = calculate_skill_match(
            employee_skills,
            role.get('required_skills', []),
            role.get('preferred_skills', [])
        )

        combined_score = (similarity * 0.6) + (skill_match['overall_score'] / 100 * 0.4)
        matches.append({
            'role': role,
            'match_score': round(combined_score * 100, 1),
            'embedding_similarity': round(similarity * 100, 1),
            'skill_match': skill_match,
            'recommendation_strength': _get_strength_label(combined_score * 100)
        })

    matches.sort(key=lambda x: x['match_score'], reverse=True)
    return matches[:top_k]

def _get_strength_label(score: float) -> str:
    if score >= 85:
        return "Excellent Match"
    elif score >= 70:
        return "Strong Match"
    elif score >= 55:
        return "Good Match"
    elif score >= 40:
        return "Potential Match"
    else:
        return "Stretch Opportunity"

# ----------------------------
# Narrative generation (uses gpt-5-mini deployment)
# ----------------------------
def generate_career_narrative(employee: Dict[str, Any], matched_role: Dict[str, Any],
                               match_details: Dict[str, Any]) -> str:
    personal_info = employee.get('personal_info', {})
    employment_info = employee.get('employment_info', {})

    prompt = f"""You are a career development advisor at PSA International. Write a personalized, encouraging career narrative for an employee exploring a new role opportunity.

EMPLOYEE PROFILE:
- Name: {personal_info.get('name', 'Employee')}
- Current Role: {employment_info.get('job_title', 'Unknown')}
- Department: {employment_info.get('department', 'Unknown')}
- Key Skills: {', '.join([s.get('skill_name', '') for s in employee.get('skills', [])[:5]])}
- Key Competencies: {', '.join([f"{c.get('name')} ({c.get('level')})" for c in employee.get('competencies', [])[:3]])}

OPPORTUNITY:
- Role: {matched_role.get('title', 'Unknown Role')}
- Department: {matched_role.get('department', 'Unknown')}
- Match Score: {match_details.get('match_score', 0)}%

SKILL ANALYSIS:
- Matched Skills: {', '.join(match_details.get('skill_match', {}).get('required_matched', []))}
- Skills to Develop: {', '.join(match_details.get('skill_match', {}).get('required_missing', []))}

Write a narrative (150-200 words) that:
1. Acknowledges their current strengths and how they align with the new role
2. Highlights the exciting growth opportunities
3. Provides 2-3 specific, actionable next steps (e.g., courses, mentorship, projects)
4. Maintains an encouraging, professional tone

Be specific, positive, and actionable. Avoid generic advice."""

    try:
        resp = client.chat.completions.create(
            model="gpt-5-mini",  # Azure deployment name
            messages=[
                {"role": "system", "content": "You are an expert career development advisor with deep knowledge of PSA International's culture and career frameworks."},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=20000 
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ Error generating narrative: {e}")
        return (
            f"Based on your experience as a {employment_info.get('job_title', 'professional')}, "
            f"you're well-positioned for the {matched_role.get('title', 'new role')} opportunity.\n\n"
            f"Your strengths in {', '.join([s.get('skill_name', '') for s in employee.get('skills', [])[:3]])} "
            f"align closely with this role's requirements.\n\n"
            f"To further strengthen your candidacy, consider:\n"
            f"• Upskilling in {', '.join(match_details.get('skill_match', {}).get('required_missing', ['key areas'])[:2])}\n"
            f"• Seeking mentorship from leaders in {matched_role.get('department', 'the target department')}\n"
            f"• Taking on projects that demonstrate these capabilities\n\n"
            "Your career journey at PSA continues to offer exciting growth opportunities."
        )

# ----------------------------
# Development plan
# ----------------------------
def generate_development_plan(skill_gaps: List[str], employee: Dict[str, Any]) -> List[Dict[str, Any]]:
    recommendations = []
    for skill in skill_gaps[:5]:
        recommendations.append({
            'skill': skill,
            'priority': 'High' if skill in skill_gaps[:3] else 'Medium',
            'suggested_actions': [
                f"Complete online course in {skill}",
                f"Shadow a colleague experienced in {skill}",
                f"Take on a project requiring {skill}"
            ],
            'estimated_timeline': '3-6 months'
        })
    return recommendations


# ============================================================================
# COMPASS COPILOT: Conversational AI Interface
# ============================================================================

def classify_intent(user_message: str, conversation_history: List[Dict[str, str]] = None) -> str:
    """
    Classify user intent using flexible pattern matching with context awareness.
    Returns one of: 'profile_summary', 'role_recommendations', 'skill_gap', 'wellbeing_support', 'general_qa'
    
    Note: Most queries should route to 'general_qa' for natural conversation.
    Only use specific intents for very clear, structured requests.
    """
    message_lower = user_message.lower()
    
    # Check conversation context for follow-up questions
    if conversation_history and len(conversation_history) > 0:
        last_assistant_msg = None
        for msg in reversed(conversation_history):
            if msg.get('role') == 'assistant':
                last_assistant_msg = msg.get('content', '').lower()
                break
        
        # If previous message was about roles, short queries likely refer to roles
        if last_assistant_msg and any(word in last_assistant_msg for word in ['role', 'position', 'opportunity']):
            if any(word in message_lower for word in ['more', 'other', 'else', 'what about', 'tell me', 'show me']):
                return "general_qa"  # Let GPT handle follow-ups naturally
    
    # Intent 1: Profile Summary - ONLY for very specific profile requests
    profile_exact_patterns = [
        "show my profile", "view my profile", "my full profile", 
        "complete profile", "profile summary"
    ]
    if any(pattern in message_lower for pattern in profile_exact_patterns):
        return "profile_summary"
    
    # Intent 2: Role Recommendations - ONLY for explicit role listing requests
    role_exact_patterns = [
        "show me all roles", "list all roles", "what roles are available",
        "show me matching roles", "list matching roles", "show roles"
    ]
    if any(pattern in message_lower for pattern in role_exact_patterns):
        return "role_recommendations"
    
    # Intent 3: Skill Gap Analysis - ONLY for explicit skill gap requests with role name
    skill_gap_patterns = [
        "skill gap", "skills needed", "what skills do i need for",
        "skills required for", "analyze my skills for"
    ]
    # Must have a role title mentioned
    has_role_title = any(word in message_lower for word in 
                         ["architect", "manager", "engineer", "analyst", "lead", 
                          "director", "specialist", "developer", "consultant"])
    if any(pattern in message_lower for pattern in skill_gap_patterns) and has_role_title:
        return "skill_gap"
    
    # Intent 4: Wellbeing & Engagement Support - for mental health, work-life balance, engagement topics
    wellbeing_patterns = [
        "stressed", "overwhelmed", "burnout", "tired", "exhausted",
        "work-life balance", "balance work", "mental health", "mental wellbeing",
        "feeling unmotivated", "unmotivated", "lack of motivation", "not engaged",
        "struggling with", "having trouble", "feeling lost", "direction", "purpose",
        "support", "help me with", "dealing with", "coping with",
        "wellness", "self-care", "taking care of myself", "well-being",
        "confidence", "imposter syndrome", "doubt", "unsure about"
    ]
    
    engagement_patterns = [
        "engaged", "engagement", "enjoy my work", "enjoy work", "love my work",
        "passionate about", "inspired", "motivation", "motivated", "sense of purpose"
    ]
    
    # Check for wellbeing/mental health keywords
    if any(pattern in message_lower for pattern in wellbeing_patterns):
        return "wellbeing_support"
    
    # Check for positive engagement keywords (conversational support context)
    if any(pattern in message_lower for pattern in engagement_patterns):
        # Context matters - if asking about finding purpose or sustaining engagement
        if any(word in message_lower for word in ["find", "maintain", "sustain", "grow", "build", "develop"]):
            return "wellbeing_support"
    
    # Intent 5: General Q&A - DEFAULT for natural conversation
    # Let GPT handle ALL other queries naturally, including:
    # - "What roles fit me?" - GPT can discuss roles conversationally
    # - "Tell me about my skills" - GPT can describe skills naturally
    # - "How can I grow?" - GPT can provide advice
    # - "What should I learn?" - GPT can suggest learning paths
    # This makes the bot feel more human and less rigid
    
    return "general_qa"


def extract_role_from_query(user_message: str, available_roles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extract target role from user query by matching role titles.
    Returns the best matching role or None if no match found.
    """
    message_lower = user_message.lower()
    
    # Try to find role title in message
    best_match = None
    best_match_score = 0
    
    for role in available_roles:
        role_title = role.get('title', '').lower()
        role_words = set(role_title.split())
        message_words = set(message_lower.split())
        
        # Calculate overlap
        overlap = len(role_words.intersection(message_words))
        if overlap > best_match_score:
            best_match_score = overlap
            best_match = role
    
    return best_match if best_match_score > 0 else None


def extract_citations_from_employee(employee: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract key achievements and quantifiable outcomes from employee data for citations.
    """
    citations = []
    
    # Extract from projects
    projects = employee.get('projects', [])
    for project in projects[:3]:  # Top 3 projects
        project_name = project.get('project_name', '')
        outcomes = project.get('outcomes', [])
        if project_name:
            citations.append({
                'source': 'project',
                'text': project_name,
                'details': outcomes if outcomes else []
            })
    
    # Extract top skills with evidence
    skills = employee.get('skills', [])
    for skill in skills[:5]:  # Top 5 skills
        skill_name = skill.get('skill_name', '')
        if skill_name:
            citations.append({
                'source': 'skill',
                'text': skill_name,
                'details': []
            })
    
    # Extract key competencies
    competencies = employee.get('competencies', [])
    for comp in competencies[:3]:  # Top 3 competencies
        comp_name = comp.get('name', '')
        comp_level = comp.get('level', '')
        if comp_name:
            citations.append({
                'source': 'competency',
                'text': f"{comp_name} ({comp_level})",
                'details': []
            })
    
    return citations


def generate_profile_summary(employee: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a concise profile summary using GPT-4.1-mini with citations.
    Intent 1: Profile Summary
    """
    personal_info = employee.get('personal_info', {})
    employment_info = employee.get('employment_info', {})
    skills = employee.get('skills', [])[:5]
    competencies = employee.get('competencies', [])[:3]
    projects = employee.get('projects', [])[:3]
    
    # Build context with quantifiable data
    skills_text = ', '.join([s.get('skill_name', '') for s in skills])
    comp_text = ', '.join([f"{c.get('name')} ({c.get('level')})" for c in competencies])
    
    project_details = []
    for p in projects:
        name = p.get('project_name', '')
        outcomes = p.get('outcomes', [])
        if name:
            outcome_text = ', '.join(outcomes) if outcomes else 'Key project'
            project_details.append(f"{name} ({outcome_text})")
    
    projects_text = '; '.join(project_details) if project_details else 'Various projects'
    
    prompt = f"""Summarize this employee's career highlights in 3-4 sentences with specific achievements.

EMPLOYEE:
- Name: {personal_info.get('name', 'Employee')}
- Current Role: {employment_info.get('job_title', 'Unknown')}
- Department: {employment_info.get('department', 'Unknown')}
- Key Skills: {skills_text}
- Competencies: {comp_text}
- Recent Projects: {projects_text}

Focus on:
1. Current role and tenure
2. Top technical/functional skills
3. Most impactful project with quantified outcomes
4. Overall strengths

Be specific and reference actual projects/achievements. Keep it concise (80-100 words)."""
    
    try:
        print(f"🟠 Calling Azure OpenAI for profile summary...")
        resp = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": """You are a career advisor at PSA International. Provide concise, data-driven career summaries.

IMPORTANT: Do NOT ask follow-up questions or prompt the user for information. Provide a complete summary without seeking additional input."""},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=20000  # Higher limit to allow reasoning + substantial output
        )
        
        print(f"🟠 Profile summary API response: {resp}")
        summary_text = resp.choices[0].message.content.strip()
        print(f"🟠 Summary text: '{summary_text}' (length: {len(summary_text)})")
        citations = extract_citations_from_employee(employee)
        
        return {
            'response_text': summary_text,
            'citations': citations[:5],  # Limit to top 5
            'suggested_actions': [
                'Explore role recommendations',
                'View skill development paths',
                'Find mentors in your field'
            ]
        }
        
    except Exception as e:
        print(f"❌ Error generating profile summary: {e}")
        return {
            'response_text': f"You're currently a {employment_info.get('job_title', 'professional')} in {employment_info.get('department', 'your department')} with strong skills in {skills_text}. Your recent work has focused on {projects_text}.",
            'citations': extract_citations_from_employee(employee)[:5],
            'suggested_actions': ['Explore role recommendations', 'View skill development paths']
        }


def format_role_recommendations(matches: List[Dict[str, Any]], employee: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format role recommendations with citations and rationale.
    Intent 2: Role Recommendations
    """
    if not matches:
        return {
            'response_text': "I couldn't find suitable role matches at this time. Please try updating your profile or contact HR for personalized guidance.",
            'citations': [],
            'suggested_actions': ['Update your skills', 'Contact HR']
        }
    
    # Build response with top 3 roles
    top_matches = matches[:3]
    
    response_parts = ["Based on your profile, here are your top career opportunities:\n"]
    citations = []
    
    for i, match in enumerate(top_matches, 1):
        role = match['role']
        score = match['match_score']
        skill_match = match['skill_match']
        
        matched_skills = skill_match.get('required_matched', [])[:3]
        skills_text = ', '.join(matched_skills) if matched_skills else 'your background'
        
        response_parts.append(
            f"\n{i}. **{role.get('title', 'Unknown Role')}** ({score}% match)\n"
            f"   • Your experience in {skills_text} aligns strongly with this role\n"
            f"   • {skill_match.get('required_match_count', 0)}/{skill_match.get('required_total', 0)} required skills matched"
        )
        
        # Add citation for this role
        citations.append({
            'source': 'role',
            'text': role.get('title', ''),
            'details': matched_skills
        })
    
    response_text = ''.join(response_parts)
    
    # Add skill citations from employee
    employee_citations = extract_citations_from_employee(employee)
    citations.extend(employee_citations[:3])
    
    return {
        'response_text': response_text,
        'citations': citations,
        'suggested_actions': [
            f"View detailed path for {top_matches[0]['role'].get('title', 'top role')}",
            'Analyze skill gaps',
            'Find mentors in target roles'
        ]
    }


def generate_skill_gap_analysis(employee: Dict[str, Any], target_role: Dict[str, Any] = None, 
                                 all_roles: List[Dict[str, Any]] = None, user_message: str = "") -> Dict[str, Any]:
    """
    Generate skill gap analysis and learning recommendations.
    Intent 3: Skill Gap Analysis
    """
    # If no target role specified, try to extract from message
    if not target_role and all_roles and user_message:
        target_role = extract_role_from_query(user_message, all_roles)
    
    if not target_role:
        return {
            'response_text': "Please specify which role you'd like to prepare for. You can ask: 'How do I become a [Role Title]?' or 'What skills do I need for [Role Title]?'",
            'citations': [],
            'suggested_actions': ['View all available roles', 'Explore career recommendations']
        }
    
    # Calculate skill gaps
    employee_skills = [s.get('skill_name', '') for s in employee.get('skills', [])]
    required_skills = target_role.get('required_skills', [])
    preferred_skills = target_role.get('preferred_skills', [])
    
    skill_match = calculate_skill_match(employee_skills, required_skills, preferred_skills)
    
    missing_required = skill_match.get('required_missing', [])
    matched_skills = skill_match.get('required_matched', [])
    
    # Generate learning path with GPT
    prompt = f"""Create a learning path for an employee to transition to a new role.

EMPLOYEE CURRENT SKILLS: {', '.join(employee_skills[:10])}

TARGET ROLE: {target_role.get('title', 'Unknown')}
REQUIRED SKILLS: {', '.join(required_skills)}

SKILL GAPS: {', '.join(missing_required) if missing_required else 'None - ready to apply!'}
MATCHED SKILLS: {', '.join(matched_skills)}

Provide:
1. Brief assessment of readiness (1-2 sentences)
2. Top 3 critical skills to develop (if any gaps exist)
3. For each gap: specific learning action and estimated time
4. Encouraging next steps

Be specific and actionable. Keep response under 150 words."""
    
    try:
        resp = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": """You are a learning and development advisor at PSA International. Provide specific, actionable learning paths.

IMPORTANT: Do NOT ask follow-up questions or prompt the user for information. Provide complete, actionable guidance without seeking additional input."""},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=20000  # Higher limit to allow reasoning + substantial output
        )
        
        response_text = resp.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"❌ Error generating skill gap analysis: {e}")
        if missing_required:
            gap_list = '\n'.join([f"   • {skill}" for skill in missing_required[:5]])
            response_text = f"To become a {target_role.get('title', 'professional in this role')}, focus on developing these skills:\n\n{gap_list}\n\nEstimated learning time: 3-6 months with dedicated effort."
        else:
            response_text = f"Great news! You already have the core skills for {target_role.get('title', 'this role')}. You're ready to apply!"
    
    # Build citations
    citations = []
    
    # Add matched skills as citations
    for skill in matched_skills[:3]:
        citations.append({
            'source': 'skill',
            'text': skill,
            'details': ['Existing strength']
        })
    
    # Add gap skills as citations
    for skill in missing_required[:3]:
        citations.append({
            'source': 'skill_gap',
            'text': skill,
            'details': ['Recommended to develop']
        })
    
    # Add target role citation
    citations.append({
        'source': 'role',
        'text': target_role.get('title', ''),
        'details': required_skills[:3]
    })
    
    return {
        'response_text': response_text,
        'citations': citations,
        'suggested_actions': [
            'View recommended courses',
            'Find mentors in ' + target_role.get('title', 'target role'),
            'Explore related projects'
        ],
        'skill_gaps': missing_required,
        'matched_skills': matched_skills
    }


def generate_wellbeing_support(employee: Dict[str, Any], user_message: str,
                                conversation_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Provide personalized support for engagement, mental well-being, work-life balance, and motivation.
    Intent 4: Wellbeing & Engagement Support
    
    This function offers:
    - Empathetic listening and validation of concerns
    - Practical strategies for stress management and work-life balance
    - Career purpose and meaning-making conversations
    - Engagement and motivation enhancement
    - Mental well-being resource recommendations
    - Connection to strength-based career development
    """
    print(f"🟡 ENTERED generate_wellbeing_support with message: '{user_message}'")
    personal_info = employee.get('personal_info', {})
    employment_info = employee.get('employment_info', {})
    skills = employee.get('skills', [])[:10]
    competencies = employee.get('competencies', [])[:5]
    projects = employee.get('projects', [])[:3]
    
    # Build context for wellbeing conversation
    skills_text = ', '.join([s.get('skill_name', '') for s in skills])
    current_role = employment_info.get('job_title', 'professional')
    department = employment_info.get('department', 'your department')
    
    # Extract achievements for strengths-based approach
    key_achievements = []
    for project in projects:
        proj_name = project.get('project_name', '')
        outcomes = project.get('outcomes', [])
        if proj_name and outcomes:
            key_achievements.append(f"{proj_name} - {outcomes[0]}")
        elif proj_name:
            key_achievements.append(proj_name)
    
    achievements_text = '; '.join(key_achievements[:3]) if key_achievements else 'various meaningful projects'
    
    # Build conversation context
    context_summary = ""
    if conversation_history and len(conversation_history) > 0:
        recent_exchanges = conversation_history[-6:]  # Last 3 exchanges
        context_summary = "\n\nCONVERSATION HISTORY:\n"
        for msg in recent_exchanges:
            role = msg.get('role', 'user')
            content = msg.get('content', '')[:150]
            context_summary += f"{role.upper()}: {content}\n"
    
    # Create an empathetic, supportive prompt focused on PERSONAL well-being first
    prompt = f"""You are a compassionate, holistic wellness advisor at PSA International. Your focus is on the PERSON first, not the job.

EMPLOYEE PROFILE:
- Name: {personal_info.get('name', 'Team Member')}
- Works as: {current_role} in {department}

CONCERN SHARED: "{user_message}"
{context_summary}

YOUR APPROACH - WELLBEING FOCUSED (NOT CAREER-FOCUSED):
✅ Validate their struggle - this is real, and their well-being matters more than productivity
✅ Normalize their feelings - many people struggle with this; they're not alone
✅ Focus on PERSONAL resilience - their own rest, boundaries, and life outside work
✅ Offer life-centered (not work-centered) strategies: rest, boundaries, support systems, joy, meaning
✅ Practical, immediate actions they can take for themselves (not framed as workplace solutions)
✅ Gentle permission to prioritize their health and happiness
✅ Recognition that sustainable living comes before sustainable careers
✅ Connect them to human, personal support (family, friends, community, wellness resources)

WHAT TO AVOID:
❌ Framing well-being in terms of "improved productivity" or "better performance"
❌ Suggesting this will help them advance or succeed at work
❌ Focusing on career benefits or role development
❌ Treating personal struggles as professional development opportunities
❌ Heavy solutions tied to their job function or achievements
❌ Business-speak or corporate language

CONVERSATION STYLE:
- Warm, genuine, and human - like talking to someone who truly cares about them as a PERSON
- Simple, heart-centered language
- Acknowledge the courage it takes to speak up about struggles
- Encourage them to trust their own needs and boundaries
- Lead with: "You matter. Your life outside work matters. Your rest matters."

Keep response warm and compassionate (2-3 paragraphs, ~100-150 words).
End with ONE simple, personal action they can take for THEMSELVES today or this week (not workplace-focused)."""
    
    try:
        print(f"🟡 Calling Azure OpenAI for wellbeing support...")
        resp = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are a deeply empathetic, holistic wellness advisor at PSA International. Your mission is to CENTER the employee's PERSONAL well-being, mental health, and life quality. You support them as a whole person, not just a worker.

CORE PRINCIPLES:
1. PERSON FIRST - Their health, happiness, and rest matter more than work performance
2. Validate struggles - Acknowledge what they're going through is real and significant
3. Normalize - Many people face these challenges; they're not alone or broken
4. Boundaries & rest - Support their right to protect their time, energy, and personal life
5. Holistic view - Work is one part of life, not the center of it
6. Practical compassion - Offer real, doable steps focused on THEIR well-being
7. Human connection - Encourage support from family, friends, community, not just work-based solutions
8. Permission & empowerment - Help them trust themselves and their own needs

TONE & LANGUAGE:
- Heart-centered, warm, human - like a caring friend
- Simple, direct language (no corporate jargon)
- Acknowledge courage and vulnerability
- Balance honesty with hope
- Always lead with: their well-being comes first

WHAT NOT TO DO:
- Link well-being to productivity or career advancement
- Frame personal struggles as professional development
- Suggest solutions primarily tied to work performance
- Minimize or normalize toxic work situations
- Use corporate wellness language
- Center their job or career goals

IMPORTANT CONSTRAINTS:
- DO NOT ask follow-up questions or prompt the user for more information
- DO NOT end with "What would you like to explore?" or similar prompts
- Provide complete, compassionate guidance without requesting further input
- Treat their concern with genuine care and respect
- Empower them with agency and personal resources"""
                },
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=20000
        )
        
        print(f"🟡 Wellbeing support API response received")
        response_text = resp.choices[0].message.content.strip()
        print(f"✅ Wellbeing response: {response_text[:100]}...")
        
        # Extract relevant citations
        citations = []
        
        # Add key strengths as citations
        for skill in skills[:3]:
            skill_name = skill.get('skill_name', '')
            if skill_name:
                citations.append({
                    'source': 'strength',
                    'text': skill_name,
                    'details': ['Core competency supporting resilience']
                })
        
        # Add achievements as citations
        for i, achievement in enumerate(key_achievements[:2]):
            citations.append({
                'source': 'achievement',
                'text': achievement,
                'details': ['Past success to build on']
            })
        
        # Suggested supportive actions
        suggested_actions = [
            'Access wellness resources',
            'Find a mentor in your area',
            'Explore role opportunities',
            'Schedule a check-in'
        ]
        
        return {
            'response_text': response_text,
            'citations': citations,
            'suggested_actions': suggested_actions
        }
        
    except Exception as e:
        print(f"❌ Error generating wellbeing support: {e}")
        import traceback
        traceback.print_exc()
        
        # Empathetic fallback response
        try:
            fallback_response = (
                f"I hear you, and I want you to know that what you're experiencing is valid. "
                f"As a {current_role}, you bring real value through your skills in {skills_text}. "
                f"Right now, the most important thing is taking care of yourself. "
                f"Consider starting small - whether that's setting a boundary, taking a break, or reaching out to someone you trust. "
                f"Your well-being matters, and there's support available to help you navigate this."
            )
        except Exception as inner_e:
            print(f"❌ Error in wellbeing fallback: {inner_e}")
            fallback_response = (
                "I genuinely care about your well-being. What you're feeling is important and deserves attention. "
                "Please know that support is available - whether through HR resources, employee wellness programs, or trusted colleagues. "
                "You don't have to navigate this alone. I'm here to help you find a path forward."
            )
        
        return {
            'response_text': fallback_response,
            'citations': [],
            'suggested_actions': [
                'Access wellness resources',
                'Speak with HR or manager',
                'Schedule time for self-care',
                'Find peer support'
            ]
        }


def generate_general_qa_response(employee: Dict[str, Any], user_message: str, 
                                   all_roles: List[Dict[str, Any]] = None,
                                   conversation_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Handle ALL career-related questions using GPT with full context.
    This is the PRIMARY intent - most queries route here for natural conversation.
    """
    print(f"🟣 ENTERED generate_general_qa_response with message: '{user_message}'")
    personal_info = employee.get('personal_info', {})
    employment_info = employee.get('employment_info', {})
    skills = employee.get('skills', [])[:10]
    competencies = employee.get('competencies', [])[:5]
    projects = employee.get('projects', [])[:5]
    experiences = employee.get('experiences', [])[:3]
    
    # Build comprehensive context
    skills_text = ', '.join([s.get('skill_name', '') for s in skills])
    comp_text = ', '.join([f"{c.get('name')} ({c.get('level')})" for c in competencies])
    
    project_details = []
    for p in projects:
        name = p.get('project_name', '')
        outcomes = p.get('outcomes', [])
        if name:
            outcome_text = ', '.join(outcomes[:2]) if outcomes else ''
            project_details.append(f"{name}" + (f" - {outcome_text}" if outcome_text else ""))
    projects_text = '; '.join(project_details)
    
    experiences_text = ', '.join([e.get('program', '') for e in experiences if e.get('program')])
    
    # Get role information for context
    role_context = ""
    if all_roles and len(all_roles) > 0:
        # Get top 3 matching roles for context
        top_roles = all_roles[:3]
        role_titles = [r.get('title', '') for r in top_roles]
        role_context = f"\n\nTOP MATCHING ROLES FOR THIS EMPLOYEE: {', '.join(role_titles)}"
    
    # Build conversation context
    context_summary = ""
    if conversation_history and len(conversation_history) > 0:
        recent_exchanges = conversation_history[-6:]  # Last 3 exchanges
        context_summary = "\n\nCONVERSATION HISTORY (for context continuity):\n"
        for msg in recent_exchanges:
            role = msg.get('role', 'user')
            content = msg.get('content', '')[:150]  # Limit length
            context_summary += f"{role.upper()}: {content}\n"
    
    # Create a natural, conversational prompt
    prompt = f"""You are a friendly and knowledgeable career advisor at PSA International. Have a natural conversation with the employee.

EMPLOYEE PROFILE:
- Name: {personal_info.get('name', 'Employee')}
- Current Role: {employment_info.get('job_title', 'Unknown')}
- Department: {employment_info.get('department', 'Unknown')}
- Years in Current Role: {employment_info.get('in_role_since', 'Unknown')}
- Top Skills: {skills_text}
- Key Competencies: {comp_text}
- Notable Projects: {projects_text}
- Experience/Training: {experiences_text}
{role_context}
{context_summary}

EMPLOYEE'S QUESTION: "{user_message}"

CONVERSATION STYLE:
✅ Be warm, encouraging, and conversational (like talking to a colleague)
✅ Reference their SPECIFIC skills, projects, or experience when relevant
✅ Give ACTIONABLE advice they can use immediately
✅ If discussing roles, mention 1-2 specific role titles they might fit
✅ If discussing skills, name 2-3 specific skills they could develop
✅ Keep it concise but friendly (2-3 sentences, ~100-120 words max)
✅ Be enthusiastic about their potential!

❌ DON'T be overly formal or robotic
❌ DON'T give generic advice that could apply to anyone
❌ DON'T use corporate jargon excessively

RESPOND NATURALLY:"""
    
    try:
        print(f"🔵 About to call Azure OpenAI API...")
        resp = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {
                    "role": "system", 
                    "content": """You are a friendly, insightful career advisor who gives personalized, actionable advice in a conversational tone. You foster engagement, mental well-being, and continuous development while making people excited about their career growth.

IMPORTANT CONSTRAINTS:
- DO NOT ask follow-up questions or prompt the user for more information
- DO NOT end with "What would you like to explore?" or similar prompts
- DO NOT use phrases like "Would you like to...", "Have you considered...", "Do you want to..."
- Infuse encouragement that supports their well-being and sustained growth
- ALWAYS provide complete, actionable advice without requesting further input
- End naturally without seeking additional information from the user"""
                },
                {"role": "user", "content": prompt}
            ],
            # Note: gpt-5-mini is a reasoning model - use MUCH higher limit for thinking + output
            max_completion_tokens=20000  # Allow substantial reasoning and response
        )
        
        print(f"🔵 API Response received: {resp}")
        print(f"🔵 Choices available: {len(resp.choices)}")
        if resp.choices:
            print(f"🔵 First choice content: {resp.choices[0].message.content}")
        
        response_text = resp.choices[0].message.content.strip()
        print(f"✅ Response text (after strip): '{response_text}' | Length: {len(response_text)}")
        
        # Format response with line breaks for better readability
        # Add newlines after numbered/lettered items, after sentences ending with periods before numbered lists
        formatted_response = response_text
        
        # Add line breaks after numbered points like "1) ", "2) ", etc.
        import re
        formatted_response = re.sub(r'(\d+\))', r'\n\1', formatted_response)
        
        # Add line breaks after common punctuation followed by capital letters (new sentences/points)
        # but preserve spacing in the middle of paragraphs
        formatted_response = re.sub(r'\. ([A-Z][a-z]+ [a-z]+ )', r'.\n\1', formatted_response)
        
        # Add double line breaks before common headers
        formatted_response = re.sub(r'(Immediately|Quick|Next step|To get|To move)', r'\n\1', formatted_response)
        
        # Clean up any multiple consecutive newlines
        formatted_response = re.sub(r'\n\n+', r'\n', formatted_response)
        
        response_text = formatted_response
        
        # Extract relevant citations from response
        citations = []
        
        # Add skill citations if mentioned in response
        response_lower = response_text.lower()
        for skill in skills[:5]:
            skill_name = skill.get('skill_name', '')
            if skill_name and skill_name.lower() in response_lower:
                citations.append({
                    'source': 'skill',
                    'text': skill_name,
                    'details': ['Current strength']
                })
        
        # Add project citations if mentioned
        for project in projects[:3]:
            proj_name = project.get('project_name', '')
            if proj_name and proj_name.lower() in response_lower:
                citations.append({
                    'source': 'project',
                    'text': proj_name,
                    'details': project.get('outcomes', [])[:2]
                })
        
        # ALWAYS show these 3 suggested actions for consistency
        suggested_actions = [
            'Show me matching roles',
            'Analyze skill gaps',
            'View my profile'
        ]
        
        return {
            'response_text': response_text,
            'citations': citations[:5],  # Limit citations
            'suggested_actions': suggested_actions
        }
        
    except Exception as e:
        print(f"❌ Error generating general Q&A response: {e}")
        import traceback
        traceback.print_exc()
        
        # Natural fallback response
        try:
            skills_list = [s.get('skill_name', '') for s in skills[:3]]
            skills_text = ', '.join(skills_list) if skills_list else 'your expertise'
            job_title = employment_info.get('job_title', 'a professional')
            
            fallback_response = (
                f"That's an interesting question! Based on your role as {job_title} "
                f"with strong skills in {skills_text}, "
                f"I'd love to help you explore this further. Let me know what specific area "
                f"you'd like to dive into!"
            )
        except Exception as inner_e:
            print(f"❌ Error even in fallback: {inner_e}")
            fallback_response = (
                "I'm here to help with your career development! "
                "I can show you matching roles, analyze skill gaps, or tell you about your profile. "
                "What would you like to explore?"
            )
        
        return {
            'response_text': fallback_response,
            'citations': [],
            'suggested_actions': [
                'Show me matching roles',
                'Analyze skill gaps',
                'View my profile'
            ]
        }
