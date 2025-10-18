import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { TrendingUp, Briefcase, Award, ArrowRight, Activity, LogOut, Shield, Settings, Sparkles } from 'lucide-react';
import { careerCompassAPI } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import { getUser, logout } from '../utils/auth';

function Home() {
  const router = useRouter();
  const [apiHealth, setApiHealth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check API health and get user on mount
  useEffect(() => {
    checkAPIHealth();
    setCurrentUser(getUser());
  }, []);

  const checkAPIHealth = async () => {
    try {
      await careerCompassAPI.healthCheck();
      setApiHealth(true);
    } catch (err) {
      setApiHealth(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <ProtectedRoute requireRole="admin">
      <Head>
        <title>Career Compass - PSA International</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="AI-Powered Career Development Platform" />
      </Head>

      <div className="relative min-h-screen overflow-x-hidden px-4 pb-16 sm:px-6 lg:px-12">
        <div
          className="floating-orb absolute -top-24 -left-20 w-72 h-72"
          style={{ background: 'rgba(59, 130, 246, 0.45)' }}
        />
        <div
          className="floating-orb absolute bottom-[-180px] right-[-120px] w-96 h-96"
          style={{ background: 'rgba(244, 114, 182, 0.4)' }}
        />
        <div
          className="floating-orb absolute top-1/3 right-24 w-64 h-64"
          style={{ background: 'rgba(129, 140, 248, 0.32)' }}
        />

        <div className="relative max-w-7xl mx-auto space-y-12 pt-10 lg:pt-14">
          <header className="fade-in">
            <div className="glass-card px-6 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start sm:items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                      <TrendingUp className="w-9 h-9 sm:w-11 sm:h-11" />
                    </div>
                    <span className="absolute -right-2 -bottom-2 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-md">
                      Admin
                    </span>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.2em] text-xs font-semibold text-indigo-600 mb-2">
                      PSA Career Navigation
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
                      Career Compass
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 max-w-xl">
                      Orchestrate talent development, uncover leadership potential, and match employees to their next opportunity with AI you can explain.
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                    {currentUser && (
                      <div className="glass-chip px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Shield className="w-4 h-4 text-amber-500" />
                        {currentUser.name}
                      </div>
                    )}
                    <div className="glass-chip px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Activity className={`w-4 h-4 ${apiHealth ? 'text-emerald-500' : 'text-rose-500'}`} />
                      {apiHealth ? 'System Online' : 'System Offline'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                    <button
                      onClick={handleSettings}
                      className="glass-button px-4 py-2 flex items-center gap-2 text-sm font-semibold shadow-indigo-500/25"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="glass-button px-4 py-2 flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-rose-500/90 to-orange-500/90 hover:from-rose-500 hover:to-orange-500"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-divider my-8" />

              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => router.push('/career-matching')}
                  className="group glass-panel p-4 text-left transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-white/40"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/90 to-indigo-500/90 text-white shadow-lg shadow-blue-500/30">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-400 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
                    Guided Workflow
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    Launch Role Matching
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Surface top-fit opportunities and curated narratives in minutes.
                  </p>
                </button>

                <button
                  onClick={() => router.push('/leadership')}
                  className="glass-panel p-4 text-left transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-white/40"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/90 to-pink-500/90 text-white shadow-lg shadow-purple-500/30">
                      <Award className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
                    Assessment Suite
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    Review Leadership Signals
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Evidence-backed scoring across potential, readiness, and growth.
                  </p>
                </button>

                <button
                  onClick={() => router.push('/copilot')}
                  className="glass-panel p-4 text-left transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-white/40"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400/90 to-teal-500/90 text-white shadow-lg shadow-emerald-500/30">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
                    Compass Copilot
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    Open Employee View
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Experience the conversational assistant your employees rely on.
                  </p>
                </button>
              </div>
            </div>
          </header>

          <main className="space-y-12">
            <section className="glass-panel px-6 py-10 sm:px-10 sm:py-12 border border-white/50 fade-in">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-4">
                    Orchestrate every career conversation with clarity.
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Career Compass unifies talent intelligence and AI-guided support so you can prioritize the right opportunities, accelerate development, and tell the story behind every recommendation.
                  </p>
                </div>
                <div className="glass-card px-6 py-6 sm:px-8 bg-white/70 border border-white/50 shadow-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 mb-4">
                    Snapshot
                  </p>
                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Connected modules</span>
                      <span className="glass-chip px-3 py-1 text-xs font-medium text-indigo-700">
                        Role Matching • Leadership • Copilot
                      </span>
                    </div>
                    <div className="glass-divider" />
                    <p>
                      <span className="font-semibold text-slate-800">Need a quick start?</span> Use the quick actions above to launch the exact workflow you need. Each surface adapts to the employee context you select.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="fade-in">
              <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-6">
                What would you like to do today?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 border border-white/45 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/90 to-indigo-500/90 text-white shadow-lg shadow-blue-500/30">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">Match to Future Roles</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Spot-on recommendations with transparent skill matches and growth guidance.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-500">
                    <li>• Embedding powered fit scores</li>
                    <li>• Personalized narratives</li>
                    <li>• Confidence bands & watchouts</li>
                  </ul>
                </div>

                <div className="glass-panel p-6 border border-white/45 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/90 to-pink-500/90 text-white shadow-lg shadow-purple-500/30">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">Evaluate Leadership Readiness</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Break down potential across behaviors, outcomes, and learning agility.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-500">
                    <li>• Explainable scoring model</li>
                    <li>• Strengths and watchouts</li>
                    <li>• Actionable coaching prompts</li>
                  </ul>
                </div>

                <div className="glass-panel p-6 border border-white/45 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400/90 to-teal-500/90 text-white shadow-lg shadow-emerald-500/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">Guide Employees Live</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Bring Copilot into conversations to coach talent in real-time.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-500">
                    <li>• Suggested prompts tailored to each profile</li>
                    <li>• Traceable evidence citations</li>
                    <li>• Secure, role-aware responses</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="glass-panel px-6 py-10 sm:px-10 sm:py-12 border border-white/45 fade-in">
              <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center mb-10">
                Why Career Compass works for PSA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card px-6 py-8 bg-white/70 border border-white/50 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/90 to-indigo-600/90 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-5">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">
                    AI-Powered Insight
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Leverage embeddings and LLM orchestration that tune to PSA’s internal skills taxonomy and growth strategy.
                  </p>
                </div>
                <div className="glass-card px-6 py-8 bg-white/70 border border-white/50 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/90 to-pink-500/90 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-5">
                    <Award className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">
                    Transparent & Trusted
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Every score links back to evidences, making it easy to brief leaders and employees with confidence.
                  </p>
                </div>
                <div className="glass-card px-6 py-8 bg-white/70 border border-white/50 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400/90 to-teal-500/90 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-5">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">
                    Built for Action
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Turn insights into plans with ready-to-share narratives, skill sprints, and next-step coaching prompts.
                  </p>
                </div>
              </div>
            </section>
          </main>

          <footer className="text-center text-sm text-slate-500 pt-6 fade-in">
            <p>
              <strong className="font-semibold text-slate-700">Career Compass</strong> · Empowering Career Development at PSA International
            </p>
            <p>© 2025 PSA International. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default Home;
