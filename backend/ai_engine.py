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
    Generate embedding vector for given text using Azure OpenAI (deployment).
    Args:
        text: Input text to embed
        model: Embeddings deployment name. If None, uses AZURE_EMBED_DEPLOYMENT
    """
    embed_deployment = model or os.getenv("AZURE_EMBED_DEPLOYMENT")
    if not embed_deployment:
        raise RuntimeError("Set AZURE_EMBED_DEPLOYMENT to your embeddings deployment name.")

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
            temperature=0.7,
            max_tokens=400
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