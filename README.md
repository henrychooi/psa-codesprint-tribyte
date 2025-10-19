# PSA Code Sprint 2025 - Career Compass

![Flask](https://img.shields.io/badge/Flask-3.0-black)
![React](https://img.shields.io/badge/React-18-61dafb)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive AI-powered career development platform featuring conversational AI guidance, predictive career roadmaps, and leadership potential assessment with explainable scoring. Built for **PSA Code Sprint Singapore 2025**.

## 🎯 Team Tribyte

Built with ❤️ for PSA Code Sprint 2025 hackathon.

## ✨ Core Features

### 🤖 Compass Copilot - Conversational AI Career Assistant

**Employee-only feature** providing personalized, context-aware career guidance through natural conversation.

- **Intent-Driven Responses**: Intelligent classification of user queries (profile summary, role recommendations, skill gaps, wellbeing support, general Q&A)
- **Profile-Aware Conversations**: Automatically accesses authenticated employee's data for personalized responses
- **Evidence-Based Citations**: Links responses to specific projects, skills, and achievements from employee profile
- **Multi-Intent Support**: Handles diverse career questions from role matching to work-life balance support
- **Contextual Suggestions**: Provides actionable next steps based on conversation flow
- **Azure OpenAI Integration**: Leverages GPT-5-mini for human-like, empathetic career counseling

[📖 View Compass Copilot Documentation](./docs/COMPASS_COPILOT.md)

### 🗺️ Career Roadmap - Predictive Career Path Simulation

**Role-based access**: Current roadmap for employees, predictive simulations for admins only.

- **Current Roadmap (All Users)**:
  - Next 2-3 year progression based on current trajectory
  - Logical next roles with skill match scores
  - Skills gap identification with prioritization
  - Career anchor analysis
  - Timeline visualization with estimated milestones

- **Predicted Roadmap with Simulations (Admin Only)**:
  - 10-year career projections across multiple scenarios
  - **Scenario Types**:
    - `steady_growth`: Normal career progression
    - `aggressive_growth`: Fast-track advancement
    - `lateral_mobility`: Cross-functional moves
    - `specialization`: Deep domain expertise
  - Risk factor analysis and retention insights
  - Optimal path recommendation based on employee profile
  - Comparative scenario analysis

[📖 View Career Roadmap Documentation](./docs/CAREER_ROADMAP.md)

### 📊 Leadership Potential - Explainable Scoring with AI Augmentation

**Evidence-based leadership assessment** combining heuristic analysis with Azure OpenAI sentiment analysis.

- **4-Component Scoring Model**:
  - **Outcome Impact (25%)**: Quantified project outcomes with sentiment analysis
  - **Stakeholder Complexity (25%)**: Cross-functional engagement and diversity detection
  - **Change Management (20%)**: Transformation competencies and change leadership
  - **Progression Velocity (30%)**: Career advancement rate and trajectory

- **Azure OpenAI Augmentations**:
  - Sentiment analysis of project outcomes (positive/neutral/negative with confidence scoring)
  - Quantitative metrics extraction (percentages, ratios, absolute values)
  - Stakeholder type classification (internal, cross-functional, external, senior)
  - Engagement quality grading (low/medium/high)
  - 60/40 merge strategy (60% base heuristics + 40% AI-derived insights)

- **Explainability Features**:
  - Component breakdown with evidence linking
  - Interactive visualizations (bar charts, score cards)
  - Evidence modal with project outcomes and stakeholder examples
  - Percentile ranking estimation
  - Personalized improvement suggestions

[📖 View Leadership Potential Documentation](./docs/LEADERSHIP_POTENTIAL.md)

### 🔍 AI-Powered Role Matching

- **Intelligent Matching Algorithm**: Combines semantic similarity and skill analysis
- **Dual-Weight Scoring System**:
  - 60% Semantic similarity using embeddings
  - 40% Skill gap analysis
- **Career Narrative Generation**: AI-generated personalized career stories using Azure OpenAI
- **Development Plans**: Prioritized action plans with timelines

### 🔐 Authentication & Role-Based Access Control

- **Demo Authentication System**: Username/password login with role-based permissions
- **User Roles**:
  - `employee`: Access to Compass Copilot, own career roadmap, leadership assessment
  - `admin`: Full access including predicted roadmaps, all employee data, user management
- **Protected Routes**: Frontend and backend enforcement of role-based access
- **Session Management**: Token-based authentication with user context

### 🎨 Modern User Interface

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Glass Morphism UI**: Modern frosted glass aesthetic with floating orbs
- **PSA Branding**: Custom color scheme with indigo/blue gradients
- **Interactive Components**: Smooth transitions, loading states, and error handling

## 🚀 Tech Stack

### Backend
- **Framework**: [Flask 3.0](https://flask.palletsprojects.com/)
- **Database**: SQLite with [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **AI/ML**: 
  - [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) via APIM
    - `gpt-5-mini`: Chat completions for narratives and copilot
    - `text-embedding-3-small`: Semantic embeddings
  - Local fallback: [Sentence Transformers](https://www.sbert.net/) (all-MiniLM-L6-v2)
  - [scikit-learn](https://scikit-learn.org/) for cosine similarity
  - [python-dateutil](https://dateutil.readthedocs.io/) for career timeline calculations
- **API**: RESTful endpoints with Flask-CORS
- **Authentication**: Simple token-based auth with role-based access control

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with React 18
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts 2](https://recharts.org/) for leadership visualizations

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 18+ and npm
- Azure OpenAI API access via APIM (or local embeddings fallback)

## 🛠️ Installation & Setup

### 1. Clone the repository

```powershell
git clone https://github.com/henrychooi/psa-codesprint-tribyte.git
cd psa-codesprint-tribyte
```

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```powershell
# Create .env file from example
Copy-Item .env.example .env

# Edit .env with your API credentials
notepad .env
```

**Update `.env` with your credentials:**
```env
# Azure OpenAI Configuration (via APIM)
AZURE_OPENAI_API_KEY=your-apim-subscription-key
AZURE_OPENAI_ENDPOINT=https://psacodesprint2025.azure-api.net/
AZURE_EMBED_DEPLOYMENT=text-embedding-3-small
AZURE_CHAT_DEPLOYMENT=gpt-5-mini

# Embedding Model Selection
# Set to 'true' to use local sentence-transformers first (fast, free, offline)
# Set to 'false' or omit to use Azure OpenAI embeddings first (higher quality, requires API)
USE_LOCAL_EMBEDDINGS=false

# Flask Configuration
FLASK_ENV=development
DATABASE_URL=sqlite:///compass.db
```

**Note**: The system will automatically fall back to local sentence-transformers if Azure OpenAI is unavailable.

### 4. Initialize Database

```powershell
# Load employee profiles and roles
python load_data.py
```

Expected output:
```
🚀 Starting data load...
📂 Loading employees from Employee_Profiles.json...
  ✅ Added Samantha Lee
  ✅ Added Nur Aisyah Binte Rahman
  ✅ Added Rohan Mehta
  ✅ Added Grace Lee
  ✅ Added Felicia Goh
✅ Loaded 5 employees
📂 Loading sample roles...
  ✅ Added Senior Cloud Architect
  ✅ Added Cybersecurity Manager
  ✅ Added Financial Planning Director
  ✅ Added HR Business Partner (Senior)
  ✅ Added Treasury Manager
✅ Loaded 5 roles

✅ Data loading complete!
   Employees: 5
   Roles: 5
```

### 5. Start Backend Server

```powershell
python app.py
```

Backend API will start on `http://localhost:5000`

### 6. Frontend Setup (New Terminal)

```powershell
# Navigate to frontend directory (from project root)
cd ..\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will open at `http://localhost:3000`

## 🔑 Demo Users & Access

The system includes demo accounts for testing:

### Employees (Employee Access)
```
Username: samantha.lee    Password: password123
Username: aisyah.rahman   Password: password123
Username: rohan.mehta     Password: password123
Username: grace.lee       Password: password123
Username: felicia.goh     Password: password123
```

### Administrators (Full Access)
```
Username: admin           Password: admin123
Username: hr.admin        Password: admin123
```

**Employee Access**: Compass Copilot, own career roadmap (current), leadership assessment, role matching

**Admin Access**: All employee features + predicted roadmaps with simulations, all employee data, user management

## � Project Structure

```
psa-codesprint-tribyte/
├── backend/                         # Flask REST API
│   ├── app.py                      # Main Flask application
│   ├── ai_engine.py                # AI matching & narrative generation
│   ├── models.py                   # SQLAlchemy database models
│   ├── database.py                 # Database configuration
│   ├── auth.py                     # Authentication & user management
│   ├── career_roadmap.py           # Career path prediction logic
│   ├── leadership_potential.py     # Leadership scoring engine
│   ├── leadership_augmentations.py # Azure OpenAI sentiment analysis
│   ├── load_data.py                # Data loading script
│   ├── test_career_roadmap.py      # Career roadmap tests
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example               # Environment variables template
│   └── compass.db                 # SQLite database (generated)
├── frontend/                       # Next.js React application
│   ├── pages/                     # Next.js pages
│   │   ├── index.js              # Main dashboard (admin)
│   │   ├── login.js              # Login page
│   │   ├── employee-home.js      # Employee dashboard
│   │   ├── career-matching.js    # AI role matching
│   │   ├── career-roadmap.js     # Career roadmap
│   │   ├── leadership.js         # Leadership potential
│   │   ├── copilot.js            # Compass Copilot chat
│   │   ├── settings.js           # User settings
│   │   ├── _app.js               # App wrapper
│   │   └── _document.js          # Document structure
│   ├── components/                # React components
│   │   ├── EmployeeSearch.js     # Search interface
│   │   ├── EmployeeProfile.js    # Profile display
│   │   ├── RoleMatches.js        # Match results
│   │   ├── CareerNarrative.js    # AI narrative
│   │   ├── CareerRoadmap.js      # Roadmap visualizations
│   │   ├── ChatCopilot.js        # Chat interface
│   │   ├── ComponentBreakdown.js # Leadership breakdown
│   │   ├── EmployeeCareerTimeline.js # Career timeline
│   │   ├── ScoreCard.js          # Score card display
│   │   ├── EvidenceModal.js      # Evidence detail modal
│   │   ├── FeedbackModal.js      # User feedback modal
│   │   └── ProtectedRoute.js     # Auth wrapper
│   ├── services/                  # API services
│   │   └── api.js                # Axios API client
│   ├── utils/                     # Utility functions
│   │   └── auth.js               # Auth helpers
│   ├── styles/                    # Global styles
│   │   └── globals.css
│   ├── public/                    # Static assets
│   ├── package.json              # Node dependencies
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   └── README.md                 # Frontend documentation
├── docs/                          # Feature documentation
│   ├── COMPASS_COPILOT.md        # Copilot guide
│   ├── CAREER_ROADMAP.md         # Roadmap guide
│   └── LEADERSHIP_POTENTIAL.md   # Leadership guide
├── Employee_Profiles.json         # Sample employee data
├── USER_CREDENTIALS.md            # Demo user accounts
├── ENHANCED_CONVERSATIONAL_SUPPORT.md # Copilot enhancements
├── README.md                      # This file
└── LICENSE                        # MIT License
```

## 🎨 Design Philosophy

- **AI-First Approach**: Leverages Azure OpenAI for intelligent matching and narratives
- **User-Centric Design**: Intuitive interface optimized for HR professionals and employees
- **Performance Optimized**: Fast embeddings with local fallback, efficient caching
- **Scalable Architecture**: Modular design ready for enterprise integration
- **Modern Stack**: Latest technologies with best practices

## 🔮 Future Enhancements

Based on PSA Code Sprint objectives, potential expansions include:

1. **Enhanced AI Capabilities**
   - Multi-language narrative generation
   - Sentiment analysis for career aspirations
   - Predictive career path modeling
   - Automated interview question generation

2. **Advanced Analytics**
   - Skills gap heatmaps across departments
   - Talent pipeline visualization
   - Succession planning tools
   - Career trajectory forecasting

3. **Integration & Automation**
   - HR system integration (SAP, Workday)
   - Real-time profile updates
   - Automated role posting notifications
   - Slack/Teams chatbot integration

4. **Collaboration Features**
   - Manager approval workflows
   - Mentorship matching
   - Peer review integration
   - Learning & development tracking

5. **Enterprise Features**
   - Role-based access control
   - Audit logging and compliance
   - Multi-tenant architecture
   - Advanced search with filters

## 📊 Sample Data

The application includes realistic data for:

- 5 employee profiles with comprehensive backgrounds
- 5 roles across different departments and seniority levels
- Skills database spanning technical and soft skills
- Competency frameworks with proficiency levels

## 🤝 Contributing

This project is built for PSA Code Sprint 2025. Feel free to fork and customize for your team's needs!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 PSA Code Sprint 2025

## � Contact

For questions or support, reach out to Team Tribyte:

- GitHub: [@henrychooi](https://github.com/henrychooi)
- GitHub: [@natsirt04](https://github.com/natsirt04)
- GitHub: [@cadzchua](https://github.com/cadzchua)

## 🙏 Acknowledgments

- PSA International for organizing the Code Sprint
- Azure OpenAI for AI capabilities
- Open-source community for amazing tools and libraries

---

**Built with 💙 by Team Tribyte for PSA Code Sprint Singapore 2025**
