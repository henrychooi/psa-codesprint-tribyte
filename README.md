# PSA Code Sprint 2025 - Career Compass

![Flask](https://img.shields.io/badge/Flask-3.0-black)
![React](https://img.shields.io/badge/React-18-61dafb)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

An AI-powered career development platform that matches employees to ideal roles using advanced machine learning and generates personalized career narratives. Built for **PSA Code Sprint Singapore 2025**.

## 🎯 Team Tribyte

Built with ❤️ for PSA Code Sprint 2025 hackathon.

## ✨ Features

### 🔍 Employee Search & Selection

- **Smart Search Interface**: Real-time filtering by name, email, job title, or department
- **Employee Profiles**: Comprehensive view of skills, competencies, and experience
- **Visual Skill Badges**: Quick overview of employee capabilities
- **Profile Details**:
  - Personal information and contact details
  - Current role and department
  - Skills and competencies with proficiency levels
  - Experience history and completed projects
  - Education background

### 🤖 AI-Powered Role Matching

- **Intelligent Matching Algorithm**: Combines semantic similarity and skill analysis
- **Top 5 Recommendations**: Best-fit roles ranked by match score
- **Dual-Weight Scoring System**:
  - 60% Semantic similarity using embeddings
  - 40% Skill gap analysis
- **Match Visualization**:
  - Color-coded scores (Excellent/Strong/Good/Potential matches)
  - Skill match breakdown (required vs. preferred)
  - Missing skills identification

### 📖 Career Narrative Generation

- **AI-Generated Stories**: Personalized career narratives using Azure OpenAI
- **Development Roadmap**: Prioritized action plans for skill development
- **Actionable Insights**: Specific steps with estimated timelines
- **Narrative Features**:
  - Context-aware content based on employee profile and target role
  - Skill gap bridging strategies
  - Career progression guidance
  - Next steps and recommendations

### 🎨 Modern User Interface

- **Responsive Design**: Seamless experience across all devices
- **PSA Branding**: Custom color scheme with PSA blue theme
- **Interactive Components**: Expandable role details and smooth transitions
- **Visual Feedback**: Loading states, success indicators, and error handling

## 🚀 Tech Stack

### Backend
- **Framework**: [Flask 3.0](https://flask.palletsprojects.com/)
- **Database**: SQLite with [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **AI/ML**: 
  - [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) (via APIM)
  - Local fallback: [Sentence Transformers](https://www.sbert.net/)
  - [scikit-learn](https://scikit-learn.org/) for cosine similarity
- **API**: RESTful endpoints with Flask-CORS

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with React 18
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 18+ and npm
- Azure OpenAI API access (or local embeddings fallback)

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
AZURE_OPENAI_API_KEY=your-apim-subscription-key
AZURE_OPENAI_ENDPOINT=https://psacodesprint2025.azure-api.net/
AZURE_EMBED_DEPLOYMENT=text-embedding-3-small
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
✅ Loaded 5 employees
✅ Loaded 5 roles
✅ Database initialized successfully
```

### 5. Start Backend Server

```powershell
python app.py
```

Backend API will start on `http://localhost:5000`

### 6. Frontend Setup (New Terminal)

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will open at `http://localhost:3000`

## � Project Structure

```
psa-codesprint-tribyte/
├── backend/                         # Flask REST API
│   ├── app.py                      # Main Flask application
│   ├── ai_engine.py                # AI matching & narrative generation
│   ├── models.py                   # SQLAlchemy database models
│   ├── database.py                 # Database configuration
│   ├── load_data.py                # Data loading script
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example               # Environment variables template
│   └── compass.db                 # SQLite database (generated)
├── frontend/                       # Next.js React application
│   ├── pages/                     # Next.js pages
│   │   ├── index.js              # Main dashboard page
│   │   ├── _app.js               # App wrapper
│   │   └── _document.js          # Document structure
│   ├── components/                # React components
│   │   ├── EmployeeSearch.js     # Search interface
│   │   ├── EmployeeProfile.js    # Profile display
│   │   ├── RoleMatches.js        # Match results
│   │   └── CareerNarrative.js    # AI narrative
│   ├── services/                  # API services
│   │   └── api.js                # Axios API client
│   ├── styles/                    # Global styles
│   │   └── globals.css
│   ├── package.json              # Node dependencies
│   ├── next.config.js            # Next.js configuration
│   └── tailwind.config.js        # Tailwind CSS configuration
├── Employee_Profiles.json         # Sample employee data
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

## 🙏 Acknowledgments

- PSA International for organizing the Code Sprint
- Azure OpenAI for AI capabilities
- Open-source community for amazing tools and libraries

---

**Built with 💙 by Team Tribyte for PSA Code Sprint Singapore 2025**
