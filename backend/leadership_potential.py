"""
Leadership Potential Scoring Module
Implements heuristic-based scoring with full explainability
"""
from typing import Dict, List, Any, Tuple
from datetime import datetime
from dateutil.relativedelta import relativedelta
import re

# Import augmentation functions (Azure OpenAI-based enhancements)
try:
    from leadership_augmentations import (
        analyze_outcome_impact_augmented,
        analyze_stakeholder_complexity_augmented
    )
    AUGMENTATIONS_AVAILABLE = True
except ImportError:
    AUGMENTATIONS_AVAILABLE = False
    print("⚠️ Leadership augmentations module not available. Using base scoring only.")


def extract_quantified_outcomes(projects: List[Dict]) -> List[float]:
    """
    Extract numerical outcomes from project descriptions
    Examples: "30% cost reduction", "99.95% availability", "22% improvement"
    Returns list of percentage values
    """
    outcomes = []
    if not projects:
        return outcomes
    
    for project in projects:
        # Check outcomes field
        project_outcomes = project.get('outcomes', [])
        description = project.get('description', '')
        
        # Combine all text sources
        text_sources = [description] + (project_outcomes if isinstance(project_outcomes, list) else [])
        
        for text in text_sources:
            if not isinstance(text, str):
                continue
            # Look for percentage patterns like "30%", "99.95%"
            matches = re.findall(r'(\d+(?:\.\d+)?)\s*%', text)
            for match in matches:
                value = float(match)
                # Normalize: cap at 100 for percentages
                outcomes.append(min(value, 100))
    
    return outcomes


