# 🤖 Compass Copilot - Conversational AI Career Assistant

![Employee Only](https://img.shields.io/badge/Access-Employee%20Only-blue)
![Azure OpenAI](https://img.shields.io/badge/Powered%20by-Azure%20OpenAI-412991)
![Intent Classification](https://img.shields.io/badge/AI-Intent%20Classification-green)

**Compass Copilot** is an intelligent conversational AI assistant that provides personalized, context-aware career guidance to PSA employees through natural language conversations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Intent Classification System](#intent-classification-system)
- [Response Generation Pipeline](#response-generation-pipeline)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)

---

## Overview

### Purpose

Compass Copilot acts as a 24/7 career advisor, leveraging employee profile data and Azure OpenAI to provide:
- **Profile summaries** with achievement highlighting
- **Role recommendations** based on skills and experience
- **Skill gap analysis** for target roles
- **Wellbeing support** for work-life balance and mental health
- **General career Q&A** with conversational flexibility

### Key Features

- **Context-Aware**: Automatically accesses authenticated employee's complete profile (skills, projects, competencies, career history)
- **Intent-Driven**: Classifies user queries into specific intents for optimized response generation
- **Evidence-Based**: Links responses to specific achievements, projects, and skills with citations
- **Conversational Memory**: Maintains conversation history for contextual follow-up questions
- **Empathetic Responses**: Uses Azure OpenAI GPT-5-mini for human-like, supportive interactions
- **Actionable Guidance**: Provides suggested next steps and actions after each response

---

## Architecture

### System Flow

```
User Message
    ↓
[Authentication] → Verify employee identity via token
    ↓
[Intent Classification] → Classify query into intent category
    ↓
[Data Retrieval] → Fetch employee profile + relevant context
    ↓
[Intent Router] → Route to specialized handler
    ↓
├── Profile Summary Handler
├── Role Recommendations Handler
├── Skill Gap Analysis Handler
├── Wellbeing Support Handler
└── General Q&A Handler (Azure OpenAI)
    ↓
[Response Generation] → Generate response with citations
    ↓
[Return to User] → JSON response with text, citations, suggested actions
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (copilot.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Chat Input   │  │ Message List │  │ Citation Display │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓ POST /api/chat
┌─────────────────────────────────────────────────────────────┐
│                    Backend (app.py)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ @require_employee Decorator → Auth Check            │   │
│  └──────────────────────────────────────────────────────┘   │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ classify_intent() → Intent Detection                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Intent Handlers (ai_engine.py)                         │ │
│  │  - generate_profile_summary()                          │ │
│  │  - format_role_recommendations()                       │ │
│  │  - generate_skill_gap_analysis()                       │ │
│  │  - generate_wellbeing_support()                        │ │
│  │  - generate_general_qa_response() → Azure OpenAI      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Azure OpenAI (gpt-5-mini)                      │
│  - Conversational responses                                 │
│  - Context-aware guidance                                   │
│  - Empathetic career counseling                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Intent Classification System

### Intent Categories

The system classifies user queries into 5 primary intents:

#### 1. `profile_summary`
**Trigger Patterns**:
- "show my profile"
- "view my profile"
- "complete profile"
- "profile summary"

**Response**: Structured summary of employee's background, skills, competencies, and key achievements.

**Example Output**:
```
You're Samantha Lee, currently a Cloud Solutions Architect in IT with 3.5 years at PSA...

🎯 Core Strengths:
• Cloud Architecture (Expert)
• Infrastructure Design (Advanced)
• ...

🏆 Top Achievements:
• Hybrid Cloud Migration: 30% infrastructure cost reduction, 99.95% availability
• ...
```

#### 2. `role_recommendations`
**Trigger Patterns**:
- "show me all roles"
- "list all roles"
- "what roles are available"
- "show matching roles"

**Response**: Top 5 role matches with scores, skill breakdowns, and alignment analysis.

**Example Output**:
```
Based on your profile, here are your top role matches:

1. Enterprise Architect (95% match)
   ✅ Matched Skills: Cloud Architecture, System Design, Security
   📚 To Develop: Enterprise Strategy, Vendor Management
   ...
```

#### 3. `skill_gap`
**Trigger Patterns**:
- "skill gap for [role]"
- "skills needed for [role]"
- "what skills do I need for [role]"

**Requires**: Mention of a specific role title in the query.

**Response**: Detailed skill gap analysis with current skills, missing skills, and development recommendations.

#### 4. `wellbeing_support`
**Trigger Patterns**:
- Mental health keywords: "stressed", "overwhelmed", "burnout", "mental health"
- Work-life balance: "work-life balance", "exhausted", "tired"
- Engagement: "unmotivated", "lack of motivation", "struggling"

**Response**: Supportive, empathetic guidance with resources and actionable advice.

**Example Output**:
```
I hear you're feeling stressed. That's completely valid...

Here are some immediate steps:
• Connect with your manager for workload discussion
• Access PSA's Employee Assistance Program (EAP)
• Consider flexible work arrangements
...
```

#### 5. `general_qa` (Default)
**Trigger**: All other queries not matching specific patterns.

**Response**: Uses Azure OpenAI GPT-5-mini for flexible, conversational responses.

**Handles**:
- "How can I grow in my role?"
- "What roles fit me?" (conversational)
- "Tell me about my skills" (natural language)
- Follow-up questions with context

---

## Response Generation Pipeline

### 1. Profile Summary Generation

**Function**: `generate_profile_summary(employee_dict)`

**Logic**:
1. Extract employee metadata (name, role, tenure, department)
2. Identify core strengths (top skills, competencies)
3. Extract top achievements from projects (quantifiable outcomes)
4. Generate summary with structured formatting
5. Add citations linking to specific projects/skills
6. Suggest next actions

**Citations Format**:
```python
{
    "source": "project",
    "text": "Hybrid Cloud Migration",
    "details": ["30% cost reduction", "99.95% availability"]
}
```

### 2. Role Recommendations

**Function**: `format_role_recommendations(matches, employee_dict)`

**Logic**:
1. Use existing `match_employee_to_roles()` for scoring
2. For each top match:
   - Calculate combined score (60% semantic + 40% skill)
   - Identify matched skills
   - List skill gaps
   - Generate alignment narrative
3. Format as numbered list with visual indicators
4. Add citations for matched skills
5. Suggest actions (view role details, find mentor)

### 3. Skill Gap Analysis

**Function**: `generate_skill_gap_analysis(employee_dict, target_role, all_roles, user_message)`

**Logic**:
1. Extract target role from user message
2. Match target role against available roles
3. Compare employee skills vs. role requirements
4. Categorize gaps by priority (high/medium)
5. Estimate learning timelines
6. Recommend resources (courses, mentorship, projects)
7. Generate development plan

### 4. Wellbeing Support

**Function**: `generate_wellbeing_support(employee_dict, user_message, conversation_history)`

**Logic**:
1. Detect wellbeing keywords (stress, burnout, balance)
2. Use Azure OpenAI for empathetic response generation
3. Provide specific resources:
   - Employee Assistance Program (EAP)
   - Manager connection
   - Flexible work arrangements
   - Learning opportunities for re-engagement
4. Maintain supportive, non-judgmental tone
5. Avoid exit intent detection (stay positive)

**System Prompt (Wellbeing)**:
```
You are a compassionate career wellness advisor at PSA International.

The employee has expressed concerns about wellbeing. Your response should:
1. Validate their feelings without being dismissive
2. Provide 2-3 actionable steps they can take immediately
3. Reference PSA's support resources (EAP, flexible work, manager support)
4. Be warm, empathetic, and professional
5. Keep response concise (100-150 words)

Avoid:
- Generic platitudes ("just relax")
- Suggesting they leave PSA
- Medical advice
```

### 5. General Q&A (Azure OpenAI)

**Function**: `generate_general_qa_response(employee_dict, user_message, all_roles, conversation_history)`

**Logic**:
1. Build context from employee profile
2. Include conversation history for continuity
3. Send to Azure OpenAI GPT-5-mini with structured prompt
4. Extract citations from response
5. Generate suggested actions based on response theme

**System Prompt (General Q&A)**:
```
You are a knowledgeable career advisor at PSA International.

Employee Context:
- Name: {name}
- Role: {job_title}
- Department: {department}
- Key Skills: {top_skills}
- Recent Projects: {projects}

Conversation History: {history}

User Question: {user_message}

Provide a helpful, specific response (150-200 words) that:
1. Acknowledges their question directly
2. Leverages their specific background and achievements
3. Provides 2-3 actionable next steps
4. Maintains encouraging, professional tone
5. References specific PSA resources when relevant

Be conversational, not overly formal.
```

---

## Tech Stack

### Backend Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Web Framework** | Flask 3.0 | REST API endpoints |
| **Authentication** | Custom token-based | Employee identity verification |
| **Intent Classification** | Pattern matching + context | Query categorization |
| **AI Engine** | Azure OpenAI (gpt-5-mini) | Conversational responses |
| **Database** | SQLAlchemy + SQLite | Employee profile retrieval |
| **Role Matching** | Cosine similarity (scikit-learn) | Semantic role matching |

### Frontend Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **UI Framework** | React 18 + Next.js 14 | Component-based UI |
| **Styling** | Tailwind CSS 3 | Responsive design |
| **HTTP Client** | Axios | API communication |
| **Icons** | Lucide React | Visual elements |
| **State Management** | React useState/useEffect | Local state |

### AI Models

- **GPT-5-mini**: Chat completions for general Q&A, wellbeing support, career guidance
- **text-embedding-3-small**: Semantic embeddings for role matching (via `ai_engine.py`)

---

## API Endpoints

### `POST /api/chat`

**Authentication**: Required (Employee Only)

**Request Body**:
```json
{
  "message": "What roles fit me?",
  "conversation_history": [
    {"role": "user", "content": "Show my profile"},
    {"role": "assistant", "content": "You're Samantha Lee..."}
  ]
}
```

**Response**:
```json
{
  "success": true,
  "response_text": "Based on your background as a Cloud Solutions Architect...",
  "citations": [
    {
      "source": "skill",
      "text": "Cloud Architecture",
      "details": ["Expert level", "5 years experience"]
    },
    {
      "source": "project",
      "text": "Hybrid Cloud Migration",
      "details": ["30% cost reduction", "99.95% availability"]
    }
  ],
  "suggested_actions": [
    "View Enterprise Architect role details",
    "Connect with cloud architecture mentor"
  ],
  "intent": "role_recommendations"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "No employee profile associated with this account",
  "response_text": "I encountered an error. Please try again."
}
```

---

## Usage Examples

### Example 1: Profile Summary Request

**User Input**:
```
Show my profile
```

**System Process**:
1. Intent classified as `profile_summary`
2. Fetch employee EMP-20001 (Samantha Lee)
3. Extract skills, projects, competencies
4. Generate structured summary
5. Add citations for top achievements

**Response Excerpt**:
```
You're Samantha Lee, currently a Cloud Solutions Architect in Information Technology with 3.5 years at PSA...

🎯 Core Strengths:
• Cloud Architecture (Expert)
• Infrastructure Design (Advanced)
• Zero-Trust Security (Intermediate)

🏆 Top Achievements:
• Hybrid Cloud Migration: Achieved 30% infrastructure cost reduction and 99.95% service availability
• Vulnerability Management Platform: Reduced Mean Time To Remediate by 22%

📊 Career Progression:
You've advanced 2 levels in 3.5 years, showing strong growth velocity.

💡 Next Steps:
• Explore Enterprise Architect opportunities
• Develop strategic planning skills
• Consider leadership track roles
```

### Example 2: Conversational Role Query

**User Input**:
```
What roles would be a good fit for me given my cloud experience?
```

**System Process**:
1. Intent classified as `general_qa` (not exact match pattern)
2. Send to Azure OpenAI with employee context
3. GPT-5-mini generates conversational response
4. Extract role mentions for citations
5. Add suggested actions

**Response Excerpt**:
```
Given your expertise in cloud architecture and infrastructure design, several roles align well with your background:

**Enterprise Architect** would be a natural progression, allowing you to leverage your cloud migration experience at a strategic level. Your work on the Hybrid Cloud Migration project demonstrates the systems thinking this role requires.

**Cloud Infrastructure Lead** is another strong fit, especially given your hands-on experience with IaC pipelines and zero-trust security. The 99.95% availability you achieved shows you can handle large-scale reliability.

To strengthen your candidacy for these roles, consider:
• Building strategic planning experience through cross-departmental initiatives
• Mentoring junior architects to develop leadership skills
• Exploring vendor management in cloud partnerships

Would you like to dive deeper into any specific role?
```

### Example 3: Wellbeing Support

**User Input**:
```
I'm feeling really stressed and overwhelmed with my current workload
```

**System Process**:
1. Intent classified as `wellbeing_support` (keyword: "stressed", "overwhelmed")
2. Send to Azure OpenAI with empathy-focused system prompt
3. Generate supportive response with resources
4. Provide actionable steps

**Response Excerpt**:
```
I hear you, Samantha, and it's completely valid to feel overwhelmed—especially when you're managing complex projects like cloud migrations. Your wellbeing matters, and PSA has resources to support you.

Here are some immediate steps you can take:

🤝 **Talk to Your Manager**: Schedule a 1-on-1 to discuss workload prioritization and potential delegation. You don't have to carry everything alone.

💚 **Access Employee Assistance Program (EAP)**: PSA's confidential counseling service is available 24/7 for stress management and mental health support.

⏰ **Flexible Work Options**: Consider discussing flexible arrangements with HR—sometimes adjusting your schedule can make a big difference.

📚 **Skill Development**: Sometimes learning new efficiency tools (like automation or delegation frameworks) can reduce long-term stress.

You've achieved remarkable things (30% cost reduction, 99.95% availability!). Let's make sure you're sustainable in delivering that impact. What feels like the highest priority for you right now?
```

---

## Configuration

### Environment Variables

```env
# Required for General Q&A and Wellbeing Support
AZURE_OPENAI_API_KEY=your-apim-subscription-key
AZURE_OPENAI_ENDPOINT=https://psacodesprint2025.azure-api.net/
AZURE_CHAT_DEPLOYMENT=gpt-5-mini

# Required for Role Matching (embeddings)
AZURE_EMBED_DEPLOYMENT=text-embedding-3-small
```

### Backend Configuration (`ai_engine.py`)

```python
# Azure OpenAI client initialization
client = AzureOpenAI(
    api_key=AZURE_API_KEY,
    azure_endpoint=AZURE_ENDPOINT,
    api_version="2025-01-01-preview",
    default_headers={"Ocp-Apim-Subscription-Key": AZURE_API_KEY}
)

# Chat completion for Copilot
response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ],
    max_completion_tokens=20000
)
```

### Frontend Configuration (`copilot.js`)

```javascript
// API call with authentication
const response = await fetch(`${API_URL}/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: JSON.stringify({
    message: userMessage,
    conversation_history: messages
  })
});
```

---

## Performance Optimization

### Intent Classification
- **Pattern-based matching** (fast, no API calls) for specific intents
- **Context-aware** follow-up detection using conversation history
- **Fallback to GPT** only when needed (general Q&A)

### Response Caching
- Employee profiles cached per session
- Role data fetched once per conversation
- Embeddings pre-computed for roles

### Lazy Loading
- Conversation history sent incrementally
- Citations generated on-demand
- Suggested actions computed post-response

---

## Security & Privacy

- **Authentication Required**: All chat requests require valid employee token
- **Profile Isolation**: Employees can only access their own data
- **No Data Persistence**: Conversations not stored in database (session only)
- **Role-Based Access**: Only employees (not admins) can use Copilot
- **Audit Logging**: All chat requests logged with employee ID and timestamp

---

## Future Enhancements

1. **Multi-Language Support**: Detect user language and respond in-kind
2. **Voice Interface**: Speech-to-text integration for hands-free interaction
3. **Proactive Suggestions**: Trigger notifications based on career milestones
4. **Conversation Persistence**: Store chat history for continuity across sessions
5. **Feedback Loop**: Collect thumbs up/down to improve intent classification
6. **Integration with Calendar**: Suggest meeting times with mentors/managers
7. **Skills Recommendations**: Proactively suggest courses based on conversation themes

---

## Troubleshooting

### Common Issues

**Issue**: "No response from server"
- **Cause**: Backend not running or authentication failed
- **Fix**: Verify Flask server is running on port 5000, check auth token in localStorage

**Issue**: "I encountered an error processing your request"
- **Cause**: Azure OpenAI API timeout or rate limit
- **Fix**: Check Azure APIM subscription status, retry request after 30 seconds

**Issue**: Intent misclassification
- **Cause**: Query doesn't match pattern exactly
- **Fix**: System will fall back to general Q&A (GPT) for natural handling

---

**🔗 Related Documentation**:
- [Career Roadmap](./CAREER_ROADMAP.md)
- [Leadership Potential](./LEADERSHIP_POTENTIAL.md)
- [Main README](../README.md)

---

**Built with 💙 by Team Tribyte for PSA Code Sprint Singapore 2025**
