# 🔍 AI-Powered Role Matching - Intelligent Career Opportunity Discovery

![All Users](https://img.shields.io/badge/Access-All%20Users-green)
![Azure OpenAI](https://img.shields.io/badge/Powered%20by-Azure%20OpenAI-412991)
![Dual-Weight Scoring](https://img.shields.io/badge/Scoring-Semantic%20%2B%20Skills-blue)

**AI-Powered Role Matching** provides intelligent career opportunity discovery by combining semantic AI with skill-based analysis to deliver optimal employee-role alignment recommendations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Dual-Weight Scoring System](#dual-weight-scoring-system)
- [Matching Algorithm](#matching-algorithm)
- [Career Narrative Generation](#career-narrative-generation)
- [Development Plans](#development-plans)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)

---

## Overview

### Purpose

AI-Powered Role Matching helps employees discover career opportunities and empowers HR administrators with intelligent talent-to-role alignment. The system provides:

- **Intelligent Matching**: Combines semantic understanding with precise skill analysis
- **Personalized Recommendations**: AI-generated career narratives tailored to individual backgrounds
- **Actionable Development**: Clear, prioritized learning paths with timelines
- **Evidence-Based Insights**: Transparent scoring with detailed skill breakdowns

### Key Features

#### Core Matching Capabilities
- **Dual-Weight Scoring System**: 60% semantic similarity + 40% skill gap analysis
- **Comprehensive Match Details**: Match scores with recommendation strength labels
- **Skill Differentiation**: Required vs. preferred skills clearly identified
- **Top-K Recommendations**: Configurable number of top matches (default: 5)

#### AI-Enhanced Features
- **Career Narratives**: Personalized career stories using Azure OpenAI GPT-5-mini
- **Development Plans**: Prioritized action plans with timelines and resources
- **Contextual Insights**: Leverages employee projects, competencies, and career history

#### User Experience
- **Interactive UI**: Expandable role cards with detailed information
- **Visual Indicators**: Color-coded match scores and recommendation strengths
- **Evidence Display**: Clear presentation of matched and missing skills

### Access Control

**Available to All Users**: Role Matching is accessible to both employees (for career exploration and development) and administrators (for talent placement and workforce planning).

---

## Architecture

### System Flow

```
User Request (Employee Selection)
    ↓
[Fetch Employee Profile] → Complete profile with skills, projects, competencies
    ↓
[Fetch All Roles] → Available positions with requirements
    ↓
[Generate Embeddings]
    ├── Employee Profile → Text representation + embedding vector
    └── Role Requirements → Text representation + embedding vector
    ↓
[Calculate Matches]
    ├── Semantic Similarity (60% weight) → Cosine similarity of embeddings
    └── Skill Match (40% weight) → Set intersection analysis
    ↓
[Rank and Filter] → Top K matches sorted by combined score
    ↓
[Generate Narrative] → Azure OpenAI GPT-5-mini (optional, for top match)
    ↓
[Generate Development Plan] → Prioritized learning recommendations
    ↓
[Return Results] → JSON response with matches, narrative, plan
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (career-matching.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Employee     │  │ Employee     │  │ Role Matches     │  │
│  │ Search       │  │ Profile      │  │ Display          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Career       │  │ Development  │                        │
│  │ Narrative    │  │ Plan         │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                          ↓ GET /api/match/employee/<id>
┌─────────────────────────────────────────────────────────────┐
│                    Backend (app.py)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ match_employee_to_roles() (ai_engine.py)            │   │
│  │  - create_profile_text()                             │   │
│  │  - create_role_text()                                │   │
│  │  - generate_embedding()                              │   │
│  │  - calculate_skill_match()                           │   │
│  │  - cosine_similarity()                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ generate_career_narrative() (ai_engine.py)          │   │
│  │  → Azure OpenAI GPT-5-mini                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ generate_development_plan() (ai_engine.py)          │   │
│  │  - Prioritize skill gaps                            │   │
│  │  - Estimate learning timelines                      │   │
│  │  - Recommend resources                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│         Azure OpenAI Services                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ text-embedding-3-small                               │   │
│  │  - Profile embeddings                                │   │
│  │  - Role embeddings                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ gpt-5-mini                                           │   │
│  │  - Career narratives                                 │   │
│  │  - Personalized recommendations                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Dual-Weight Scoring System

### Overview

Role matching uses a hybrid scoring approach that balances semantic understanding with precise skill requirements:

```
Combined Score = (0.6 × Semantic Similarity) + (0.4 × Skill Match Score)
```

### Component 1: Semantic Similarity (60% Weight)

**Purpose**: Capture contextual alignment between employee profile and role requirements beyond explicit skill keywords.

**Process**:
1. **Text Representation**: Convert employee profile and role into comprehensive text
2. **Embedding Generation**: Use Azure OpenAI `text-embedding-3-small` for vector representation
3. **Similarity Calculation**: Compute cosine similarity between embedding vectors

**Employee Profile Text**:
```python
def create_profile_text(employee: Dict[str, Any]) -> str:
    parts = []
    parts.append(f"Name: {employee['name']}")
    parts.append(f"Role: {employee['job_title']}")
    parts.append(f"Department: {employee['department']}")
    parts.append(f"Skills: {', '.join(employee['skills'])}")
    parts.append(f"Competencies: {', '.join(employee['competencies'])}")
    parts.append(f"Projects: {'; '.join(employee['projects'])}")
    return ' | '.join(parts)
```

**Role Text**:
```python
def create_role_text(role: Dict[str, Any]) -> str:
    parts = []
    parts.append(f"Role: {role['title']}")
    parts.append(f"Department: {role['department']}")
    parts.append(f"Required Skills: {', '.join(role['required_skills'])}")
    parts.append(f"Preferred Skills: {', '.join(role['preferred_skills'])}")
    parts.append(f"Required Competencies: {competency_text}")
    parts.append(f"Description: {role['description']}")
    return ' | '.join(parts)
```

**Similarity Calculation**:
```python
from sklearn.metrics.pairwise import cosine_similarity

similarity = cosine_similarity([employee_embedding], [role_embedding])[0][0]
# Returns value between 0 (no similarity) and 1 (perfect match)
```

**Benefits**:
- Captures implicit relationships (e.g., "cloud architecture" relates to "infrastructure design")
- Considers context from projects and experiences
- Handles synonyms and related concepts

### Component 2: Skill Match Score (40% Weight)

**Purpose**: Provide precise measurement of skill alignment against role requirements.

**Process**:
1. **Skill Extraction**: Extract employee skills and role requirements (required + preferred)
2. **Set Operations**: Calculate intersections and differences
3. **Weighted Scoring**: Required skills (70%) + Preferred skills (30%)

**Algorithm**:
```python
def calculate_skill_match(
    employee_skills: List[str],
    required_skills: List[str],
    preferred_skills: List[str] = None
) -> Dict[str, Any]:
    
    # Convert to sets for efficient operations
    employee_set = set(employee_skills)
    required_set = set(required_skills)
    preferred_set = set(preferred_skills or [])
    
    # Calculate intersections
    required_matched = employee_set & required_set
    required_missing = required_set - employee_set
    preferred_matched = employee_set & preferred_set
    
    # Calculate scores
    required_score = len(required_matched) / len(required_set) if required_set else 1.0
    preferred_score = len(preferred_matched) / len(preferred_set) if preferred_set else 0.0
    
    # Combined skill score (70% required, 30% preferred)
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
```

**Benefits**:
- Clear, quantifiable skill gaps
- Differentiates required vs. preferred skills
- Provides actionable development priorities

### Recommendation Strength Labels

Match scores are translated into human-readable recommendation strengths:

```python
def _get_strength_label(score: float) -> str:
    if score >= 85:
        return "Excellent Match"    # Ready now or very soon
    elif score >= 70:
        return "Strong Match"        # Ready with 3-6 months development
    elif score >= 55:
        return "Good Match"          # Ready with 6-12 months development
    elif score >= 40:
        return "Potential Match"     # Ready with 12-18 months development
    else:
        return "Stretch Opportunity" # 18+ months development needed
```

---

## Matching Algorithm

### Complete Matching Process

```python
def match_employee_to_roles(
    employee: Dict[str, Any],
    roles: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:
    
    # Step 1: Generate employee embedding
    employee_text = create_profile_text(employee)
    employee_embedding = generate_embedding(employee_text)
    
    if not employee_embedding:
        return []  # Fallback if embedding fails
    
    # Step 2: Extract employee skills
    employee_skills = [s['skill_name'] for s in employee['skills']]
    
    matches = []
    
    # Step 3: Iterate through all roles
    for role in roles:
        # Generate role embedding
        role_text = create_role_text(role)
        role_embedding = generate_embedding(role_text)
        
        if not role_embedding:
            continue  # Skip if embedding fails
        
        # Calculate semantic similarity
        similarity = cosine_similarity(
            [employee_embedding],
            [role_embedding]
        )[0][0]
        
        # Calculate skill match
        skill_match = calculate_skill_match(
            employee_skills,
            role['required_skills'],
            role['preferred_skills']
        )
        
        # Combine scores (60% semantic + 40% skill)
        combined_score = (similarity * 0.6) + (skill_match['overall_score'] / 100 * 0.4)
        
        # Add to matches
        matches.append({
            'role': role,
            'match_score': round(combined_score * 100, 1),
            'embedding_similarity': round(similarity * 100, 1),
            'skill_match': skill_match,
            'recommendation_strength': _get_strength_label(combined_score * 100)
        })
    
    # Step 4: Sort by match score and return top K
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    return matches[:top_k]
```

### Embedding Generation

**Primary Method**: Azure OpenAI `text-embedding-3-small`

```python
def generate_embedding(text: str, model: str = None) -> List[float]:
    try:
        # Use Azure OpenAI
        response = client.embeddings.create(
            model=model or "text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        # Fallback to local model if Azure unavailable
        return generate_local_embedding(text)
```

**Fallback Method**: Local Sentence Transformers

```python
def generate_local_embedding(text: str) -> List[float]:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    return model.encode(text).tolist()
```

**Configuration**:
- Set `USE_LOCAL_EMBEDDINGS=true` in `.env` to use local embeddings by default
- System automatically falls back to local if Azure is unavailable

---

## Career Narrative Generation

### Overview

For the top match, the system can generate a personalized career narrative using Azure OpenAI GPT-5-mini.

### Process

```python
def generate_career_narrative(
    employee: Dict[str, Any],
    matched_role: Dict[str, Any],
    match_details: Dict[str, Any]
) -> str:
    
    # Build comprehensive prompt
    prompt = f"""You are a career development advisor at PSA International.
    
Write a personalized career narrative for an employee exploring a new role.

EMPLOYEE PROFILE:
- Name: {employee['name']}
- Current Role: {employee['job_title']}
- Department: {employee['department']}
- Key Skills: {', '.join(employee['top_skills'])}
- Key Competencies: {', '.join(employee['competencies'])}

OPPORTUNITY:
- Role: {matched_role['title']}
- Department: {matched_role['department']}
- Match Score: {match_details['match_score']}%

SKILL ANALYSIS:
- Matched Skills: {', '.join(match_details['skill_match']['required_matched'])}
- Skills to Develop: {', '.join(match_details['skill_match']['required_missing'])}

Write a narrative (150-200 words) that:
1. Acknowledges their current strengths and alignment with the new role
2. Highlights exciting growth opportunities
3. Provides 2-3 specific, actionable next steps
4. Maintains an encouraging, professional tone

Be specific, positive, and actionable."""
    
    # Call Azure OpenAI
    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an expert career development advisor with deep knowledge of PSA International's culture and career frameworks."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_completion_tokens=20000
    )
    
    return response.choices[0].message.content
```

### Example Narrative

**For**: Cloud Solutions Architect → Enterprise Architect (95% match)

```
Samantha, your deep expertise in cloud architecture and infrastructure design positions you exceptionally well for the Enterprise Architect role. Your successful leadership of the Hybrid Cloud Migration—achieving 30% cost reduction and 99.95% availability—demonstrates the systems thinking and impact orientation this role demands.

The Enterprise Architect position offers an exciting opportunity to expand your influence from technical execution to strategic architecture planning across PSA's entire technology landscape. Your proven track record with IaC pipelines and zero-trust security will be invaluable.

To strengthen your candidacy:

1. **Strategic Planning**: Seek opportunities to participate in quarterly architecture review boards to develop enterprise-level thinking
2. **Vendor Management**: Shadow the current Enterprise Architect during vendor evaluations to build this critical skill
3. **Stakeholder Engagement**: Lead a cross-functional architecture working group to demonstrate executive communication abilities

With your strong foundation and these targeted developments, you could be ready for this role within 12-18 months. Your trajectory is impressive—let's make it happen!
```

---

## Development Plans

### Overview

For roles with skill gaps, the system generates prioritized development plans with timelines and resources.

### Algorithm

```python
def generate_development_plan(
    skill_gaps: List[str],
    employee: Dict[str, Any]
) -> List[Dict[str, Any]]:
    
    plan = []
    
    for skill in skill_gaps[:5]:  # Top 5 priority gaps
        # Estimate learning time based on skill complexity
        months_to_learn = estimate_learning_time(skill)
        
        # Determine priority based on role criticality
        priority = determine_priority(skill, role_requirements)
        
        # Recommend resources
        resources = [
            "Coursera / LinkedIn Learning courses",
            "Internal training programs",
            "Mentorship with experienced practitioners",
            "On-the-job learning through project assignments"
        ]
        
        plan.append({
            'skill': skill,
            'priority': priority,  # 'high', 'medium', 'low'
            'estimated_months_to_learn': months_to_learn,
            'recommended_resources': resources,
            'suggested_approach': generate_approach(skill)
        })
    
    return plan

def estimate_learning_time(skill: str) -> int:
    # Complex technical skills
    if skill in ['Machine Learning', 'Distributed Systems', 'Security Architecture']:
        return 12
    # Intermediate skills
    elif skill in ['Project Management', 'Data Analysis', 'API Design']:
        return 6
    # Basic skills
    else:
        return 3

def determine_priority(skill: str, requirements: List[str]) -> str:
    if skill in requirements[:3]:  # Top 3 requirements
        return 'high'
    elif skill in requirements[:7]:
        return 'medium'
    else:
        return 'low'
```

### Example Development Plan

**For**: Missing skills for Enterprise Architect role

```json
[
  {
    "skill": "Strategic Planning",
    "priority": "high",
    "estimated_months_to_learn": 6,
    "recommended_resources": [
      "Enterprise Architecture Strategy Course (Coursera)",
      "PSA Strategic Planning Workshop",
      "Mentorship with current Enterprise Architects",
      "Lead annual technology roadmap planning"
    ],
    "suggested_approach": "Start with foundational courses, then shadow strategic planning sessions, and finally lead a strategic initiative for your current team."
  },
  {
    "skill": "Vendor Management",
    "priority": "high",
    "estimated_months_to_learn": 4,
    "recommended_resources": [
      "Vendor Relationship Management Certification",
      "PSA Procurement Partnership Program",
      "Participate in RFP evaluation committees",
      "Lead vendor selection for next major project"
    ],
    "suggested_approach": "Observe current vendor negotiations, contribute to vendor scorecards, then lead a small vendor evaluation process."
  },
  {
    "skill": "Enterprise Integration",
    "priority": "medium",
    "estimated_months_to_learn": 6,
    "recommended_resources": [
      "Enterprise Integration Patterns (Book + Course)",
      "PSA Integration Architecture Standards",
      "Work with integration team on cross-system projects"
    ],
    "suggested_approach": "Study common integration patterns, document current integrations, propose improvements to existing architecture."
  }
]
```

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend Framework** | Flask 3.0 | REST API endpoints |
| **AI Embeddings** | Azure OpenAI (text-embedding-3-small) | Semantic similarity |
| **AI Narratives** | Azure OpenAI (gpt-5-mini) | Career narrative generation |
| **Fallback Embeddings** | Sentence Transformers (all-MiniLM-L6-v2) | Local embeddings |
| **Similarity Calculation** | scikit-learn (cosine_similarity) | Vector comparison |
| **Database** | SQLAlchemy + SQLite | Employee and role data |
| **Frontend Framework** | React 18 + Next.js 14 | Component-based UI |
| **Styling** | Tailwind CSS 3 | Responsive design |
| **HTTP Client** | Axios | API communication |
| **Icons** | Lucide React | Visual elements |

---

## API Endpoints

### `GET /api/match/employee/<employee_id>`

**Authentication**: Required (All Users)

**Query Parameters**:
- `top_k` (optional): Number of top matches to return (default: 5)
- `generate_narrative` (optional): Generate career narrative for top match (default: false)

**Request Example**:
```http
GET /api/match/employee/EMP-20001?top_k=5&generate_narrative=true
Authorization: Bearer <auth_token>
```

**Response Structure**:
```json
{
  "success": true,
  "employee": {
    "id": "EMP-20001",
    "name": "Samantha Lee",
    "current_role": "Cloud Solutions Architect"
  },
  "matches": [
    {
      "role": {
        "role_id": "ROLE-003",
        "title": "Enterprise Architect",
        "department": "Information Technology",
        "location": "Singapore HQ",
        "description": "Lead enterprise-wide architecture strategy...",
        "required_skills": ["Cloud Architecture", "Strategic Planning", ...],
        "preferred_skills": ["Vendor Management", "Security"]
      },
      "match_score": 95.3,
      "embedding_similarity": 92.1,
      "recommendation_strength": "Excellent Match",
      "skill_match": {
        "overall_score": 85.7,
        "required_match_count": 12,
        "required_total": 14,
        "required_matched": ["Cloud Architecture", "System Design", ...],
        "required_missing": ["Strategic Planning", "Vendor Management"],
        "preferred_match_count": 3,
        "preferred_total": 5,
        "preferred_matched": ["Security", "Leadership", "Communication"]
      },
      "career_narrative": "Samantha, your deep expertise in cloud architecture...",
      "development_plan": [
        {
          "skill": "Strategic Planning",
          "priority": "high",
          "estimated_months_to_learn": 6,
          "recommended_resources": [...],
          "suggested_approach": "Start with foundational courses..."
        }
      ]
    }
  ],
  "timestamp": "2025-10-20T10:30:00Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Employee not found",
  "timestamp": "2025-10-20T10:30:00Z"
}
```

---

## Usage Examples

### Example 1: Employee Exploring Career Options

**Scenario**: Samantha Lee wants to explore what roles match her background.

**Request**:
```http
GET /api/match/employee/EMP-20001?top_k=5&generate_narrative=true
```

**Results**:
1. **Enterprise Architect** (95.3% match - Excellent Match)
   - Matched Skills: Cloud Architecture, System Design, Infrastructure, Security (12/14)
   - Skills to Acquire: Strategic Planning, Vendor Management
   - Career Narrative: Personalized 150-word story highlighting her migration project success
   - Development Plan: 6-month plan to acquire strategic planning skills

2. **Cloud Infrastructure Lead** (89.7% match - Excellent Match)
   - Matched Skills: IaC, Cloud Platforms, DevOps, Automation (13/15)
   - Skills to Acquire: Team Leadership, Budget Management
   - Ready within: 6-12 months with leadership development

3. **Security Architect** (78.4% match - Strong Match)
   - Matched Skills: Zero-Trust, Security, Cloud (8/12)
   - Skills to Acquire: Threat Modeling, Compliance, SIEM
   - Ready within: 12-18 months with security upskilling

### Example 2: HR Admin Evaluating Talent Pool

**Scenario**: HR needs to fill an Enterprise Architect position and wants to identify internal candidates.

**Process**:
1. Run role matching for all employees against Enterprise Architect role
2. Filter results by match_score >= 70 (Strong Match or better)
3. Review top candidates' career narratives and development plans
4. Prioritize based on:
   - Match score
   - Development plan timelines
   - Current career trajectories
   - Organizational needs

**Output**: List of qualified candidates with readiness timelines and development investments required.

### Example 3: Employee Development Planning

**Scenario**: Employee wants to target a specific role and needs a development roadmap.

**Process**:
1. Run role matching to identify target role
2. Review skill gaps from skill_match details
3. Follow development plan recommendations
4. Track progress over 6-12 months
5. Re-run matching to measure improvement

---

## Configuration

### Environment Variables

```env
# Azure OpenAI Configuration (via APIM)
AZURE_OPENAI_API_KEY=your-apim-subscription-key
AZURE_OPENAI_ENDPOINT=https://psacodesprint2025.azure-api.net/
AZURE_EMBED_DEPLOYMENT=text-embedding-3-small
AZURE_CHAT_DEPLOYMENT=gpt-5-mini

# Embedding Model Selection
# Set to 'true' to use local embeddings first (fast, free, offline)
# Set to 'false' to use Azure OpenAI embeddings first (higher quality)
USE_LOCAL_EMBEDDINGS=false

# Matching Configuration (optional)
DEFAULT_TOP_K=5
MAX_NARRATIVE_LENGTH=200
```

### Backend Configuration

**Matching Parameters**:
```python
# ai_engine.py

# Scoring weights
SEMANTIC_WEIGHT = 0.6  # Semantic similarity weight
SKILL_WEIGHT = 0.4     # Skill match weight

# Skill scoring weights
REQUIRED_SKILL_WEIGHT = 0.7   # Required skills importance
PREFERRED_SKILL_WEIGHT = 0.3  # Preferred skills importance

# Default values
DEFAULT_TOP_K = 5
MAX_NARRATIVE_TOKENS = 20000
```

### Frontend Configuration

```javascript
// services/api.js

export const careerCompassAPI = {
  matchEmployee: async (employeeId, topK = 5, generateNarrative = false) => {
    const response = await axios.get(
      `${API_URL}/match/employee/${employeeId}`,
      {
        params: { top_k: topK, generate_narrative: generateNarrative },
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      }
    );
    return response.data;
  }
};
```

---

## Performance Optimization

### Caching Strategy

**Role Embeddings**:
- Pre-compute embeddings for all roles
- Cache embeddings in memory during API lifetime
- Invalidate cache when roles are updated

**Employee Embeddings**:
- Generate on-demand (employee profiles change frequently)
- Consider session-level caching for repeat queries

### Batch Processing

For bulk matching (e.g., matching all employees to a new role):

```python
def batch_match_employees(
    employee_ids: List[str],
    target_role_id: str,
    batch_size: int = 10
) -> Dict[str, List[Dict[str, Any]]]:
    
    results = {}
    
    # Fetch target role once
    target_role = session.query(Role).filter_by(role_id=target_role_id).first()
    target_role_embedding = generate_embedding(create_role_text(target_role))
    
    # Process employees in batches
    for i in range(0, len(employee_ids), batch_size):
        batch_ids = employee_ids[i:i+batch_size]
        employees = session.query(Employee).filter(
            Employee.employee_id.in_(batch_ids)
        ).all()
        
        for employee in employees:
            match = calculate_single_match(employee, target_role, target_role_embedding)
            results[employee.employee_id] = match
    
    return results
```

### Embedding Optimization

**Local Fallback Benefits**:
- No API latency for embedding generation
- No API costs
- Works offline
- Suitable for development/testing

**When to Use Azure vs. Local**:
- **Azure**: Production, high-accuracy requirements, diverse language content
- **Local**: Development, cost-sensitive scenarios, offline requirements

---

## Future Enhancements

1. **Skill Taxonomy Integration**: Map skills to industry-standard taxonomies (e.g., ESCO, O*NET)
2. **Career Path Recommendations**: Multi-hop career paths (e.g., current → intermediate → target role)
3. **Historical Success Analysis**: Learn from past successful transitions
4. **Diversity & Inclusion**: Ensure fair matching across demographics
5. **Real-Time Updates**: Notify employees when new matching roles are posted
6. **Skills Endorsements**: Peer validation of employee skills
7. **Interview Preparation**: Auto-generate interview questions based on skill gaps
8. **Market Benchmarking**: Compare internal roles to external market opportunities
9. **Mobile App**: Native mobile experience for on-the-go career exploration
10. **Gamification**: Achievements and milestones for skill development

---

## Troubleshooting

### Common Issues

**Issue**: Low match scores across all roles
- **Cause**: Employee profile may be incomplete or skills not aligned with available roles
- **Fix**: Update employee profile with additional skills, projects, and competencies

**Issue**: Semantic similarity very low despite skill matches
- **Cause**: Profile text may be too brief or lack context
- **Fix**: Enrich employee and role descriptions with more detailed information

**Issue**: Career narrative generation fails
- **Cause**: Azure OpenAI API timeout or rate limit
- **Fix**: Check Azure APIM subscription status, implement retry logic

**Issue**: Embeddings generation slow
- **Cause**: Azure OpenAI API latency
- **Fix**: Enable local embeddings fallback with `USE_LOCAL_EMBEDDINGS=true`

---

**🔗 Related Documentation**:
- [Compass Copilot](./COMPASS_COPILOT.md)
- [Career Roadmap](./CAREER_ROADMAP.md)
- [Leadership Potential](./LEADERSHIP_POTENTIAL.md)
- [Main README](../README.md)

---

**Built with 💙 by Team Tribyte for PSA Code Sprint Singapore 2025**
