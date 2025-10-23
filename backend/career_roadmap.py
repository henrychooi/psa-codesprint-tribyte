"""
Career Roadmap Generation and Simulation Engine
- Current roadmap for all users
- Predicted roadmap with simulations for admins
- AI-powered predictions using Azure OpenAI
- Integrated with caching infrastructure for performance
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional, Set
from collections import Counter
import time
import copy
import json
import random
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

# Import cache infrastructure
from cache import cache_career_roadmap

# Load Azure OpenAI credentials
load_dotenv()
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_API_VERSION = "2025-01-01-preview"
AZURE_CHAT_DEPLOYMENT = os.getenv("AZURE_CHAT_DEPLOYMENT", "gpt-5-mini")

# Initialize Azure OpenAI client
azure_client = None
if AZURE_API_KEY and AZURE_ENDPOINT:
    azure_client = AzureOpenAI(
        api_key=AZURE_API_KEY,
        azure_endpoint=AZURE_ENDPOINT,
        api_version=AZURE_API_VERSION,
        default_headers={"Ocp-Apim-Subscription-Key": AZURE_API_KEY}
    )
    print(f"✅ Azure OpenAI client initialized for career roadmap with deployment: {AZURE_CHAT_DEPLOYMENT}")
    print(f"   Note: {AZURE_CHAT_DEPLOYMENT} is a reasoning model using max_completion_tokens parameter")


NO_DOMAIN_PROGRESSION_MESSAGE = "No suitable progression within domain—requires reskilling evidence."
PREDICTIONS_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = int(os.getenv("CAREER_ROADMAP_CACHE_TTL", "600"))

_RAW_DOMAIN_ALIASES = {
    'information technology': 'information technology',
    'info tech': 'information technology',
    'it': 'information technology',
    'operations': 'operations',
    'terminal operations': 'operations',
    'port operations': 'operations',
    'finance': 'finance',
    'treasury': 'finance',
    'legal & compliance': 'legal',
    'legal and corporate secretariat': 'legal',
    'legal': 'legal',
    'risk & compliance': 'risk & compliance',
    'risk and compliance': 'risk & compliance',
    'communications & marketing': 'communications & marketing',
    'communications and marketing': 'communications & marketing',
    'communications': 'communications & marketing',
    'marketing': 'communications & marketing',
    'commercial': 'commercial',
    'procurement': 'procurement',
    'supply chain and logistics': 'supply chain and logistics',
    'supply chain': 'supply chain and logistics',
    'logistics': 'supply chain and logistics',
    'human resource': 'human resources',
    'human resources': 'human resources',
    'people and culture': 'human resources',
    'corporate affairs': 'corporate affairs',
    'automation and robotics': 'automation and robotics',
    'data & ai': 'data & ai',
    'data and ai': 'data & ai',
    'data science': 'data & ai',
    'data engineering': 'data & ai',
    'ui/ux design & development': 'design & experience',
    'customer experience management': 'design & experience',
    'design': 'design & experience',
    'sustainability': 'sustainability',
    'health, safety & security': 'health, safety & security',
    'health safety security': 'health, safety & security',
    'health safety and security': 'health, safety & security',
    'safety': 'health, safety & security'
}


def _sanitize_domain_label(value: Optional[str]) -> str:
    """Normalize raw labels (department, function areas) for comparison."""
    if not value:
        return ''
    label = value.strip()
    if ':' in label:
        label = label.split(':', 1)[0]
    label = label.lower()
    label = label.replace('/', ' ')
    label = label.replace('&', ' and ')
    label = label.replace('-', ' ')
    label = ''.join(ch for ch in label if ch.isalnum() or ch.isspace())
    return ' '.join(label.split())


DOMAIN_ALIAS_MAP = {
    _sanitize_domain_label(key): _sanitize_domain_label(value)
    for key, value in _RAW_DOMAIN_ALIASES.items()
    if _sanitize_domain_label(key) and _sanitize_domain_label(value)
}


def normalize_domain_label(value: Optional[str]) -> str:
    """Return a canonical domain label for consistent comparisons."""
    sanitized = _sanitize_domain_label(value)
    if not sanitized:
        return ''
    if sanitized in DOMAIN_ALIAS_MAP:
        return DOMAIN_ALIAS_MAP[sanitized]
    for alias_key, canonical in DOMAIN_ALIAS_MAP.items():
        if alias_key and alias_key in sanitized:
            return canonical
    return sanitized


def extract_domain_profile(employee: Dict[str, Any]) -> Dict[str, Any]:
    """
    Derive the employee's functional domain footprint from roles, skills, and employment data.
    Returns primary/internal domains plus evidence-backed external domains.
    """
    employment = employee.get('employment_info', {})
    skill_domains: Counter = Counter()
    domain_skill_evidence: Dict[str, List[str]] = {}

    for skill in employee.get('skills', []):
        domain_label = normalize_domain_label(skill.get('function_area'))
        if not domain_label:
            continue
        skill_domains[domain_label] += 1
        domain_skill_evidence.setdefault(domain_label, []).append(skill.get('skill_name') or '')

    dept_domain = normalize_domain_label(employment.get('department'))
    unit_domain = normalize_domain_label(employment.get('unit'))

    primary_domain = ''
    if skill_domains:
        primary_domain = skill_domains.most_common(1)[0][0]
    if not primary_domain:
        primary_domain = dept_domain or unit_domain

    primary_domains: Set[str] = {d for d in (primary_domain, dept_domain, unit_domain) if d}

    external_domains: Set[str] = set()
    for domain, count in skill_domains.items():
        if domain != primary_domain and count >= 2:
            external_domains.add(domain)

    return {
        'primary_domain': primary_domain,
        'primary_domains': primary_domains,
        'external_domains': external_domains,
        'skill_domain_counts': skill_domains,
        'domain_skill_evidence': {k: v for k, v in domain_skill_evidence.items() if v},
        'has_external_evidence': bool(external_domains)
    }


def derive_role_domain(role: Dict[str, Any]) -> str:
    """Infer the functional domain for a prospective role."""
    for key in ('department', 'function_area', 'unit', 'domain'):
        domain = normalize_domain_label(role.get(key))
        if domain:
            return domain
    return normalize_domain_label(role.get('title'))


def role_domain_allowed(role: Dict[str, Any], domain_profile: Dict[str, Any], allow_external: bool = False) -> bool:
    """Check whether a role stays within the employee's permitted domain scope."""
    if not domain_profile:
        return True
    allowed_domains = set(domain_profile.get('primary_domains', set()))
    if allow_external:
        allowed_domains.update(domain_profile.get('external_domains', set()))
    role_domain = derive_role_domain(role)
    return bool(role_domain and role_domain in allowed_domains)


def build_roles_signature(all_roles: List[Dict[str, Any]]) -> str:
    """Produce a stable signature for the supplied role catalogue."""
    signature_parts = []
    for role in all_roles:
        role_id = str(role.get('role_id') or role.get('title') or '').strip()
        marker = str(role.get('updated_at') or role.get('min_experience_years') or '').strip()
        signature_parts.append(f"{role_id}::{marker}")
    signature_parts.sort()
    signature_parts.append(str(len(all_roles)))
    return '|'.join(signature_parts)