def count_distinct_stakeholders(projects: List[Dict], experiences: List[Dict]) -> int:
    """
    Count unique stakeholder groups mentioned in projects and experiences
    Examples: "cross-functional", "executive", "business units", "vendors"
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
    
    # Check projects
    for project in projects or []:
        description = project.get('description', '').lower()
        for keyword in stakeholder_keywords:
            if keyword in description:
                found_stakeholders.add(keyword)
    
    # Check experiences
    for exp in experiences or []:
        focus = exp.get('focus', '').lower()
        for keyword in stakeholder_keywords:
            if keyword in focus:
                found_stakeholders.add(keyword)
    
    return len(found_stakeholders)


def has_competency(competencies: List[Dict], competency_name: str) -> bool:
    """
    Check if employee has a specific competency (at any level)
    """
    if not competencies:
        return False
    
    competency_name_lower = competency_name.lower()
    for comp in competencies:
        comp_name = comp.get('name', '').lower()
        if competency_name_lower in comp_name or comp_name in competency_name_lower:
            return True
    
    return False


def calculate_progression_velocity(positions_history: List[Dict], hire_date: str) -> Tuple[int, float]:
    """
    Calculate career progression velocity
    Returns: (levels_advanced, years_tenure)
    """
    if not positions_history or not hire_date:
        return 0, 1  # Default to avoid division by zero
    
    # Count unique role levels (simplified heuristic based on titles)
    role_levels = {
        'trainee': 1,
        'junior': 1,
        'analyst': 2,
        'engineer': 2,
        'specialist': 2,
        'senior': 3,
        'lead': 4,
        'manager': 4,
        'principal': 5,
        'director': 6,
        'head': 6,
        'vp': 7,
        'vice president': 7
    }
    
    # Get levels for each position
    position_levels = []
    for pos in positions_history:
        title = pos.get('role_title', '').lower()
        level = 2  # Default level
        for keyword, lvl in role_levels.items():
            if keyword in title:
                level = max(level, lvl)
        position_levels.append(level)
    
    # Calculate advancement
    if position_levels:
        entry_level = min(position_levels)
        current_level = max(position_levels)
        levels_advanced = current_level - entry_level
    else:
        levels_advanced = 0
    
    # Calculate tenure in years
    try:
        hire_dt = datetime.fromisoformat(hire_date.replace('Z', '+00:00'))
        current_dt = datetime.now()
        years_tenure = (current_dt - hire_dt).days / 365.25
        years_tenure = max(years_tenure, 1)  # Minimum 1 year
    except:
        years_tenure = 1
    
    return levels_advanced, years_tenure


def get_top_project_outcomes(projects: List[Dict], n: int = 2) -> List[str]:
    """
    Get the top N project outcomes as evidence
    """
    if not projects:
        return ["No projects recorded"]
    
    evidence = []
    for project in projects[:n]:
        project_name = project.get('project_name', 'Unnamed Project')
        outcomes = project.get('outcomes', [])
        if outcomes:
            # Pick the first outcome as the primary one
            primary_outcome = outcomes[0] if isinstance(outcomes, list) else str(outcomes)
            evidence.append(f"{project_name}: {primary_outcome}")
        else:
            description = project.get('description', 'No description')
            evidence.append(f"{project_name}: {description[:100]}")
    
    return evidence


def get_stakeholder_examples(projects: List[Dict], experiences: List[Dict]) -> List[str]:
    """
    Get specific examples of stakeholder engagement
    """
    examples = []
    
    # From projects
    for project in (projects or [])[:2]:
        description = project.get('description', '')
        name = project.get('project_name', 'Project')
        if any(keyword in description.lower() for keyword in ['cross-functional', 'stakeholder', 'executive']):
            examples.append(f"{name}: {description[:100]}")
    
    # From experiences
    for exp in (experiences or [])[:2]:
        focus = exp.get('focus', '')
        program = exp.get('program', 'Experience')
        if any(keyword in focus.lower() for keyword in ['cross-functional', 'stakeholder', 'executive']):
            examples.append(f"{program}: {focus[:100]}")
    
    return examples if examples else ["Limited stakeholder complexity documented"]


def get_change_leadership_evidence(competencies: List[Dict], projects: List[Dict]) -> List[str]:
    """
    Get evidence of change management and leadership
    """
    evidence = []
    
    # Check competencies
    change_competencies = ['change', 'transformation', 'leadership', 'management']
    for comp in competencies or []:
        comp_name = comp.get('name', '')
        if any(keyword in comp_name.lower() for keyword in change_competencies):
            level = comp.get('level', 'Demonstrated')
            evidence.append(f"Competency: {comp_name} ({level})")
    
    # Check projects for change initiatives
    for project in (projects or [])[:2]:
        description = project.get('description', '')
        name = project.get('project_name', '')
        if any(keyword in description.lower() for keyword in ['migration', 'transformation', 'change', 'uplift']):
            evidence.append(f"Project: {name}")
    
    return evidence if evidence else ["No explicit change leadership demonstrated"]


def compute_leadership_potential(employee: Dict[str, Any], max_metrics: Dict[str, float], use_augmentations: bool = True) -> Dict[str, Any]:
    """
    Compute leadership potential score with full explainability
    
    Args:
        employee: Employee data dictionary
        max_metrics: Dictionary with max values for normalization
            {
                'max_outcome': float,
                'max_stakeholders': int,
                'max_progression': float
            }
        use_augmentations: Whether to use Azure OpenAI augmentations (default True)
                          Set to False for batch normalization to avoid expensive API calls
    
    Returns:
        Dictionary with overall_score, components, and evidence
    """
    projects = employee.get('projects', [])
    experiences = employee.get('experiences', [])
    competencies = employee.get('competencies', [])
    positions_history = employee.get('positions_history', [])
    employment_info = employee.get('employment_info', {})
    hire_date = employment_info.get('hire_date', '')
    
    # === AUGMENTATION: Azure OpenAI-based enhancements ===
    # These augmentations ADD to existing scoring without replacing it
    augmentation_data = {}
    
    if AUGMENTATIONS_AVAILABLE and use_augmentations:
        # Outcome Impact Augmentation: sentiment + quantitative evidence
        outcome_augmentation = analyze_outcome_impact_augmented(projects)
        augmentation_data['outcome_impact_augmentation'] = outcome_augmentation
        
        # Stakeholder Complexity Augmentation: partner/diversity + engagement grading
        stakeholder_augmentation = analyze_stakeholder_complexity_augmented(projects, experiences)
        augmentation_data['stakeholder_complexity_augmentation'] = stakeholder_augmentation
    
    # Component 1: Outcome Impact (25% weight)
    # EXISTING logic (preserved)
    project_metrics = extract_quantified_outcomes(projects)
    if project_metrics:
        avg_outcome = sum(project_metrics) / len(project_metrics)
        max_outcome = max_metrics.get('max_outcome', 100)
        outcome_impact_base = min(avg_outcome / max_outcome, 1.0) if max_outcome > 0 else 0.5
    else:
        outcome_impact_base = 0.5  # Default if no metrics
    
    # AUGMENTATION merge: combine base score with Azure-derived augmentation
    if AUGMENTATIONS_AVAILABLE and 'outcome_impact_augmentation' in augmentation_data:
        augmented_outcome_score = augmentation_data['outcome_impact_augmentation'].get('augmented_outcome', 0.5)
        # Merge strategy: 60% base (existing) + 40% augmented (Azure AI)
        outcome_impact = 0.6 * outcome_impact_base + 0.4 * augmented_outcome_score
    else:
        outcome_impact = outcome_impact_base
    
    # Component 2: Stakeholder Complexity (25% weight)
    # EXISTING logic (preserved)
    unique_stakeholders = count_distinct_stakeholders(projects, experiences)
    max_stakeholders = max_metrics.get('max_stakeholders', 10)
    stakeholder_complexity_base = min(unique_stakeholders / max_stakeholders, 1.0) if max_stakeholders > 0 else 0.5
    
    # AUGMENTATION merge: combine base score with Azure-derived augmentation
    if AUGMENTATIONS_AVAILABLE and 'stakeholder_complexity_augmentation' in augmentation_data:
        augmented_stakeholder_score = augmentation_data['stakeholder_complexity_augmentation'].get('stakeholder_complexity_augmented', 0.5)
        # Merge strategy: 60% base (existing) + 40% augmented (Azure AI)
        stakeholder_complexity = 0.6 * stakeholder_complexity_base + 0.4 * augmented_stakeholder_score
    else:
        stakeholder_complexity = stakeholder_complexity_base
    
    # Component 3: Change Management (20% weight)
    has_change_competency = has_competency(competencies, "Change") or has_competency(competencies, "Transformation")
    change_mgmt = 1.0 if has_change_competency else 0.5
    
    # Component 4: Progression Velocity (30% weight)
    levels_advanced, years_tenure = calculate_progression_velocity(positions_history, hire_date)
    progression_rate = levels_advanced / years_tenure if years_tenure > 0 else 0
    max_progression = max_metrics.get('max_progression', 1.0)
    progression_velocity = min(progression_rate / max_progression, 1.0) if max_progression > 0 else 0.5
    
    # Weighted composite score (0-100)
    raw_score = (
        0.25 * outcome_impact +
        0.25 * stakeholder_complexity +
        0.20 * change_mgmt +
        0.30 * progression_velocity
    ) * 100
    
    result = {
        'overall_score': round(raw_score, 1),
        'components': {
            'outcome_impact': round(outcome_impact * 100, 1),
            'stakeholder_complexity': round(stakeholder_complexity * 100, 1),
            'change_management': round(change_mgmt * 100, 1),
            'progression_velocity': round(progression_velocity * 100, 1)
        },
        'evidence': {
            'outcome_impact': get_top_project_outcomes(projects, n=2),
            'stakeholder_complexity': get_stakeholder_examples(projects, experiences),
            'change_management': get_change_leadership_evidence(competencies, projects),
            'progression_velocity': f"{levels_advanced} levels advanced in {round(years_tenure, 1)} years"
        },
        'raw_metrics': {
            'avg_outcome': round(sum(project_metrics) / len(project_metrics), 1) if project_metrics else 0,
            'unique_stakeholders': unique_stakeholders,
            'has_change_competency': has_change_competency,
            'levels_advanced': levels_advanced,
            'years_tenure': round(years_tenure, 1)
        }
    }
    
    # Add augmentation data if available
    if augmentation_data:
        result['score_augmentations'] = augmentation_data
    
    return result


def calculate_max_metrics(all_employees: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Calculate maximum metrics across all employees for normalization
    """
    max_outcome = 0
    max_stakeholders = 0
    max_progression = 0
    
    for employee in all_employees:
        projects = employee.get('projects', [])
        experiences = employee.get('experiences', [])
        positions_history = employee.get('positions_history', [])
        employment_info = employee.get('employment_info', {})
        hire_date = employment_info.get('hire_date', '')
        
        # Max outcome
        outcomes = extract_quantified_outcomes(projects)
        if outcomes:
            avg_outcome = sum(outcomes) / len(outcomes)
            max_outcome = max(max_outcome, avg_outcome)
        
        # Max stakeholders
        stakeholders = count_distinct_stakeholders(projects, experiences)
        max_stakeholders = max(max_stakeholders, stakeholders)
        
        # Max progression
        levels_advanced, years_tenure = calculate_progression_velocity(positions_history, hire_date)
        if years_tenure > 0:
            progression_rate = levels_advanced / years_tenure
            max_progression = max(max_progression, progression_rate)
    
    # Ensure minimums to avoid division by zero
    return {
        'max_outcome': max(max_outcome, 50),  # Default 50%
        'max_stakeholders': max(max_stakeholders, 5),  # Default 5 types
        'max_progression': max(max_progression, 0.5)  # Default 0.5 levels/year
    }


