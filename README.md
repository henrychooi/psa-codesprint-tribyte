# Career Compass - Module 1: Role Matching & Narrative Generation

## 🎯 Overview

Career Compass is an AI-powered career development platform that matches employees to ideal roles using advanced machine learning and generates personalized career narratives. This is Module 1 of the COMPASS Hackathon project.

## 🏗️ Architecture

### Backend (Flask + Python)
- **Framework**: Flask (lightweight REST API)
- **Database**: SQLite (embedded, zero-config)
- **ORM**: SQLAlchemy
- **AI/ML**: OpenAI API (GPT-4 for narratives, text-embedding-3-small for embeddings)
- **Matching**: Cosine similarity using scikit-learn

### Frontend (React)
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 🚀 Quick Start (30 minutes)

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API Key

### Step 1: Clone & Setup Backend

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Edit .env and add your OpenAI API key
notepad .env
```

**Add your OpenAI API key to `.env`:**
```
OPENAI_API_KEY=sk-your-actual-api-key-here
FLASK_ENV=development
DATABASE_URL=sqlite:///compass.db
```

### Step 2: Load Data

```powershell
# Still in backend directory
python load_data.py
```

You should see:
```
✅ Loaded 5 employees
✅ Loaded 5 roles
```

### Step 3: Start Backend Server

```powershell
python app.py
```

Server will start on `http://localhost:5000`

### Step 4: Setup Frontend (New Terminal)

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open at `http://localhost:3000`

## 📊 Features Implemented

### ✅ Phase 1A: Data Foundation (Completed)
- [x] Database schema with Employee, Role, CareerPath models
- [x] SQLAlchemy ORM setup
- [x] Data loading scripts for 5 employee profiles
- [x] Sample roles with skill requirements

### ✅ Phase 1B: AI Matching Engine (Completed)
- [x] OpenAI embedding generation
- [x] Cosine similarity matching (60% weight)
- [x] Skill gap analysis (40% weight)
- [x] Combined scoring algorithm
- [x] Top-K role recommendations

### ✅ Phase 1C: Narrative Generation (Completed)
- [x] GPT-4 powered career narratives
- [x] Context-aware prompts with employee & role data
- [x] Development plan generation
- [x] Actionable next steps

### ✅ Phase 1D: REST API (Completed)
- [x] GET `/api/employees` - List all employees
- [x] GET `/api/employees/<id>` - Get employee profile
- [x] GET `/api/roles` - List all roles
- [x] GET `/api/match/employee/<id>` - Match employee to roles
- [x] POST `/api/narrative/generate` - Generate narrative for specific pairing

### ✅ Phase 1E: React Frontend (Completed)
- [x] Employee search interface
- [x] Employee profile display
- [x] Role match cards with scores
- [x] Skill gap visualization
- [x] Career narrative display
- [x] Development roadmap

## 🎨 UI Components

### 1. **EmployeeSearch.js**
- Search bar with real-time filtering
- Employee list with job titles and departments
- Skill count badges

### 2. **EmployeeProfile.js**
- Personal information card
- Current role details
- Skills and competencies
- Education history

### 3. **RoleMatches.js**
- Top 5 role recommendations
- Match scores with color coding
- Expandable skill details
- Matched vs. missing skills

### 4. **CareerNarrative.js**
- AI-generated career story
- Development roadmap with priorities
- Actionable next steps
- Timeline estimates

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

### Get All Employees
```http
GET /api/employees
```

### Match Employee to Roles
```http
GET /api/match/employee/EMP-20001?top_k=5&generate_narrative=true
```

**Response:**
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
      "role": { ... },
      "match_score": 87.3,
      "embedding_similarity": 89.2,
      "skill_match": {
        "overall_score": 85.0,
        "required_matched": ["Cloud Architecture", "..."],
        "required_missing": ["..."]
      },
      "career_narrative": "...",
      "development_plan": [...]
    }
  ]
}
```

## 🧠 AI Matching Algorithm

### 1. Embedding Generation
```python
profile_text = create_profile_text(employee)
embedding = generate_embedding(profile_text)  # OpenAI text-embedding-3-small
```

### 2. Similarity Calculation
```python
cosine_sim = cosine_similarity([employee_emb], [role_emb])[0][0]
```

### 3. Skill Matching
```python
required_score = matched / required_total
preferred_score = matched / preferred_total
skill_score = (required * 0.7) + (preferred * 0.3)
```

### 4. Combined Score
```python
final_score = (cosine_sim * 0.6) + (skill_score * 0.4)
```

## 🎯 Demo Flow

1. **Open App** → Search interface with 5 employees
2. **Select Employee** → Profile loads on left sidebar
3. **View Matches** → Top 5 roles with match scores
4. **Read Narrative** → AI-generated career story
5. **Explore Details** → Expand to see skill gaps, responsibilities

## 🐛 Troubleshooting

### Backend Issues

**Error: "No module named 'flask'"**
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Error: "OpenAI API key not found"**
```powershell
# Check .env file exists and contains key
notepad .env
```

**Database errors**
```powershell
# Delete and reload database
Remove-Item compass.db
python load_data.py
```

### Frontend Issues

**Error: "npm: command not found"**
- Install Node.js from https://nodejs.org/

**Port 3000 already in use**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Module not found errors**
```powershell
# Reinstall dependencies
Remove-Item -Recurse node_modules
npm install
```

## 📈 Performance

- **Embedding Generation**: ~500ms per profile
- **Matching 5 Roles**: ~2-3 seconds
- **Narrative Generation**: ~3-5 seconds (GPT-4)
- **Total Flow**: ~5-8 seconds end-to-end

## 🔒 Security Notes

- Never commit `.env` file
- API keys stored in environment variables
- CORS enabled for localhost development
- For production: Add authentication, rate limiting, HTTPS

## 🚧 Future Enhancements (Post-Hackathon)

- [ ] Cache embeddings to reduce API calls
- [ ] Batch processing for multiple employees
- [ ] Role recommendation explanations (SHAP values)
- [ ] Career path visualization (graph)
- [ ] Export narratives as PDF
- [ ] Integration with HR systems

## 👥 Team

Built for PSA Code Sprint 2025 - Team Tribyte

## 📄 License

See LICENSE file

---

**Ready to demo! 🎉**

For questions or issues during the hackathon, refer to this README or check the inline code comments.
