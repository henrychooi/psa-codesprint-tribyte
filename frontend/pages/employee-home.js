import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  TrendingUp,
  ArrowRight,
  Activity,
  LogOut,
  Settings,
  Sparkles,
  MapPin,
  User,
  Briefcase,
} from "lucide-react";
import { careerCompassAPI } from "../services/api";
import ProtectedRoute from "../components/ProtectedRoute";
import { getUser, logout } from "../utils/auth";
import EmployeeCareerTimeline from "../components/EmployeeCareerTimeline";

/**
 * Employee Home Page
 * Dashboard for employees with access to career features
 */
function EmployeeHome() {
  const router = useRouter();
  const [apiHealth, setApiHealth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCareerTimeline, setShowCareerTimeline] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    router.push("/settings");
  };

  const handleCareerTimeline = async () => {
    setShowCareerTimeline(true);
    
    if (!timelineData) {
      setLoading(true);
      try {
        const response = await careerCompassAPI.getEmployeeCareerTimeline();
        if (response.success) {
          setTimelineData(response);
        }
      } catch (error) {
        console.error("Failed to load career timeline:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToDashboard = () => {
    setShowCareerTimeline(false);
  };

  return (
    <ProtectedRoute requireRole="employee">
      <Head>
        <title>Career Compass - Employee Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="AI-Powered Career Development Platform"
        />
      </Head>

      <div className="relative min-h-screen overflow-x-hidden px-4 pb-16 sm:px-6 lg:px-12">
        <div
          className="floating-orb absolute -top-24 -left-20 w-72 h-72"
          style={{ background: "rgba(99, 102, 241, 0.38)" }}
        />
        <div
          className="floating-orb absolute bottom-[-180px] right-[-120px] w-96 h-96"
          style={{ background: "rgba(45, 212, 191, 0.28)" }}
        />
        <div
          className="floating-orb absolute top-1/3 right-24 w-64 h-64"
          style={{ background: "rgba(236, 72, 153, 0.25)" }}
        />

        <div className="relative max-w-7xl mx-auto space-y-12 pt-10 lg:pt-14">
          <header className="fade-in">
            <div className="glass-card px-6 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start sm:items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                      <TrendingUp className="w-9 h-9 sm:w-11 sm:h-11" />
                    </div>
                    <span className="absolute -right-2 -bottom-2 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-md">
                      Employee
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
                      Your personalized career development workspace with
                      AI-powered guidance and insights.
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                    {currentUser && (
                      <div className="glass-chip px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-slate-700 whitespace-nowrap">
                        <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{currentUser.name}</span>
                      </div>
                    )}
                    <div className="glass-chip px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-slate-700 whitespace-nowrap">
                      <Activity
                        className={`w-4 h-4 flex-shrink-0 ${
                          apiHealth ? "text-emerald-500" : "text-rose-500"
                        }`}
                      />
                      <span>
                        {apiHealth ? "System Online" : "System Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                    <button
                      onClick={handleSettings}
                      className="glass-button px-5 py-2.5 flex items-center gap-2 text-sm font-semibold shadow-indigo-500/25 whitespace-nowrap"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4 flex-shrink-0" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="glass-button px-5 py-2.5 flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-rose-500/90 to-orange-500/90 hover:from-rose-500 hover:to-orange-500 whitespace-nowrap"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>

              {!showCareerTimeline && (
                <>
                  <div className="glass-divider my-8" />

                  <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    <button
                      onClick={() => router.push("/copilot")}
                      className="group glass-panel p-5 text-left transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-white/40 min-h-[200px] flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400/90 to-teal-500/90 text-white shadow-lg shadow-emerald-500/30">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-emerald-300 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2">
                          Compass Copilot
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Open Career Assistant
                        </h3>
                        <p className="text-sm text-slate-600 mt-auto">
                          Chat with your AI-powered career guidance assistant
                          for personalized advice.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={handleCareerTimeline}
                      className="group glass-panel p-5 text-left transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-white/40 min-h-[200px] flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/90 to-blue-500/90 text-white shadow-lg shadow-cyan-500/30">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-cyan-300 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2">
                          Career Development
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          My Career Timeline
                        </h3>
                        <p className="text-sm text-slate-600 mt-auto">
                          View your complete career progression journey at PSA
                          International.
                        </p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {showCareerTimeline ? (
            <main className="space-y-8 fade-in">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToDashboard}
                  className="glass-button px-5 py-2.5 flex items-center gap-2 text-sm font-semibold"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              {loading ? (
                <div className="glass-panel p-12 text-center border border-white/40">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                    <p className="text-slate-600">Loading your career timeline...</p>
                  </div>
                </div>
              ) : timelineData ? (
                <EmployeeCareerTimeline
                  employeeData={timelineData.employee}
                  timeline={timelineData.timeline}
                />
              ) : (
                <div className="glass-panel p-8 text-center border border-white/40">
                  <p className="text-slate-600">Failed to load career timeline</p>
                </div>
              )}
            </main>
          ) : (
            <main className="space-y-12">
              <section className="glass-panel px-6 py-10 sm:px-10 sm:py-12 border border-white/50 fade-in">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                  <div>
                    <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-4">
                      Take charge of your career journey.
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Career Compass empowers you with AI-driven insights to
                      explore opportunities, understand your strengths, and plan
                      your next career move with confidence.
                    </p>
                  </div>
                  <div className="glass-card px-6 py-6 sm:px-8 bg-white/70 border border-white/50 shadow-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 mb-4">
                      Your Tools
                    </p>
                    <div className="space-y-4 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          Available Features
                        </span>
                        <span className="glass-chip px-3 py-1 text-xs font-medium text-indigo-700">
                          Copilot • Timeline
                        </span>
                      </div>
                      <div className="glass-divider" />
                      <p>
                        <span className="font-semibold text-slate-800">
                          Need guidance?
                        </span>{" "}
                        Start with the Compass Copilot to get personalized
                        career advice, or explore your career timeline to see
                        your growth at PSA.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="fade-in">
                <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-6">
                  What would you like to explore today?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-6 border border-white/45 hover:-translate-y-2 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400/90 to-teal-500/90 text-white shadow-lg shadow-emerald-500/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        Career Guidance Assistant
                      </h4>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Get personalized recommendations and career advice
                      tailored to your profile.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-500">
                      <li>• Ask about your career options</li>
                      <li>• Get skill development suggestions</li>
                      <li>• Explore future opportunities</li>
                    </ul>
                  </div>

                  <div className="glass-panel p-6 border border-white/45 hover:-translate-y-2 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/90 to-blue-500/90 text-white shadow-lg shadow-cyan-500/30">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        Career Timeline
                      </h4>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Visualize your complete career progression at PSA with a
                      beautiful timeline.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-500">
                      <li>• See all your past positions</li>
                      <li>• Track your growth and achievements</li>
                      <li>• Review key skills and focus areas</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="glass-panel px-6 py-10 sm:px-10 sm:py-12 border border-white/45 fade-in">
                <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center mb-10">
                  Why use Career Compass?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card px-6 py-8 bg-white/70 border border-white/50 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/90 to-purple-600/90 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-5">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">
                      AI-Powered Insights
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Get intelligent, personalized career recommendations based
                      on your unique profile and PSA's opportunities.
                    </p>
                  </div>
                  <div className="glass-card px-6 py-8 bg-white/70 border border-white/50 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/90 to-blue-500/90 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 mb-5">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">
                      Clear Career Visibility
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      See your entire career journey in one place and understand
                      how you've grown at PSA.
                    </p>
                  </div>
                  <div className="glass-card px-6 py-8 bg-white/70 border border-white/50 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400/90 to-teal-500/90 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-5">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">
                      Actionable Guidance
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Receive practical advice and clear next steps to achieve
                      your career goals at PSA.
                    </p>
                  </div>
                </div>
              </section>
            </main>
          )}

          <footer className="text-center text-sm text-slate-500 pt-6 fade-in">
            <p>
              <strong className="font-semibold text-slate-700">
                Career Compass
              </strong>{" "}
              · Empowering Career Development at PSA International
            </p>
            <p>© 2025 PSA International. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default EmployeeHome;