def build_prediction_cache_key(
    employee_id: str,
    scenarios: Tuple[str, ...],
    roles_signature: str,
    use_ai: bool
) -> str:
    """Create a cache key that captures the employee, scenarios, roles set, and AI usage."""
    scenario_part = '|'.join(scenarios)
    return f"{employee_id}::{scenario_part}::{roles_signature}::ai={int(use_ai)}"


def evaluate_path_metrics(
    employee: Dict[str, Any],
    path: Dict[str, Any],
    domain_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Derive scenario-agnostic metrics from a simulated career path to support probability scoring.
    """
    domain_profile = domain_profile or extract_domain_profile(employee)
    milestones = path.get('milestones', [])
    total_years = len(milestones)
    
    if total_years == 0:
        return {
            'total_years': 0,
            'valid_years': 0,
            'blocked_years': 0,
            'progression_ratio': 0.0,
            'blocked_ratio': 1.0,
            'domain_consistency': 0.0,
            'skill_alignment': 0.0,
            'max_level_gain': 0,
            'forward_moves': 0,
            'lateral_moves': 0,
            'downward_moves': 0,
            'distinct_roles': 0,
            'domain_profile': domain_profile
        }
    
    employee_skills = set(skill.get('skill_name', '') for skill in employee.get('skills', []))
    employment = employee.get('employment_info', {})
    default_department = employment.get('department')
    current_role = employment.get('job_title', '')
    baseline_level = get_role_level(current_role)
    previous_level = baseline_level
    
    valid_years = 0
    blocked_years = 0
    domain_matches = 0
    cumulative_skill_alignment = 0.0
    max_level_gain = 0
    forward_moves = 0
    lateral_moves = 0
    downward_moves = 0
    distinct_roles: Set[str] = set()
    
    for milestone in milestones:
        role_title = milestone.get('role')
        if not role_title:
            blocked_years += 1
            continue
        
        if isinstance(role_title, str):
            sanitized_role = role_title.strip()
            if not sanitized_role or sanitized_role.lower() in {'none', 'null'}:
                blocked_years += 1
                continue
            if sanitized_role == NO_DOMAIN_PROGRESSION_MESSAGE:
                blocked_years += 1
                continue
        else:
            blocked_years += 1
            continue
        
        valid_years += 1
        distinct_roles.add(role_title)
        
        candidate_role = {
            'title': role_title,
            'department': milestone.get('department') or default_department
        }
        if role_domain_allowed(
            candidate_role,
            domain_profile,
            allow_external=domain_profile.get('has_external_evidence', False)
        ):
            domain_matches += 1
        
        milestone_skills = milestone.get('skills_acquired') or milestone.get('skills') or []
        if isinstance(milestone_skills, list) and milestone_skills:
            unique_skills = {str(skill).strip() for skill in milestone_skills if str(skill).strip()}
            if unique_skills:
                aligned_skills = {skill for skill in unique_skills if skill in employee_skills}
                cumulative_skill_alignment += len(aligned_skills) / len(unique_skills)
            else:
                cumulative_skill_alignment += 0.5
        else:
            cumulative_skill_alignment += 0.5
        
        level = get_role_level(role_title)
        level_gain = max(0, level - baseline_level)
        max_level_gain = max(max_level_gain, level_gain)
        
        if level > previous_level:
            forward_moves += 1
        elif level == previous_level and role_title != current_role:
            lateral_moves += 1
        elif level < previous_level:
            downward_moves += 1
        
        previous_level = level
        current_role = role_title
    
    progression_ratio = valid_years / total_years
    blocked_ratio = blocked_years / total_years
    domain_consistency = (domain_matches / valid_years) if valid_years else 0.0
    skill_alignment = (
        cumulative_skill_alignment / valid_years if valid_years else 0.0
    )
    
    return {
        'total_years': total_years,
        'valid_years': valid_years,
        'blocked_years': blocked_years,
        'progression_ratio': progression_ratio,
        'blocked_ratio': blocked_ratio,
        'domain_consistency': domain_consistency,
        'skill_alignment': min(skill_alignment, 1.0),
        'max_level_gain': max_level_gain,
        'forward_moves': forward_moves,
        'lateral_moves': lateral_moves,
        'downward_moves': downward_moves,
        'distinct_roles': len(distinct_roles),
        'domain_profile': domain_profile
    }

@cache_career_roadmap()
def calculate_current_roadmap(employee: Dict[str, Any], all_roles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate current career roadmap based on:
    - Current role and tenure
    - Skills and competencies
    - Career history
    - Position in organization
    
    Returns roadmap for next 2-3 years based on current trajectory
    Results are cached for 1 hour by default.
    """
    domain_profile = extract_domain_profile(employee)

    current_roadmap = {
        'current_position': {
            'title': employee['employment_info']['job_title'],
            'department': employee['employment_info']['department'],
            'tenure_years': calculate_tenure(employee['employment_info']['in_role_since']),
            'started_date': employee['employment_info']['in_role_since'],
            'key_achievements': extract_achievements(employee),
            'current_skills': count_skills(employee['skills']),
            'current_competencies': employee['competencies']
        },
        'next_logical_roles': find_next_roles(
            employee,
            all_roles,
            years=2,
            domain_profile=domain_profile
        ),
        'skills_to_develop': identify_skills_gaps(
            employee,
            all_roles,
            domain_profile=domain_profile
        ),
        'timeline': {
            'current': datetime.now().isoformat(),
            'next_milestone': (datetime.now() + timedelta(days=365)).isoformat(),
            'estimated_progression': '1-2 years in current role, then step up'
        },
        'career_anchors': analyze_career_anchors(employee),
        'positions_history': employee.get('positions_history', []),
        'employment_info': employee.get('employment_info', {})
    }
    
    return current_roadmap


@cache_career_roadmap()
def calculate_predicted_roadmap_with_simulations(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    scenarios: List[str] = None
) -> Dict[str, Any]:
    """
    For ADMIN ONLY: Calculate predicted roadmap using multiple simulation scenarios
    Uses Azure OpenAI to generate AI-powered predictions
    Results are cached for 1 hour by default.
    
    Scenarios:
    - "aggressive_growth": Fast-track progression
    - "steady_growth": Normal career progression  
    - "lateral_mobility": Cross-functional moves
    - "specialization": Deep expertise in domain
    """
    
    if scenarios is None:
        scenarios = ["steady_growth", "aggressive_growth", "lateral_mobility", "specialization"]
    else:
        scenarios = [s for s in scenarios if s]
        if not scenarios:
            scenarios = ["steady_growth", "aggressive_growth", "lateral_mobility", "specialization"]

    scenario_order = tuple(dict.fromkeys(scenarios))  # Preserve order, remove duplicates
    roles_signature = build_roles_signature(all_roles)
    use_ai = bool(azure_client)
    cache_key = build_prediction_cache_key(
        employee.get('employee_id', ''),
        scenario_order,
        roles_signature,
        use_ai
    )

    cache_entry = PREDICTIONS_CACHE.get(cache_key)
    if cache_entry:
        age = time.time() - cache_entry['timestamp']
        if age <= CACHE_TTL_SECONDS:
            cached_copy = copy.deepcopy(cache_entry['predictions'])
            cached_copy['analysis_date'] = datetime.now().isoformat()
            return cached_copy
        else:
            PREDICTIONS_CACHE.pop(cache_key, None)
    
    predictions = {
        'employee_id': employee['employee_id'],
        'analysis_date': datetime.now().isoformat(),
        'scenarios': {}
    }
    
    # Use AI to generate enhanced predictions if available
    if azure_client:
        for scenario in scenario_order:
            predictions['scenarios'][scenario] = simulate_career_path_with_ai(
                employee, 
                all_roles, 
                scenario_type=scenario
            )
    else:
        # Fallback to rule-based simulation
        for scenario in scenario_order:
            predictions['scenarios'][scenario] = simulate_career_path(
                employee, 
                all_roles, 
                scenario_type=scenario
            )
    
    # Add cross-scenario analysis
    predictions['optimal_path'] = determine_optimal_path(predictions['scenarios'])
    predictions['risk_factors'] = identify_risks(employee, predictions)
    predictions['retention_factors'] = identify_retention_factors(employee)

    PREDICTIONS_CACHE[cache_key] = {
        'timestamp': time.time(),
        'predictions': copy.deepcopy(predictions)
    }
    
    return predictions


def simulate_career_path_with_ai(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    scenario_type: str,
    years: int = 10
) -> Dict[str, Any]:
    """
    AI-powered career path simulation using Azure OpenAI
    Generates multiple scenarios and predicts most likely career trajectory
    """
    
    # First, get base simulation
    base_simulation = simulate_career_path(employee, all_roles, scenario_type, years)
    
    # Check if Azure client is available
    if not azure_client:
        print("⚠️ Azure OpenAI client not initialized - using rule-based simulation only")
        print("   Please check AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT environment variables")
        return base_simulation
    
    domain_profile = extract_domain_profile(employee)

    primary_domains_display = (
        ', '.join(domain.title() for domain in sorted(domain_profile.get('primary_domains', [])))
        or 'Unknown'
    )
    external_domain_evidence = domain_profile.get('domain_skill_evidence', {})
    external_domains_detail = []
    for domain in sorted(domain_profile.get('external_domains', [])):
        skills = [skill for skill in external_domain_evidence.get(domain, []) if skill]
        if skills:
            external_domains_detail.append(f"{domain.title()} (skills: {', '.join(skills[:3])})")
        else:
            external_domains_detail.append(domain.title())
    external_domains_display = ', '.join(external_domains_detail) if external_domains_detail else 'None documented'

    # Prepare employee context for AI
    employee_context = {
        'current_role': employee['employment_info']['job_title'],
        'department': employee['employment_info']['department'],
        'unit': employee['employment_info'].get('unit', 'N/A'),
        'tenure_years': calculate_tenure(employee['employment_info']['in_role_since']),
        'skills_count': len(employee['skills']),
        'top_skills': [s['skill_name'] for s in employee['skills'][:5]],
        'all_skills': [s['skill_name'] for s in employee['skills']],
        'competencies': employee.get('competencies', {}),
        'projects_count': len(employee.get('projects', [])),
        'primary_domains': sorted(domain_profile.get('primary_domains', [])),
        'external_domains': sorted(domain_profile.get('external_domains', [])),
        'primary_domains_display': primary_domains_display,
        'external_domains_display': external_domains_display
    }
    
    # Extract skill taxonomy and functional areas
    skill_functions = set()
    skill_areas = set()
    skill_specializations = set()
    for skill in employee['skills']:
        if 'function_area' in skill:
            skill_functions.add(skill['function_area'])
        if 'specialization' in skill:
            skill_specializations.add(skill['specialization'])
        # Legacy support for older data format
        if 'function' in skill:
            skill_functions.add(skill['function'])
        if 'area' in skill:
            skill_areas.add(skill['area'])
    
    # Get available next roles
    next_roles = find_next_roles(
        employee,
        all_roles,
        years=5,
        domain_profile=domain_profile,
        allow_external=domain_profile.get('has_external_evidence', False)
    )
    next_role_titles = [role['title'] for role in next_roles[:5]]
    
    # Prepare prompt for AI
    scenario_descriptions = {
        'aggressive_growth': 'fast promotions every 1-2 years, targeting leadership roles within the same functional domain, high visibility projects',
        'steady_growth': 'stable progression every 2-3 years within current functional area, balanced growth, gradual advancement',
        'lateral_mobility': 'cross-functional moves within related business areas (e.g., Finance to Commercial, Operations to Engineering), diverse experience',
        'specialization': 'deep domain expertise, becoming subject matter expert, principal/specialist level within current function'
    }
    
    # Extract past positions for context
    past_positions = []
    if 'employment_history' in employee:
        past_positions = [pos.get('job_title', '') for pos in employee['employment_history'][:3]]
    
    # Extract position history to identify career domain
    position_history_context = []
    if 'positions_history' in employee and employee['positions_history']:
        for pos in employee.get('positions_history', [])[:3]:
            role_title = pos.get('role_title', pos.get('job_title', ''))
            if role_title:
                position_history_context.append(role_title)
    elif 'employment_history' in employee and employee['employment_history']:
        for pos in employee.get('employment_history', [])[:3]:
            role_title = pos.get('role_title', pos.get('job_title', ''))
            if role_title:
                position_history_context.append(role_title)
    
    # Fallback: use current role if no history available
    if not position_history_context:
        position_history_context = [employee_context['current_role']]
    
    prompt = f"""You are a professional career trajectory analyst for PSA International, a global port operator and logistics company.

CRITICAL INSTRUCTION: You MUST generate a career roadmap that STRICTLY maintains a continuous flow within the employee's CURRENT FUNCTIONAL DOMAIN across ALL 10 years. Domain deviation is ONLY permitted when the employee explicitly demonstrates skills acquired OUTSIDE of their current position history domain (through certifications, projects, or documented cross-functional experience). With this single exception, ALL roles must remain within the established career domain.

=== EMPLOYEE PROFILE ===
Current Role: {employee_context['current_role']}
Department: {employee_context['department']}
Business Unit: {employee_context['unit']}
Years in Current Role: {employee_context['tenure_years']}
Position History (ALL roles held): {', '.join(position_history_context) if position_history_context else employee_context['current_role'] + ' (first role)'}

=== SKILL TAXONOMY & FUNCTIONAL ALIGNMENT ===
Primary Function(s): {', '.join(skill_functions) if skill_functions else 'Infer from current role'}
Skill Specializations: {', '.join(skill_specializations) if skill_specializations else 'Infer from current role'}
Primary Domain Constraint: {employee_context['primary_domains_display']}
Documented External Domain Evidence: {employee_context['external_domains_display']}
All Skills ({employee_context['skills_count']} total): {', '.join(employee_context['all_skills'][:10])}
Competencies: {', '.join([c.get('name', c) if isinstance(c, dict) else str(c) for c in employee_context['competencies']]) if isinstance(employee_context['competencies'], list) else str(employee_context['competencies'])}
Projects Delivered: {employee_context['projects_count']}

=== MANDATORY DOMAIN CONTINUITY CONSTRAINT (STRICT) ===
ABSOLUTE RULE FOR ALL 10 YEARS:
1. EVERY predicted role MUST belong to the SAME functional domain as the employee's position history.
2. Domain deviation is PROHIBITED unless the employee's skills explicitly include competencies acquired OUTSIDE their position history domain AND that evidence is clearly documented in the provided profile.
3. This constraint applies to Year 1 through Year 10, without exception unless the above documented external-skills condition is met.
4. Before predicting ANY role in ANY year: verify it maintains domain continuity with position history. If you cannot verify domain continuity from the provided inputs, choose role = null for that year (no promotion).
5. If suggesting a lateral move, ensure it's to a CLOSELY RELATED area within the same domain (e.g., Treasury → Financial Planning, NOT Treasury → IT).
6. Only predict roles that directly build upon the employee's EXISTING skill taxonomy derived from their position history.

HALLUCINATION PREVENTION (explicit):
- Do NOT invent responsibilities, certifications, projects, or external experience that are not present in the provided employee data.
- If the employee profile lacks explicit evidence that would justify a cross-domain shift, you MUST NOT suggest any cross-domain role.
- If the employee's profile shows partial or ambiguous external skills (e.g., mentions "interest in cloud" but no certification/project), treat this as insufficient evidence for domain deviation and set role = null (or keep within domain).
- If in doubt, prefer conservative domain-consistent progression (role = null or same-domain senior/ lateral) rather than inventing a cross-domain promotion.

EXCEPTION CLAUSE (applies to ALL years):
Domain deviation is ONLY permitted when:
- The employee has documented skills/certifications/projects that were acquired OUTSIDE their position history domain, AND
- These external skills are substantial enough to justify a domain shift (e.g., a Treasury Analyst with completed AWS certifications and documented software projects may shift to IT; an Operations Supervisor with no external technical skills may NOT).
- Before applying the exception, enumerate (internally) the exact piece(s) of evidence from the profile that support the shift. If those exact evidentiary items are absent, do not shift domains.

=== CAREER PATH CONSTRAINTS ===
SCENARIO TYPE: {scenario_descriptions.get(scenario_type, 'balanced career growth')}

Available Next Roles (validated against skills): {', '.join(next_role_titles[:3]) if next_role_titles else 'Progress within current domain'}

PROHIBITED PREDICTIONS (APPLIES TO ALL 10 YEARS):
- Do NOT suggest roles in Information Technology if the employee has no IT background OR no documented external IT skills.
- Do NOT suggest roles in Operations if the employee is in Finance (unless external Operations experience exists).
- Do NOT suggest roles in Engineering if the employee has no technical engineering background OR external engineering credentials.
- Do NOT suggest cross-domain moves unless there is explicit evidence of skills acquired OUTSIDE position history.
- CRITICAL: Do NOT default to "Data Governance Lead" or any IT/Technology role in Year 1–Year 10 for employees in niche operational domains (Terminal Ops, Treasury, Yard Ops, Vessel Ops, Port Engineering, Facilities) unless they possess documented external IT/Data skills.
- For niche domain employees WITHOUT external cross-domain skills: ALL 10 years must progress WITHIN their specialized domain (e.g., Terminal Operations Supervisor → Senior Terminal Operations Supervisor → Terminal Operations Manager → Senior Terminal Operations Manager → Terminal Operations Director).

=== DOMAIN-SPECIFIC CAREER LADDERS ===
(unchanged — keep these ladders exactly as reference for each domain)

FINANCE DOMAIN:
- Analyst → Senior Analyst → Lead Analyst → Assistant Manager → Manager → Senior Manager → Director
- Specialist roles: Treasury Analyst → Senior Treasury Analyst → Treasury Manager → Head of Treasury
- Cross-functional (within Finance): Treasury → Financial Planning → Corporate Finance

OPERATIONS DOMAIN:
- Officer → Senior Officer → Assistant Manager → Manager → Senior Manager → Director
- Specialist: Operations Analyst → Senior Operations Analyst → Operations Manager

TECHNOLOGY DOMAIN:
- Developer → Senior Developer → Tech Lead → Engineering Manager → Director
- Specialist: Analyst → Senior Analyst → Principal Analyst → IT Manager

COMMERCIAL DOMAIN:
- Executive → Senior Executive → Assistant Manager → Manager → Senior Manager
- Specialist: Commercial Analyst → Senior Analyst → Business Development Manager

ENGINEERING DOMAIN:
- Engineer → Senior Engineer → Lead Engineer → Principal Engineer → Engineering Manager

=== TASK ===
Generate a realistic 10-year career roadmap for this employee that STRICTLY maintains continuous domain alignment with their position history across ALL 10 years (unless external skills justify deviation).

VERIFICATION & FALLBACK RULE (must run for each year, and act deterministically):
Before finalizing the role for each year, perform these checks in order:
A. Does the role belong to the same functional domain as the employee's position history? If YES, continue.
B. If NO, does the profile contain explicit documented evidence (certification name + year, project name + description, or prior role) that demonstrates competency OUTSIDE the position history domain? If YES, allow deviation and cite that evidence internally. If NO, set role = null (no promotion) for that year.
C. Do the employee's documented skills support the role's responsibilities? If not, downgrade to role = null or a same-domain lateral/senior role that is supported.
D. For any lateral/senior promotion proposed, ensure at least one skill listed in the employee profile maps directly to the new role's core responsibilities.
E. Do NOT propose a role that relies on an unstated certification or unlisted project. If a role would require such an item, choose role = null.

PROGRESSION GUIDELINES (DOMAIN CONTINUITY MANDATORY):
- Years 1–3: Consolidate current role, develop specialist skills IN THE SAME DOMAIN as position history (NOT in IT, NOT in Data Governance unless external IT skills exist).
- Year 2 SPECIFICALLY: If promoting, use a senior version of current role within the SAME DOMAIN (e.g., "Senior Terminal Operations Supervisor") OR set role = null. NEVER switch to "Data Governance Lead" or any IT role unless explicit external IT skills are documented.
- Years 3–5: First promotion or lateral move WITHIN THE SAME FUNCTIONAL AREA as position history.
- Years 5–7: Mid-level leadership or senior specialist role IN THE SAME DOMAIN as position history.
- Years 7–10: Senior leadership (Manager/Director) or Principal level IN THE SAME DOMAIN as position history.
- Use "role": null for years with no promotion (staying in same position).
- Skills and achievements must be domain-relevant and directly traceable to the employee's documented skill taxonomy and projects.

SELF-VERIFICATION CHECKLIST (apply before finalizing EVERY year) — the model must ensure all are satisfied:
✓ Does this role belong to the same functional domain as the employee's position history?
✓ If this is a domain deviation, does the employee have documented skills acquired OUTSIDE their position history domain?
✓ Do the employee's skills from their position history support this role?
✓ Is this a logical progression from their current position within the same domain?
✓ Are the achievements realistic for this specific department?
✓ Have I maintained domain continuity from Year 1 through Year 10?

OUTPUT FORMAT (STRICT):
Return ONLY valid JSON (no markdown, no code blocks, no explanations). The JSON MUST include 10 year entries exactly named "year_1" through "year_10". Each year must follow this structure:

{{
  "year_X": {{
    "role": (string role title within domain or null),
    "skills": ["Skill relevant to current domain", "Another domain-specific skill"],
    "achievement": "Achievement realistic for this department and role level"
  }}
}}

ADDITIONAL ANTI-HALLUCINATION EXAMPLES (do not output these — follow them internally):
- Bad (hallucination): Year 2 = "Data Governance Lead" for a Terminal Ops Supervisor with no IT skills — REJECT.
- Good: Year 2 = "Senior Terminal Operations Supervisor" or role = null if insufficient evidence.

EXAMPLES (unchanged; use as formatting and domain-guidance reference):

FINANCE/TREASURY EXAMPLE:
{{
  "year_1": {{
    "role": null,
    "skills": ["Cash Flow Forecasting", "FX Risk Management"],
    "achievement": "Automated daily liquidity reporting, reducing manual work by 40%"
  }},
  "year_2": {{
    "role": "Senior Treasury Analyst",
    "skills": ["Debt Management", "Working Capital Optimization"],
    "achievement": "Led bank relationship review, securing $5M credit facility at 0.5% lower rate"
  }},
  "year_3": {{
    "role": null,
    "skills": ["Treasury Policy Development", "Compliance"],
    "achievement": "Implemented new FX hedging policy reducing currency exposure by 25%"
  }}
}}

TERMINAL OPERATIONS EXAMPLE:
{{
  "year_1": {{
    "role": null,
    "skills": ["Advanced Yard Planning", "Vessel Scheduling Optimization"],
    "achievement": "Reduced vessel turnaround time by 12% through improved yard allocation strategies"
  }},
  "year_2": {{
    "role": "Senior Terminal Operations Supervisor",
    "skills": ["Multi-terminal Coordination", "Safety Protocol Management"],
    "achievement": "Led cross-shift coordination initiative improving berth productivity by 15%"
  }},
  "year_3": {{
    "role": null,
    "skills": ["Resource Planning", "Operational KPI Management"],
    "achievement": "Implemented real-time tracking system reducing equipment idle time by 20%"
  }}
}}

CRITICAL REMINDER FOR ALL 10 YEARS (ESPECIALLY YEAR 2):
- If employee's position history is Terminal Operations → ALL years including Year 2 should progress within Terminal Operations domain (e.g., "Senior Terminal Operations Supervisor") or null, NOT "Data Governance Lead" unless external IT skills documented.
- If employee's position history is Treasury → ALL years including Year 2 should progress within Finance domain (e.g., "Senior Treasury Analyst") or null, NOT "Data Governance Lead" unless external IT skills documented.
- If employee's position history is Yard Operations → ALL years including Year 2 should progress within Operations domain (e.g., "Senior Yard Operations Officer") or null, NOT "Data Governance Lead" unless external IT skills documented.
- NEVER predict "Data Governance Lead", "Senior Cloud Architect", or any IT role in ANY of the 10 years unless employee's position history shows IT/Technology background OR they have documented skills acquired outside their position history domain.

NOW GENERATE THE 10-YEAR ROADMAP. Remember: MAINTAIN STRICT DOMAIN CONTINUITY WITH POSITION HISTORY ACROSS ALL 10 YEARS. Domain deviation is ONLY allowed when external skills outside position history domain are documented.
"""

    try:
        print(f"🤖 Calling Azure OpenAI for {scenario_type} career trajectory simulation...")
        print(f"   Deployment: {AZURE_CHAT_DEPLOYMENT}")
        print(f"   Employee: {employee_context['current_role']} in {employee_context['department']}")
        
        # Call Azure OpenAI - gpt-5-mini is a reasoning model with different parameters
        # Reasoning models (o1-series) use max_completion_tokens instead of max_tokens
        # and don't support temperature or response_format parameters
        response = azure_client.chat.completions.create(
            model=AZURE_CHAT_DEPLOYMENT,
            messages=[
                {
                    "role": "user", 
                    "content": f"You are a career trajectory analyst. Generate a valid JSON response only (no markdown, no explanations).\n\n{prompt}"
                }
            ],
            max_completion_tokens=4000  # Reasoning models use max_completion_tokens
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        print(f"🤖 AI Response for {scenario_type}:")
        print(f"First 200 chars: {ai_response[:200]}")
        
        # Enhanced JSON extraction with multiple strategies
        ai_predictions = None
        try:
            # Strategy 1: Try direct JSON parse (if AI returned clean JSON)
            ai_predictions = json.loads(ai_response)
            print("✅ Clean JSON parsed successfully")
        except json.JSONDecodeError:
            # Strategy 2: Extract JSON from markdown code blocks
            try:
                import re
                # Remove markdown code blocks
                clean_response = re.sub(r'```(?:json)?\n?', '', ai_response)
                clean_response = clean_response.strip()
                
                # Try parsing cleaned response
                ai_predictions = json.loads(clean_response)
                print("✅ JSON extracted from markdown")
            except json.JSONDecodeError:
                # Strategy 3: Find JSON object with regex
                try:
                    json_pattern = r'\{[\s\S]*"year_1"[\s\S]*\}'
                    json_match = re.search(json_pattern, ai_response)
                    if json_match:
                        ai_predictions = json.loads(json_match.group())
                        print("✅ JSON extracted via regex")
                except Exception as regex_error:
                    print(f"⚠️ All JSON extraction strategies failed: {regex_error}")
        
        # If we successfully extracted AI predictions, apply them to milestones
        if ai_predictions:
            print(f"📊 Applying {len(ai_predictions)} year predictions to milestones")
            enhanced_count = 0
            
            for milestone in base_simulation['milestones']:
                year_key = f"year_{milestone['year']}"
                if year_key in ai_predictions:
                    ai_year = ai_predictions[year_key]
                    
                    # Validate AI data structure
                    if not isinstance(ai_year, dict):
                        continue
                    
                    # Update role (only if not null/None)
                    if ai_year.get('role') and str(ai_year.get('role')).lower() not in ['null', 'none']:
                        milestone['role'] = ai_year['role']
                        milestone['department'] = employee_context['department']
                        milestone['level'] = get_role_level(ai_year['role'])
                    
                    # Add skills (ensure it's a list)
                    if ai_year.get('skills'):
                        skills = ai_year['skills']
                        if isinstance(skills, list) and len(skills) > 0:
                            milestone['skills_acquired'] = skills[:5]  # Max 5 skills
                    
                    # Add achievement (ensure it's a string)
                    if ai_year.get('achievement'):
                        achievement = str(ai_year['achievement']).strip()
                        if achievement and achievement.lower() != 'null':
                            milestone['achievement'] = achievement
                            milestone['competency_growth'] = [
                                {
                                    'competency': 'Leadership' if 'led' in achievement.lower() or 'managed' in achievement.lower() else 'Technical',
                                    'growth': 'high',
                                    'description': achievement
                                }
                            ]
                    
                    enhanced_count += 1
            
            print(f"✅ Enhanced {enhanced_count}/{len(base_simulation['milestones'])} milestones with AI data")
        else:
            print("⚠️ No AI predictions extracted - using base simulation")
            print(f"Raw AI response: {ai_response[:500]}")
        
    except Exception as e:
        print(f"⚠️ AI simulation error: {type(e).__name__}: {e}")
        if hasattr(e, 'response'):
            print(f"   Error response: {e.response}")
        if hasattr(e, 'status_code'):
            print(f"   Status code: {e.status_code}")
        print(f"   Deployment used: {AZURE_CHAT_DEPLOYMENT}")
        print(f"   Endpoint: {AZURE_ENDPOINT}")
        print("   Falling back to rule-based simulation...")
        # Fallback to base simulation
    
    return base_simulation


def simulate_career_path(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    scenario_type: str,
    years: int = 10
) -> Dict[str, Any]:
    """
    Simulate career progression over N years based on scenario
    
    Returns detailed year-by-year progression
    """
    current_date = datetime.now()
    simulated_path = {
        'scenario': scenario_type,
        'years_simulated': years,
        'milestones': [],
        'predicted_roles': [],
        'skill_development': [],
        'promotion_probability': calculate_promotion_probability(employee, scenario_type),
        'salary_growth_estimate': estimate_salary_growth(employee, scenario_type, years),
        'success_probability': 0.0
    }
    
    domain_profile = extract_domain_profile(employee)
    current_role = employee['employment_info']['job_title']
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    tenure = calculate_tenure(employee['employment_info']['in_role_since'])
    no_progression_message = NO_DOMAIN_PROGRESSION_MESSAGE
    
    for year in range(1, years + 1):
        milestone = {
            'year': year,
            'projected_date': (current_date + timedelta(days=365*year)).isoformat(),
            'role': None,
            'skills_acquired': [],
            'competency_growth': [],
            'department': None,
            'level': None
        }
        attempted_progression = False
        
        if scenario_type == "aggressive_growth":
            # Promotion every 1.5-2 years
            if year % 2 == 0 or (year % 2 == 1 and year > 3):
                attempted_progression = True
                next_role = find_promotion_role(
                    employee,
                    all_roles,
                    current_role,
                    years_experienced=tenure + year,
                    domain_profile=domain_profile
                )
                if next_role:
                    milestone['role'] = next_role['title']
                    milestone['department'] = next_role.get('department')
                    milestone['level'] = get_role_level(next_role['title'])
                    current_role = next_role['title']
                    milestone['skills_acquired'] = next_role.get('required_skills', [])
                else:
                    milestone['role'] = no_progression_message
                    milestone['skills_acquired'] = generate_skill_deepening(employee['skills'])
        
        elif scenario_type == "steady_growth":
            # Promotion every 2-3 years
            if year % 3 == 0 or year == 2:
                attempted_progression = True
                next_role = find_promotion_role(
                    employee,
                    all_roles,
                    current_role,
                    years_experienced=tenure + year,
                    domain_profile=domain_profile
                )
                if next_role:
                    milestone['role'] = next_role['title']
                    milestone['department'] = next_role.get('department')
                    milestone['level'] = get_role_level(next_role['title'])
                    current_role = next_role['title']
                    milestone['skills_acquired'] = next_role.get('required_skills', [])
                else:
                    milestone['role'] = no_progression_message
                    milestone['skills_acquired'] = generate_skill_deepening(employee['skills'])
        
        elif scenario_type == "lateral_mobility":
            # Cross-functional moves every 2-2.5 years
            if year == 2 or year == 5 or year == 8:
                attempted_progression = True
                lateral_role = find_lateral_role(
                    employee,
                    all_roles,
                    current_role,
                    domain_profile=domain_profile,
                    allow_external=domain_profile.get('has_external_evidence', False)
                )
                if lateral_role:
                    milestone['role'] = lateral_role['title']
                    milestone['department'] = lateral_role.get('department')
                    milestone['skills_acquired'] = lateral_role.get('required_skills', [])
                    milestone['level'] = get_role_level(lateral_role['title'])
                    current_role = lateral_role['title']
                else:
                    milestone['role'] = no_progression_message
                    milestone['skills_acquired'] = generate_skill_deepening(employee['skills'])
        
        elif scenario_type == "specialization":
            # Stay in domain, become expert, potential manager in year 5-7
            if year >= 5 and year % 2 == 1:
                attempted_progression = True
                expert_role = find_expert_role(
                    employee,
                    all_roles,
                    current_role,
                    domain_profile=domain_profile
                )
                if expert_role:
                    milestone['role'] = expert_role['title']
                    milestone['skills_acquired'] = expert_role.get('required_skills', [])
                    milestone['department'] = expert_role.get('department')
                    milestone['level'] = get_role_level(expert_role['title'])
                    current_role = expert_role['title']
                else:
                    milestone['role'] = no_progression_message
                    milestone['skills_acquired'] = generate_skill_deepening(employee['skills'])
            else:
                # Deepen expertise in current domain
                milestone['skills_acquired'] = generate_skill_deepening(employee['skills'])

        # Ensure domain continuity message is present when progression was attempted but blocked
        if attempted_progression and milestone['role'] is None:
            milestone['role'] = no_progression_message
            if not milestone['skills_acquired']:
                milestone['skills_acquired'] = generate_skill_deepening(employee['skills'])
        
        if not milestone['skills_acquired']:
            milestone['skills_acquired'] = generate_skill_deepening(employee['skills'])
        
        milestone['competency_growth'] = generate_competency_growth(scenario_type, year)
        simulated_path['milestones'].append(milestone)
    
    # Calculate success probability based on scenario fit
    simulated_path['success_probability'] = calculate_success_probability(
        employee, scenario_type, simulated_path
    )
    
    return simulated_path


def find_next_roles(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    years: int = 2,
    domain_profile: Optional[Dict[str, Any]] = None,
    allow_external: bool = False
) -> List[Dict[str, Any]]:
    """
    Find logical next roles based on current position and skills
    """
    domain_profile = domain_profile or extract_domain_profile(employee)
    current_title = employee['employment_info']['job_title']
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    
    next_roles = []
    
    for role in all_roles:
        # Skip current role
        if role['title'] == current_title:
            continue
        
        if not role_domain_allowed(role, domain_profile, allow_external=allow_external):
            continue
        
        # Calculate skill match for this role
        required_skills = set(role.get('required_skills', []))
        skill_match = len(current_skills & required_skills) / len(required_skills) if required_skills else 0
        
        # If skill match > 70%, it's a viable next role
        if skill_match >= 0.7:
            next_roles.append({
                'title': role['title'],
                'department': role.get('department'),
                'location': role.get('location'),
                'required_skills': list(required_skills),
                'skill_match': skill_match,
                'skills_to_acquire': list(required_skills - current_skills),
                'estimated_time_to_ready': estimate_readiness_time(
                    len(required_skills - current_skills)
                )
            })
    
    # Sort by skill match and return top candidates
    next_roles.sort(key=lambda x: x['skill_match'], reverse=True)
    return next_roles[:3]  # Return top 3 candidates


def identify_skills_gaps(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    domain_profile: Optional[Dict[str, Any]] = None,
    allow_external: bool = False
) -> List[Dict[str, Any]]:
    """
    Identify skills gaps needed for progression
    """
    domain_profile = domain_profile or extract_domain_profile(employee)
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    
    # Collect all required skills from potential next roles
    next_roles = find_next_roles(
        employee,
        all_roles,
        domain_profile=domain_profile,
        allow_external=allow_external
    )
    all_required_skills = set()
    
    for role in next_roles:
        all_required_skills.update(role.get('required_skills', []))
    
    gaps = []
    for skill in all_required_skills:
        if skill not in current_skills:
            gaps.append({
                'skill': skill,
                'priority': 'high' if skill in ['Leadership', 'Strategy', 'Decision Making'] else 'medium',
                'estimated_months_to_learn': estimate_learning_time(skill),
                'recommended_resources': ['Coursera', 'Internal Training', 'Mentorship', 'On-the-job']
            })
    
    return sorted(gaps, key=lambda x: x['priority'] == 'high', reverse=True)


def find_promotion_role(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    current_role: str,
    years_experienced: int,
    domain_profile: Optional[Dict[str, Any]] = None,
    allow_external: bool = False
) -> Dict[str, Any]:
    """Find next level promotion role"""
    domain_profile = domain_profile or extract_domain_profile(employee)
    current_level = get_role_level(current_role)
    next_level = current_level + 1
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    best_match = -1.0
    best_role = None
    
    for role in all_roles:
        if get_role_level(role['title']) != next_level:
            continue
        if not role_domain_allowed(role, domain_profile, allow_external=allow_external):
            continue
        required_experience = max(2, role.get('min_experience_years', 0))
        if years_experienced < required_experience:
            continue
        required_skills = set(role.get('required_skills', []))
        skill_match = (
            len(current_skills & required_skills) / len(required_skills)
            if required_skills else 0
        )
        if skill_match > best_match:
            best_match = skill_match
            best_role = role
    
    return best_role


def find_lateral_role(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    current_role: str,
    domain_profile: Optional[Dict[str, Any]] = None,
    allow_external: bool = False
) -> Optional[Dict[str, Any]]:
    """Find cross-functional lateral move"""
    domain_profile = domain_profile or extract_domain_profile(employee)
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    primary_domains = set(domain_profile.get('primary_domains', set()))
    external_domains = set(domain_profile.get('external_domains', set())) if allow_external else set()
    
    primary_candidates: List[Tuple[int, Dict[str, Any]]] = []
    external_candidates: List[Tuple[int, Dict[str, Any]]] = []
    
    for role in all_roles:
        if role.get('title') == current_role:
            continue
        required_skills = set(role.get('required_skills', []))
        overlap = len(required_skills & current_skills)
        if overlap < 3:
            continue
        role_domain = derive_role_domain(role)
        if role_domain in primary_domains:
            primary_candidates.append((overlap, role))
        elif role_domain in external_domains:
            external_candidates.append((overlap, role))
    
    if primary_candidates:
        primary_candidates.sort(key=lambda item: item[0], reverse=True)
        return primary_candidates[0][1]
    if allow_external and external_candidates:
        external_candidates.sort(key=lambda item: item[0], reverse=True)
        return external_candidates[0][1]
    
    return None


def find_expert_role(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    current_role: str,
    domain_profile: Optional[Dict[str, Any]] = None,
    allow_external: bool = False
) -> Optional[Dict[str, Any]]:
    """Find expert/principal level role in same domain"""
    domain_profile = domain_profile or extract_domain_profile(employee)
    candidate_roles: List[Tuple[int, Dict[str, Any]]] = []
    
    for role in all_roles:
        if role.get('title') == current_role:
            continue
        if not role_domain_allowed(role, domain_profile, allow_external=allow_external):
            continue
        title = role.get('title', '')
        if any(keyword in title for keyword in ('Expert', 'Principal', 'Lead', 'Specialist')):
            candidate_roles.append((get_role_level(title), role))
    
    if candidate_roles:
        candidate_roles.sort(key=lambda item: item[0], reverse=True)
        return candidate_roles[0][1]
    
    return None


def analyze_career_anchors(employee: Dict[str, Any]) -> List[str]:
    """
    Analyze career anchors - what drives this employee's career
    Based on positions, skills, and experiences
    """
    anchors = []
    
    # Check expertise focus
    skills_count = len(employee['skills'])
    if skills_count > 10:
        anchors.append('Technical Expertise')
    
    # Check project involvement
    projects = employee.get('projects', [])
    if any('leadership' in str(p).lower() for p in projects):
        anchors.append('Leadership')
    
    # Check cross-functional experience
    if employee['employment_info'].get('unit') != 'Operations':
        anchors.append('Versatility')
    
    if not anchors:
        anchors.append('Stability and Security')
    
    return anchors


def calculate_tenure(in_role_since) -> int:
    """Calculate years in current role"""
    if not in_role_since:
        return 0
    from datetime import datetime
    
    # Convert string date to date object if needed
    if isinstance(in_role_since, str):
        try:
            # Try parsing ISO format first (YYYY-MM-DD)
            in_role_since = datetime.fromisoformat(in_role_since).date()
        except (ValueError, AttributeError):
            try:
                # Try other common formats
                in_role_since = datetime.strptime(in_role_since, "%Y-%m-%d").date()
            except ValueError:
                # If parsing fails, return 0
                return 0
    
    tenure = (datetime.now().date() - in_role_since).days / 365.25
    return int(tenure)


def count_skills(skills: List[Dict[str, str]]) -> int:
    """Count total skills"""
    return len(skills) if skills else 0


def extract_achievements(employee: Dict[str, Any]) -> List[str]:
    """Extract key achievements from projects"""
    projects = employee.get('projects', [])
    achievements = [p.get('title', 'Project') for p in projects[:3]] if projects else []
    return achievements


def calculate_promotion_probability(employee: Dict[str, Any], scenario_type: str) -> float:
    """Calculate probability of promotion in given scenario"""
    tenure = calculate_tenure(employee['employment_info']['in_role_since'])
    
    if scenario_type == "aggressive_growth":
        return 0.8 if tenure >= 1 else 0.5
    elif scenario_type == "steady_growth":
        return 0.6 if tenure >= 2 else 0.3
    elif scenario_type == "lateral_mobility":
        return 0.7  # Same probability as steady but lateral
    else:  # specialization
        return 0.4  # Lower promotion probability, focus on expertise
    
    return 0.5


def estimate_salary_growth(employee: Dict[str, Any], scenario_type: str, years: int) -> Dict[str, Any]:
    """Estimate salary growth over years"""
    # Baseline assumptions (in percentages)
    annual_growth = {
        "aggressive_growth": 0.08,      # 8% annual
        "steady_growth": 0.05,          # 5% annual
        "lateral_mobility": 0.04,       # 4% annual
        "specialization": 0.06          # 6% annual
    }
    
    growth_rate = annual_growth.get(scenario_type, 0.05)
    estimated_multiplier = (1 + growth_rate) ** years
    
    return {
        'annual_growth_rate': f"{growth_rate*100}%",
        'total_growth_multiplier': f"{estimated_multiplier:.2f}x",
        'years': years,
        'notes': f'Estimated {growth_rate*100}% annual growth over {years} years'
    }


def get_role_level(role_title: str) -> int:
    """Determine role level from title"""
    if 'Executive' in role_title or 'C-Level' in role_title or 'VP' in role_title:
        return 5
    elif 'Senior' in role_title or 'Manager' in role_title:
        return 3
    elif 'Lead' in role_title or 'Specialist' in role_title:
        return 2
    else:
        return 1


def generate_skill_deepening(current_skills: List[Dict[str, str]]) -> List[str]:
    """Generate deepened skills from current skill set"""
    return [skill.get('skill_name', 'Unknown') for skill in current_skills[:5]]


def generate_competency_growth(scenario_type: str, year: int) -> List[Dict[str, Any]]:
    """Generate competency growth for this year"""
    competencies = {
        "aggressive_growth": [
            {'competency': 'Strategic Thinking', 'growth': 'high'},
            {'competency': 'Leadership', 'growth': 'high' if year >= 2 else 'medium'}
        ],
        "steady_growth": [
            {'competency': 'Expertise', 'growth': 'high'},
            {'competency': 'Collaboration', 'growth': 'medium'}
        ],
        "lateral_mobility": [
            {'competency': 'Adaptability', 'growth': 'high'},
            {'competency': 'Learning Agility', 'growth': 'high'}
        ],
        "specialization": [
            {'competency': 'Domain Expertise', 'growth': 'high'},
            {'competency': 'Problem Solving', 'growth': 'high'}
        ]
    }
    
    return competencies.get(scenario_type, [])


def calculate_success_probability(employee: Dict[str, Any], scenario_type: str, path: Dict[str, Any]) -> float:
    """
    Estimate the probability that the employee can successfully realise the simulated scenario.
    Combines baseline readiness, domain continuity, progression cadence, and scenario-specific fit.
    """
    metrics = evaluate_path_metrics(employee, path)
    total_years = metrics['total_years'] or 1
    progression_ratio = metrics['progression_ratio']
    blocked_ratio = metrics['blocked_ratio']
    domain_consistency = metrics['domain_consistency']
    skill_alignment = metrics['skill_alignment']
    forward_moves = metrics['forward_moves']
    lateral_moves = metrics['lateral_moves']
    max_level_gain = metrics['max_level_gain']
    valid_years = metrics['valid_years'] or 1
    
    employee_skills = set(skill.get('skill_name', '') for skill in employee.get('skills', []))
    tenure = calculate_tenure(employee['employment_info']['in_role_since'])
    
    score = 0.2  # baseline confidence
    
    # Employee readiness
    skill_depth = min(len(employee_skills) / 12.0, 1.0)
    score += 0.1 * skill_depth
    score += 0.05 * min(tenure / 5.0, 1.0)
    
    # Path quality
    score += 0.25 * domain_consistency
    score += 0.2 * progression_ratio
    score += 0.15 * skill_alignment
    score += 0.05 * min(max_level_gain / 3.0, 1.0)
    score -= 0.15 * blocked_ratio
    
    # Scenario-specific alignment
    if scenario_type == "aggressive_growth":
        promotion_intensity = min(forward_moves / valid_years, 1.0)
        score += 0.15 * promotion_intensity
        score += 0.05 * min(max_level_gain / 3.0, 1.0)
    elif scenario_type == "steady_growth":
        steady_progress = 0.6 * progression_ratio + 0.4 * min(max_level_gain / 2.0, 1.0)
        score += 0.12 * steady_progress
    elif scenario_type == "lateral_mobility":
        lateral_ratio = min(lateral_moves / valid_years, 1.0)
        score += 0.15 * lateral_ratio
        score += 0.05 * (1 - min(forward_moves / valid_years, 1.0))
    elif scenario_type == "specialization":
        lateral_ratio = min(lateral_moves / valid_years, 1.0)
        score += 0.15 * skill_alignment
        score += 0.05 * (1 - lateral_ratio)
    
    # Penalties for inconsistent progress
    score -= 0.05 * min(metrics['downward_moves'] / valid_years, 1.0)
    
    return max(0.05, min(score, 0.95))


def determine_optimal_path(scenarios: Dict[str, Dict[str, Any]]) -> str:
    """Determine which scenario is most optimal based on success probability"""
    best_scenario = None
    best_probability = 0
    
    for scenario_name, scenario_data in scenarios.items():
        if scenario_data['success_probability'] > best_probability:
            best_probability = scenario_data['success_probability']
            best_scenario = scenario_name
    
    return best_scenario or "steady_growth"


def identify_risks(employee: Dict[str, Any], predictions: Dict[str, Any]) -> List[Dict[str, str]]:
    """Identify risk factors in career progression"""
    risks = []
    tenure = calculate_tenure(employee['employment_info']['in_role_since'])
    
    # Risk 1: Long tenure in current role
    if tenure > 5:
        risks.append({
            'risk': 'Extended Tenure',
            'severity': 'medium',
            'description': 'Long time in current role may indicate lack of progression',
            'mitigation': 'Explore lateral moves or specialist roles'
        })
    
    # Risk 2: Skill gaps
    current_skills = len(employee['skills'])
    if current_skills < 5:
        risks.append({
            'risk': 'Narrow Skill Set',
            'severity': 'high',
            'description': 'Limited skills may restrict career options',
            'mitigation': 'Invest in upskilling and cross-functional training'
        })
    
    # Risk 3: Stagnation indicators
    positions_history = employee.get('positions_history', [])
    if len(positions_history) <= 2:
        risks.append({
            'risk': 'Limited Career Movement',
            'severity': 'medium',
            'description': 'Few role transitions may indicate stagnation',
            'mitigation': 'Pursue development opportunities and mentor relationships'
        })
    
    return risks


def identify_retention_factors(employee: Dict[str, Any]) -> Dict[str, List[str]]:
    """Identify factors that support employee retention"""
    return {
        'strengths': [
            'Clear career progression opportunities',
            'Skill development potential',
            'Multiple career path options'
        ],
        'development_areas': [
            'Cross-functional experience',
            'Leadership capabilities',
            'Industry certification'
        ],
        'retention_strategies': [
            'Personalized development plan',
            'Regular career conversations',
            'Mentorship from senior leaders',
            'Project-based learning opportunities'
        ]
    }


def estimate_readiness_time(missing_skills_count: int) -> str:
    """Estimate time to be ready for a role"""
    if missing_skills_count == 0:
        return 'Ready now'
    elif missing_skills_count <= 2:
        return '3-6 months'
    elif missing_skills_count <= 4:
        return '6-12 months'
    else:
        return '12-18 months'


def estimate_learning_time(skill: str) -> int:
    """Estimate months to learn a new skill"""
    skill_learning_times = {
        'Leadership': 12,
        'Strategy': 9,
        'Data Analysis': 6,
        'Technical Skills': 6,
        'Communication': 3,
        'Project Management': 4
    }
    
    for skill_type, months in skill_learning_times.items():
        if skill_type.lower() in skill.lower():
            return months
    
    return 6  # Default 6 months
