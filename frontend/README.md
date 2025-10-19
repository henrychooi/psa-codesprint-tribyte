# Career Compass Frontend

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-61dafb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06b6d4)

The frontend application for Career Compass, built with [Next.js](https://nextjs.org/) and React. Provides an AI-powered career development platform with conversational guidance, predictive roadmaps, and leadership potential assessment.

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Build for Production

```bash
npm run build
npm start
```

Production build will be optimized and served on `http://localhost:3000`.

## 🎨 Technology Stack

- **Next.js 14** - React framework with SSR capabilities
- **React 18** - UI library
- **Tailwind CSS 3** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **Recharts 2** - Data visualization for leadership charts

## 📂 Project Structure

```
frontend/
├── pages/                     # Next.js pages (routes)
│   ├── index.js              # Main dashboard (admin only)
│   ├── login.js              # Login page
│   ├── employee-home.js      # Employee dashboard
│   ├── career-matching.js    # AI role matching
│   ├── career-roadmap.js     # Career path simulation
│   ├── leadership.js         # Leadership potential scoring
│   ├── copilot.js           # Compass Copilot chat
│   ├── settings.js          # User settings
│   ├── _app.js              # App wrapper
│   └── _document.js         # HTML document structure
├── components/               # Reusable React components
│   ├── ProtectedRoute.js    # Auth wrapper
│   ├── EmployeeSearch.js    # Employee search interface
│   ├── EmployeeProfile.js   # Profile display card
│   ├── RoleMatches.js       # Role matching results
│   ├── CareerNarrative.js   # AI-generated narratives
│   ├── CareerRoadmap.js     # Roadmap visualizations
│   ├── ChatCopilot.js       # Chat interface
│   ├── ComponentBreakdown.js # Leadership score breakdown
│   ├── EmployeeCareerTimeline.js # Career timeline
│   ├── ScoreCard.js         # Leadership score card
│   ├── EvidenceModal.js     # Evidence detail modal
│   └── FeedbackModal.js     # User feedback modal
├── services/                 # API client services
│   └── api.js               # Axios API wrapper
├── utils/                    # Utility functions
│   └── auth.js              # Authentication helpers
├── styles/                   # Global styles
│   └── globals.css          # Tailwind + custom CSS
├── public/                   # Static assets
├── .env.local               # Environment variables (create this)
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## 🔐 Authentication

The application uses token-based authentication with role-based access control:

- **Employee Role**: Access to Compass Copilot, own career data, leadership assessment
- **Admin Role**: Full access including all employee data and predictive roadmaps

See [USER_CREDENTIALS.md](../USER_CREDENTIALS.md) for demo login credentials.

## 🛠️ Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Create production build
- **`npm start`** - Start production server
- **`npm run lint`** - Run ESLint for code quality

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:5000/api` |

**Note**: All environment variables used in browser code must be prefixed with `NEXT_PUBLIC_`.

## 🎯 Key Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Glass Morphism UI**: Modern frosted glass aesthetic with floating orbs
- **PSA Branding**: Custom indigo/blue gradient color scheme
- **Protected Routes**: Frontend enforcement of role-based permissions
- **Interactive Visualizations**: Charts, timelines, and data displays
- **Real-time Updates**: Live API integration with loading states

## 📖 Related Documentation

- [Main README](../README.md) - Full project overview
- [MIGRATION.md](./MIGRATION.md) - Next.js migration details
- [Compass Copilot](../docs/COMPASS_COPILOT.md) - Conversational AI feature
- [Career Roadmap](../docs/CAREER_ROADMAP.md) - Predictive career paths
- [Leadership Potential](../docs/LEADERSHIP_POTENTIAL.md) - Scoring methodology

---

**Built with 💙 by Team Tribyte for PSA Code Sprint Singapore 2025**
