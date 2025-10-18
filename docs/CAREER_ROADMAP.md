# 🗺️ Career Roadmap - Predictive Career Path Simulation

![Role-Based Access](https://img.shields.io/badge/Access-Employee%20%26%20Admin-orange)
![Scenario Simulations](https://img.shields.io/badge/Simulations-4%20Scenarios-green)
![10-Year Projections](https://img.shields.io/badge/Projection-10%20Years-blue)

**Career Roadmap** provides personalized career progression planning through current trajectory analysis (for all users) and predictive simulations with multiple scenarios (admin-only feature).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Current Roadmap (All Users)](#current-roadmap-all-users)
- [Predicted Roadmap with Simulations (Admin Only)](#predicted-roadmap-with-simulations-admin-only)
- [Simulation Algorithms](#simulation-algorithms)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)

---

## Overview

### Purpose

Career Roadmap helps employees and HR administrators visualize career progression paths:
- **Employees**: See realistic next 2-3 year progression based on current trajectory
- **Admins**: Access predictive 10-year simulations across multiple career scenarios for workforce planning

### Key Features

- **Current Roadmap**: Realistic progression analysis with skill gaps and milestones
- **Predicted Simulations**: Four scenario types modeling different career paths
- **Risk Analysis**: Identify retention risks and optimal development paths
- **Skills Gap Identification**: Prioritized learning recommendations
- **Career Anchor Detection**: Understand what drives employee motivation
- **Performance Optimized**: Lazy loading for admin features, limited role queries

---

## Architecture

### System Flow

```
User Request
    ↓
[Authentication] → Verify employee/admin role
    ↓
[Route Selection]
    ├── Employee → Current Roadmap Only
    └── Admin → Current + Predicted + Comparison
    ↓
[Data Retrieval]
    ├── Fetch employee profile
    └── Fetch roles (limited to 40-50 for performance)
    ↓
[Roadmap Generation]
    ├── calculate_current_roadmap() → All users
    └── calculate_predicted_roadmap_with_simulations() → Admin only
    ↓
[Response] → JSON with roadmap data, visualizations
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│         Frontend (career-roadmap.js)                    │
│  ┌───────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ Tab View  │  │ Milestone   │  │ Scenario Compare │  │
│  │ (Current/ │  │ Timeline    │  │ (Admin)          │  │
│  │ Predicted)│  │             │  │                  │  │
│  └───────────┘  └─────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (career_roadmap.py)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ calculate_current_roadmap()                      │   │
│  │  - find_next_roles()                             │   │
│  │  - identify_skills_gaps()                        │   │
│  │  - analyze_career_anchors()                      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ calculate_predicted_roadmap_with_simulations()   │   │
│  │  - simulate_career_path() x 4 scenarios          │   │
│  │  - determine_optimal_path()                      │   │
│  │  - identify_risks()                              │   │
│  │  - identify_retention_factors()                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Current Roadmap (All Users)

### Features

Provides realistic 2-3 year career progression based on:
- Current role and tenure
- Skills and competencies
- Career history
- Position in organization

### Output Structure

```json
{
  "current_position": {
    "title": "Cloud Solutions Architect",
    "department": "Information Technology",
    "tenure_years": 3.5,
    "started_date": "2022-01-15",
    "key_achievements": [
      "30% infrastructure cost reduction",
      "99.95% service availability"
    ],
    "current_skills": 12,
    "current_competencies": [...]
  },
  "next_logical_roles": [
    {
      "role_id": "ROLE-003",
      "title": "Enterprise Architect",
      "department": "Information Technology",
      "skill_match": 0.78,
      "skills_to_acquire": ["Strategic Planning", "Vendor Management"],
      "estimated_time_to_ready": "12-18 months"
    }
  ],
  "skills_to_develop": [
    {
      "skill": "Strategic Planning",
      "priority": "high",
      "estimated_months_to_learn": 6,
      "recommended_resources": ["Coursera", "Internal Training"]
    }
  ],
  "timeline": {
    "current": "2025-10-19T00:00:00",
    "next_milestone": "2026-10-19T00:00:00",
    "estimated_progression": "1-2 years in current role, then step up"
  },
  "career_anchors": ["Technical Expertise", "Leadership"]
}
```

### Algorithm: Find Next Roles

```python
def find_next_roles(employee, all_roles, years=2):
    """
    Find logical next roles based on:
    1. Role level (one level up from current)
    2. Skill match (at least 50% overlap)
    3. Tenure requirements (minimum 2 years in current role)
    """
    current_skills = set(employee skills)
    current_level = get_role_level(current_role)
    next_level = current_level + 1
    
    candidates = []
    for role in all_roles:
        if get_role_level(role) == next_level:
            required_skills = set(role.required_skills)
            skill_match = len(current_skills & required_skills) / len(required_skills)
            
            if skill_match >= 0.5:
                candidates.append({
                    'role': role,
                    'skill_match': skill_match,
                    'skills_to_acquire': required_skills - current_skills,
                    'estimated_time_to_ready': estimate_readiness(skill_gap_count)
                })
    
    return sorted(candidates, key='skill_match', reverse=True)[:3]
```

### Algorithm: Career Anchors

Identifies what drives employee career decisions:

```python
def analyze_career_anchors(employee):
    anchors = []
    
    # Technical Expertise
    if skill_count > 10:
        anchors.append('Technical Expertise')
    
    # Leadership
    if any('leadership' in project.lower() for project in projects):
        anchors.append('Leadership')
    
    # Autonomy/Independence
    if any('independent' in experience for experience in experiences):
        anchors.append('Autonomy')
    
    # Security/Stability
    if tenure > 5 years and promotions < 2:
        anchors.append('Stability')
    
    return anchors
```

---

## Predicted Roadmap with Simulations (Admin Only)

### Purpose

Provides HR administrators with predictive analytics for:
- Workforce planning
- Succession planning
- Retention risk assessment
- Talent development strategy

### Four Scenario Types

#### 1. **Steady Growth** (Normal Progression)
- **Pace**: One promotion every 3-4 years
- **Path**: Vertical progression within current department
- **Skills Development**: Gradual competency building
- **Risk Level**: Low

#### 2. **Aggressive Growth** (Fast-Track)
- **Pace**: One promotion every 2 years
- **Path**: Rapid vertical advancement
- **Skills Development**: Accelerated learning, mentorship
- **Risk Level**: Moderate (burnout risk if unsupported)

#### 3. **Lateral Mobility** (Cross-Functional)
- **Pace**: Lateral moves every 2-3 years
- **Path**: Cross-department rotation
- **Skills Development**: Broad skill acquisition
- **Risk Level**: Low-Moderate (cultural adaptation)

#### 4. **Specialization** (Deep Expertise)
- **Pace**: Expert/Principal levels within 5-7 years
- **Path**: Deep domain focus
- **Skills Development**: Advanced technical mastery
- **Risk Level**: Low (high retention in specialized roles)

### Output Structure

```json
{
  "employee_id": "EMP-20001",
  "analysis_date": "2025-10-19T00:00:00",
  "scenarios": {
    "steady_growth": {
      "scenario": "steady_growth",
      "years_simulated": 10,
      "milestones": [
        {
          "year": 2,
          "role": "Senior Cloud Architect",
          "level": 4,
          "salary_band": "B3",
          "skills_acquired": ["Strategic Planning"],
          "likelihood": 0.75
        },
        {
          "year": 5,
          "role": "Enterprise Architect",
          "level": 5,
          "salary_band": "B4",
          "skills_acquired": ["Vendor Management", "Architecture Governance"],
          "likelihood": 0.60
        }
      ],
      "predicted_roles": ["Senior Cloud Architect", "Enterprise Architect"],
      "final_level": 5,
      "skills_development_path": [...],
      "retention_likelihood": 0.82
    },
    "aggressive_growth": {...},
    "lateral_mobility": {...},
    "specialization": {...}
  },
  "optimal_path": "steady_growth",
  "risk_factors": [
    {
      "factor": "Limited leadership experience",
      "severity": "medium",
      "mitigation": "Assign team lead opportunities"
    }
  ],
  "retention_factors": [
    {
      "factor": "Strong technical progression",
      "impact": "positive",
      "weight": 0.8
    }
  ]
}
```

### Simulation Algorithm

```python
def simulate_career_path(employee, all_roles, scenario_type, years=10):
    """
    Simulate year-by-year progression based on scenario
    """
    current_level = get_role_level(employee.job_title)
    current_skills = set(employee.skills)
    milestones = []
    
    # Scenario-specific parameters
    params = {
        'steady_growth': {'promotion_interval': 3, 'skill_growth_rate': 2},
        'aggressive_growth': {'promotion_interval': 2, 'skill_growth_rate': 3},
        'lateral_mobility': {'lateral_interval': 2, 'dept_change': True},
        'specialization': {'expert_track': True, 'depth_over_breadth': True}
    }
    
    config = params[scenario_type]
    
    for year in range(1, years + 1):
        # Check for promotion/movement
        if year % config['promotion_interval'] == 0:
            next_role = find_promotion_role(employee, all_roles, current_level, year)
            
            if next_role:
                # Simulate skill acquisition
                new_skills = simulate_skill_growth(
                    current_skills,
                    next_role.required_skills,
                    config['skill_growth_rate']
                )
                
                milestones.append({
                    'year': year,
                    'role': next_role.title,
                    'level': next_role.level,
                    'skills_acquired': list(new_skills - current_skills),
                    'likelihood': calculate_likelihood(year, scenario_type)
                })
                
                current_skills = new_skills
                current_level = next_role.level
    
    return {
        'scenario': scenario_type,
        'years_simulated': years,
        'milestones': milestones,
        'final_level': current_level,
        'retention_likelihood': calculate_retention(scenario_type, milestones)
    }
```

### Optimal Path Determination

```python
def determine_optimal_path(scenarios):
    """
    Recommend optimal scenario based on:
    1. Employee career anchors
    2. Retention likelihood
    3. Skills alignment with organizational needs
    4. Realistic advancement opportunities
    """
    scored_scenarios = []
    
    for scenario_name, scenario_data in scenarios.items():
        score = 0
        
        # Factor 1: Retention likelihood (40% weight)
        score += scenario_data['retention_likelihood'] * 0.4
        
        # Factor 2: Final level achievement (30% weight)
        score += (scenario_data['final_level'] / 7) * 0.3
        
        # Factor 3: Skills development breadth (20% weight)
        unique_skills = len(set(scenario_data['skills_development_path']))
        score += (unique_skills / 15) * 0.2
        
        # Factor 4: Career anchor alignment (10% weight)
        anchor_match = calculate_anchor_match(scenario_name, employee)
        score += anchor_match * 0.1
        
        scored_scenarios.append((scenario_name, score))
    
    return max(scored_scenarios, key=lambda x: x[1])[0]
```

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend Logic** | Python 3.8+ | Simulation algorithms |
| **Date Handling** | python-dateutil | Timeline calculations |
| **Database** | SQLAlchemy + SQLite | Employee/role data |
| **Frontend** | React 18 + Next.js 14 | Roadmap visualization |
| **Charts** | Recharts 2 | Timeline/scenario charts |
| **Auth** | Token-based | Role-based access control |

---

## API Endpoints

### `GET /api/career-roadmap/current/<employee_id>`

**Authentication**: Required (Employee or Admin)

**Query Parameters**:
- `limit`: Max roles to analyze (default: 50)

**Response**:
```json
{
  "success": true,
  "data": {
    "current_position": {...},
    "next_logical_roles": [...],
    "skills_to_develop": [...],
    "timeline": {...},
    "career_anchors": [...]
  },
  "message": "Current career roadmap for Samantha Lee",
  "roles_analyzed": 50
}
```

### `GET /api/career-roadmap/predicted/<employee_id>`

**Authentication**: Required (Admin Only)

**Query Parameters**:
- `scenarios`: Comma-separated list (default: "steady_growth,aggressive_growth")
- `years`: Simulation years (default: 10, max: 10)
- `limit`: Max roles (default: 40)

**Response**:
```json
{
  "success": true,
  "data": {
    "employee_id": "EMP-20001",
    "scenarios": {
      "steady_growth": {...},
      "aggressive_growth": {...}
    },
    "optimal_path": "steady_growth",
    "risk_factors": [...],
    "retention_factors": [...]
  },
  "admin_only": true,
  "years_simulated": 10,
  "scenarios_count": 2
}
```

### `GET /api/career-roadmap/comparison/<employee_id>`

**Authentication**: Required (Admin Only)

**Query Parameters**:
- `limit`: Max roles (default: 40)

**Response**: Comparative analysis of all 4 scenarios with side-by-side metrics.

---

## Performance Optimization

### Lazy Loading (Frontend)
- Current roadmap fetched immediately for employees
- Predicted roadmap fetched only when admin switches to that tab
- Comparison fetched only when requested

### Limited Role Queries (Backend)
```python
# Only fetch relevant roles, not entire database
roles = session.query(Role).limit(40).all()
```

### Fast Scenarios (Default)
- Admin sees 2 scenarios by default (`steady_growth`, `aggressive_growth`)
- Full 4-scenario analysis available on-demand
- 10-year max simulation (prevents performance issues)

---

## Usage Examples

### Example 1: Employee Viewing Current Roadmap

**Request**:
```http
GET /api/career-roadmap/current/EMP-20001
Authorization: Bearer samantha.lee.token
```

**Response Highlights**:
- **Next Logical Roles**: Enterprise Architect (78% match), Cloud Infrastructure Lead (72% match)
- **Skills to Develop**: Strategic Planning (high priority, 6 months), Vendor Management (medium priority, 4 months)
- **Timeline**: Ready for next role in 12-18 months
- **Career Anchors**: Technical Expertise, Leadership

### Example 2: Admin Viewing Predicted Roadmap

**Request**:
```http
GET /api/career-roadmap/predicted/EMP-20001?scenarios=steady_growth,aggressive_growth,lateral_mobility
Authorization: Bearer admin.token
```

**Response Highlights**:
- **Steady Growth**: Senior Cloud Architect (Year 2) → Enterprise Architect (Year 5) → Chief Architect (Year 8)
- **Aggressive Growth**: Enterprise Architect (Year 2) → Chief Architect (Year 4) → VP Engineering (Year 7)
- **Lateral Mobility**: Security Architect (Year 2) → Data Platform Lead (Year 4) → Technology Manager (Year 7)
- **Optimal Path**: `steady_growth` (retention likelihood: 0.82, balanced progression)
- **Risk Factors**: Limited leadership experience (medium severity)
- **Retention Factors**: Strong technical progression (0.8 weight), competitive compensation (0.7 weight)

---

## Future Enhancements

1. **Machine Learning Predictions**: Use historical data to train models for more accurate likelihood scoring
2. **Market Salary Integration**: Incorporate external salary data for compensation planning
3. **Automated Notifications**: Alert employees when they're ready for next role
4. **Mentorship Matching**: Suggest mentors based on target role requirements
5. **Skills Marketplace**: Internal job postings based on roadmap recommendations
6. **PDF Export**: Generate downloadable career development plans
7. **Manager Collaboration**: Allow managers to annotate and approve roadmaps

---

**🔗 Related Documentation**:
- [Compass Copilot](./COMPASS_COPILOT.md)
- [Leadership Potential](./LEADERSHIP_POTENTIAL.md)
- [Main README](../README.md)

---

**Built with 💙 by Team Tribyte for PSA Code Sprint Singapore 2025**
