"""
Career Roadmap Generation and Simulation Engine
- Current roadmap for all users
- Predicted roadmap with simulations for admins
- AI-powered predictions using Azure OpenAI
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import json
import random
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

# Load Azure OpenAI credentials
load_dotenv()
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_API_VERSION = "2025-01-01-preview"

# Initialize Azure OpenAI client
azure_client = None
if AZURE_API_KEY and AZURE_ENDPOINT:
    azure_client = AzureOpenAI(
        api_key=AZURE_API_KEY,
        azure_endpoint=AZURE_ENDPOINT,
        api_version=AZURE_API_VERSION,
        default_headers={"Ocp-Apim-Subscription-Key": AZURE_API_KEY}
    )

def calculate_current_roadmap(employee: Dict[str, Any], all_roles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate current career roadmap based on:
    - Current role and tenure
    - Skills and competencies
    - Career history
    - Position in organization
    
    Returns roadmap for next 2-3 years based on current trajectory
    """
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
        'next_logical_roles': find_next_roles(employee, all_roles, years=2),
        'skills_to_develop': identify_skills_gaps(employee, all_roles),
        'timeline': {
            'current': datetime.now().isoformat(),
            'next_milestone': (datetime.now() + timedelta(days=365)).isoformat(),
            'estimated_progression': '1-2 years in current role, then step up'
        },
        'career_anchors': analyze_career_anchors(employee)
    }
    
    return current_roadmap