def calculate_percentile_rank(score: float, all_scores: List[float]) -> int:
    """
    Calculate percentile rank of a score among all scores
    """
    if not all_scores:
        return 50
    
    sorted_scores = sorted(all_scores)
    position = sum(1 for s in sorted_scores if s < score)
    percentile = int((position / len(sorted_scores)) * 100)
    
    return percentile


def generate_improvement_suggestions(components: Dict[str, float], evidence: Dict[str, Any]) -> List[str]:
    """
    Generate personalized improvement suggestions based on component scores
    """
    suggestions = []
    
    # Check outcome impact
    if components['outcome_impact'] < 60:
        suggestions.append("Focus on quantifying and documenting project outcomes with specific metrics (e.g., % improvements, cost savings)")
    
    # Check stakeholder complexity
    if components['stakeholder_complexity'] < 60:
        suggestions.append("Lead a cross-functional initiative to boost stakeholder management experience")
    
    # Check change management
    if components['change_management'] < 80:
        suggestions.append("Seek opportunities in transformation projects and document change management approaches")
    
    # Check progression velocity
    if components['progression_velocity'] < 60:
        suggestions.append("Discuss career advancement opportunities with your manager and identify skill gaps for next level")
    
    return suggestions if suggestions else ["Great work! Continue demonstrating leadership across all dimensions"]