def calculate_predicted_roadmap_with_simulations(
    employee: Dict[str, Any],
    all_roles: List[Dict[str, Any]],
    scenarios: List[str] = None
) -> Dict[str, Any]:
    """
    For ADMIN ONLY: Calculate predicted roadmap using multiple simulation scenarios
    Uses Azure OpenAI to generate AI-powered predictions
    
    Scenarios:
    - "aggressive_growth": Fast-track progression
    - "steady_growth": Normal career progression  
    - "lateral_mobility": Cross-functional moves
    - "specialization": Deep expertise in domain
    """
    
    if scenarios is None:
        scenarios = ["steady_growth", "aggressive_growth", "lateral_mobility", "specialization"]
    
    predictions = {
        'employee_id': employee['employee_id'],
        'analysis_date': datetime.now().isoformat(),
        'scenarios': {}
    }
    
    # Use AI to generate enhanced predictions if available
    if azure_client:
        for scenario in scenarios:
            predictions['scenarios'][scenario] = simulate_career_path_with_ai(
                employee, 
                all_roles, 
                scenario_type=scenario
            )
    else:
        # Fallback to rule-based simulation
        for scenario in scenarios:
            predictions['scenarios'][scenario] = simulate_career_path(
                employee, 
                all_roles, 
                scenario_type=scenario
            )
    
    # Add cross-scenario analysis
    predictions['optimal_path'] = determine_optimal_path(predictions['scenarios'])
    predictions['risk_factors'] = identify_risks(employee, predictions)
    predictions['retention_factors'] = identify_retention_factors(employee)
    
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
    
    # Prepare employee context for AI
    employee_context = {
        'current_role': employee['employment_info']['job_title'],
        'department': employee['employment_info']['department'],
        'tenure_years': calculate_tenure(employee['employment_info']['in_role_since']),
        'skills_count': len(employee['skills']),
        'top_skills': [s['skill_name'] for s in employee['skills'][:5]],
        'competencies': employee.get('competencies', {}),
        'projects_count': len(employee.get('projects', []))
    }
    
    # Get available next roles
    next_roles = find_next_roles(employee, all_roles, years=5)
    next_role_titles = [role['title'] for role in next_roles[:5]]
    
    # Prepare prompt for AI
    scenario_descriptions = {
        'aggressive_growth': 'fast promotions every 1-2 years, targeting leadership roles, high visibility projects',
        'steady_growth': 'stable progression every 2-3 years, balanced growth, gradual advancement',
        'lateral_mobility': 'cross-functional moves, diverse experience, exploring different departments',
        'specialization': 'deep technical expertise, becoming domain expert, principal/architect level'
    }
    
    prompt = f"""You are a career trajectory analyst. Generate a precise 10-year career roadmap for graphical visualization.

EMPLOYEE PROFILE:
- Current Role: {employee_context['current_role']}
- Department: {employee_context['department']}
- Years in Role: {employee_context['tenure_years']}
- Core Skills: {', '.join(employee_context['top_skills'][:3])}
- Projects Delivered: {employee_context['projects_count']}

AVAILABLE CAREER PATHS: {', '.join(next_role_titles[:3])}

SCENARIO: {scenario_descriptions.get(scenario_type, '')}

INSTRUCTIONS:
1. Create a 10-year progression showing DIFFERENT milestones each year
2. Years 1-3: Skill building in current role
3. Years 4-6: Mid-career advancement (promotions/lateral moves)
4. Years 7-10: Senior leadership or specialization
5. Each year MUST have unique role/skills/achievement
6. Use null for role only if no promotion that year

OUTPUT FORMAT - Return ONLY this JSON structure (no markdown, no code blocks):
{{
  "year_1": {{
    "role": "Senior Software Engineer",
    "skills": ["Advanced Python", "System Design"],
    "achievement": "Led migration project reducing costs by 30%"
  }},
  "year_2": {{
    "role": null,
    "skills": ["Machine Learning", "AWS Architecture"],
    "achievement": "Implemented ML pipeline processing 1M records/day"
  }},
  "year_3": {{
    "role": "Tech Lead",
    "skills": ["Team Leadership", "Agile Coaching"],
    "achievement": "Managed team of 5 engineers delivering 3 major releases"
  }},
  "year_4": {{
    "role": null,
    "skills": ["Strategic Planning", "Budget Management"],
    "achievement": "Optimized development process, improving velocity 40%"
  }},
  "year_5": {{
    "role": "Engineering Manager",
    "skills": ["Cross-team Collaboration", "Hiring"],
    "achievement": "Grew team from 5 to 15 engineers while maintaining quality"
  }},
  "year_6": {{
    "role": null,
    "skills": ["Product Strategy", "Stakeholder Management"],
    "achievement": "Launched 2 new product lines generating $5M revenue"
  }},
  "year_7": {{
    "role": "Senior Engineering Manager",
    "skills": ["Organizational Design", "Mentorship"],
    "achievement": "Established engineering practices adopted company-wide"
  }},
  "year_8": {{
    "role": null,
    "skills": ["Business Acumen", "Change Management"],
    "achievement": "Led digital transformation initiative across 3 departments"
  }},
  "year_9": {{
    "role": "Director of Engineering",
    "skills": ["Executive Communication", "Vision Setting"],
    "achievement": "Defined 3-year technical roadmap aligned with business goals"
  }},
  "year_10": {{
    "role": null,
    "skills": ["Board Presentations", "Industry Thought Leadership"],
    "achievement": "Positioned company as innovation leader through conference talks"
  }}
}}

CRITICAL: Each year must show clear progression and be completely different from others!
"""

    try:
        # Call Azure OpenAI with JSON mode for structured output
        response = azure_client.chat.completions.create(
            model="gpt-4o-mini",  # Use the deployment name
            messages=[
                {
                    "role": "system", 
                    "content": "You are a career trajectory analyst. Always respond with valid JSON only, no markdown or explanations."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2500,
            response_format={"type": "json_object"}  # Force JSON output
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
        print(f"⚠️ AI simulation error: {e}")
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
    
    current_role = employee['employment_info']['job_title']
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    tenure = calculate_tenure(employee['employment_info']['in_role_since'])
    
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
        
        if scenario_type == "aggressive_growth":
            # Promotion every 1.5-2 years
            if year % 2 == 0 or (year % 2 == 1 and year > 3):
                next_role = find_promotion_role(
                    employee, all_roles, current_role, years_experienced=tenure + year
                )
                if next_role:
                    milestone['role'] = next_role['title']
                    milestone['department'] = next_role.get('department')
                    milestone['level'] = get_role_level(next_role['title'])
                    current_role = next_role['title']
                    milestone['skills_acquired'] = next_role.get('required_skills', [])
        
        elif scenario_type == "steady_growth":
            # Promotion every 2-3 years
            if year % 3 == 0 or year == 2:
                next_role = find_promotion_role(
                    employee, all_roles, current_role, years_experienced=tenure + year
                )
                if next_role:
                    milestone['role'] = next_role['title']
                    milestone['department'] = next_role.get('department')
                    milestone['level'] = get_role_level(next_role['title'])
                    current_role = next_role['title']
                    milestone['skills_acquired'] = next_role.get('required_skills', [])
        
        elif scenario_type == "lateral_mobility":
            # Cross-functional moves every 2-2.5 years
            if year == 2 or year == 5 or year == 8:
                lateral_role = find_lateral_role(employee, all_roles, current_role)
                if lateral_role:
                    milestone['role'] = lateral_role['title']
                    milestone['department'] = lateral_role.get('department')
                    milestone['skills_acquired'] = lateral_role.get('required_skills', [])
        
        elif scenario_type == "specialization":
            # Stay in domain, become expert, potential manager in year 5-7
            if year >= 5 and year % 2 == 1:
                expert_role = find_expert_role(employee, all_roles, current_role)
                if expert_role:
                    milestone['role'] = expert_role['title']
                    milestone['skills_acquired'] = expert_role.get('required_skills', [])
            else:
                # Deepen expertise in current domain
                milestone['skills_acquired'] = generate_skill_deepening(employee['skills'])
        
        milestone['competency_growth'] = generate_competency_growth(scenario_type, year)
        simulated_path['milestones'].append(milestone)
    
    # Calculate success probability based on scenario fit
    simulated_path['success_probability'] = calculate_success_probability(
        employee, scenario_type, simulated_path
    )
    
    return simulated_path


def find_next_roles(employee: Dict[str, Any], all_roles: List[Dict[str, Any]], years: int = 2) -> List[Dict[str, Any]]:
    """
    Find logical next roles based on current position and skills
    """
    current_title = employee['employment_info']['job_title']
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    
    next_roles = []
    
    for role in all_roles:
        # Skip current role
        if role['title'] == current_title:
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
                'skill_match': skill_match,
                'skills_to_acquire': list(required_skills - current_skills),
                'estimated_time_to_ready': estimate_readiness_time(
                    len(required_skills - current_skills)
                )
            })
    
    # Sort by skill match and return top candidates
    next_roles.sort(key=lambda x: x['skill_match'], reverse=True)
    return next_roles[:3]  # Return top 3 candidates


def identify_skills_gaps(employee: Dict[str, Any], all_roles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identify skills gaps needed for progression
    """
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    
    # Collect all required skills from potential next roles
    next_roles = find_next_roles(employee, all_roles)
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
    years_experienced: int
) -> Dict[str, Any]:
    """Find next level promotion role"""
    current_level = get_role_level(current_role)
    next_level = current_level + 1
    
    for role in all_roles:
        if (get_role_level(role['title']) == next_level and 
            years_experienced >= 2):  # Minimum 2 years in current level
            return role
    
    return None


def find_lateral_role(employee: Dict[str, Any], all_roles: List[Dict[str, Any]], current_role: str) -> Dict[str, Any]:
    """Find cross-functional lateral move"""
    current_dept = employee['employment_info']['department']
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    
    for role in all_roles:
        if (role.get('department') != current_dept and 
            len(set(role.get('required_skills', [])) & current_skills) >= 3):
            return role
    
    return None


def find_expert_role(employee: Dict[str, Any], all_roles: List[Dict[str, Any]], current_role: str) -> Dict[str, Any]:
    """Find expert/principal level role in same domain"""
    current_dept = employee['employment_info']['department']
    
    for role in all_roles:
        if (role.get('department') == current_dept and 
            ('Expert' in role['title'] or 'Principal' in role['title'] or 'Lead' in role['title'])):
            return role
    
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
    """Calculate probability of success in this career path"""
    score = 0.5  # Start at 50%
    
    # Increase probability if employee has relevant skills
    current_skills = set(skill['skill_name'] for skill in employee['skills'])
    if len(current_skills) >= 8:
        score += 0.15
    
    # Increase for tenure (stability)
    tenure = calculate_tenure(employee['employment_info']['in_role_since'])
    if tenure >= 1:
        score += 0.1
    
    # Scenario fit
    if scenario_type == "specialization" and tenure >= 2:
        score += 0.1
    elif scenario_type == "aggressive_growth" and tenure >= 3:
        score += 0.05  # Already well-established
    
    return min(score, 0.95)  # Cap at 95%


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
