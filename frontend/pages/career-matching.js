import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Search,
  User,
  Briefcase,
  TrendingUp,
  Loader2,
  ArrowLeft,
  Activity,
  AlertCircle,
} from "lucide-react";
import { careerCompassAPI } from "../services/api";
import EmployeeSearch from "../components/EmployeeSearch";
import EmployeeProfile from "../components/EmployeeProfile";
import RoleMatches from "../components/RoleMatches";
import CareerNarrative from "../components/CareerNarrative";

function CareerMatching() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiHealth, setApiHealth] = useState(false);

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async () => {
    try {
      await careerCompassAPI.healthCheck();
      setApiHealth(true);
    } catch (err) {
      setApiHealth(false);
      setError(
        "Cannot connect to API. Please ensure the backend is running on http://localhost:5000"
      );
    }
  };

  const handleEmployeeSelect = async (employee) => {
    setSelectedEmployee(employee);
    setMatches(null);
    setError(null);
    setLoading(true);

    try {
      const result = await careerCompassAPI.matchEmployee(
        employee.employee_id,
        5,
        true
      );
      setMatches(result);
    } catch (err) {
      setError(err.message || "Failed to load role matches");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedEmployee(null);
    setMatches(null);
    setError(null);
  };

  return (
    <>
      <Head>
        <title>Career Matching - Career Compass</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative min-h-screen overflow-x-hidden px-4 pb-16 sm:px-6 lg:px-10">
        <div
          className="floating-orb absolute -top-24 -left-16 w-72 h-72"
          style={{ background: "rgba(59, 130, 246, 0.36)" }}
        />
        <div
          className="floating-orb absolute bottom-[-160px] right-[-110px] w-96 h-96"
          style={{ background: "rgba(56, 189, 248, 0.3)" }}
        />
        <div
          className="floating-orb absolute top-1/2 right-20 w-64 h-64"
          style={{ background: "rgba(236, 72, 153, 0.25)" }}
        />

        <div className="relative max-w-6xl mx-auto space-y-10 pt-10 sm:pt-14">
          <header className="glass-card px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => router.push("/")}
                  className="group rounded-2xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2 flex-shrink-0"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-semibold">Back</span>
                </button>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.32em] text-indigo-500 font-semibold">
                      Role intelligence
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 truncate">
                      AI-Powered Role Matching
                    </h1>
                    <p className="text-sm text-slate-500 max-w-xl">
                      Surface tailored opportunities, narrative-ready summaries,
                      and skill roadmaps in one guided flow.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-chip px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700 flex-shrink-0 w-fit whitespace-nowrap">
                <Activity
                  className={`w-4 h-4 flex-shrink-0 ${
                    apiHealth ? "text-emerald-500" : "text-rose-500"
                  }`}
                />
                <span>{apiHealth ? "API Connected" : "API Offline"}</span>
              </div>
            </div>
          </header>

          <main className="space-y-8">
            {error && (
              <div className="glass-panel border border-rose-200/70 bg-rose-50/80 text-rose-700 px-5 py-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Connection issue</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {!selectedEmployee ? (
              <div className="space-y-8 fade-in">
                <section className="glass-panel px-6 py-8 sm:px-8 border border-white/55">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                      <User className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3">
                      Discover the next role with confidence
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
                      Search for an employee to activate their personalized
                      opportunity shortlist, detailed career story, and
                      development steps.
                    </p>
                  </div>
                  <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel border border-white/55 p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/85 to-indigo-500/85 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      AI-Powered Matching
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Similarity models tuned to PSA’s taxonomy align
                      experience, skills, and aspirations to future roles.
                    </p>
                  </div>
                  <div className="glass-panel border border-white/55 p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/85 to-teal-500/85 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Skill Gap Analysis
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Instantly see matched capabilities, growth areas, and
                      tailored learning actions per opportunity.
                    </p>
                  </div>
                  <div className="glass-panel border border-white/55 p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/85 to-pink-500/85 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Career Narratives
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Share-ready storylines explain why each role fits and how
                      to bridge the gap in practical steps.
                    </p>
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-6 fade-in">
                <button
                  onClick={handleReset}
                  className="glass-panel border border-white/55 px-4 py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2 w-fit"
                >
                  <Search className="w-4 h-4" />
                  Search another employee
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <EmployeeProfile employee={selectedEmployee} />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                      <div className="glass-panel border border-white/55 px-8 py-16 text-center">
                        <Loader2 className="w-12 h-12 mx-auto text-indigo-500 animate-spin mb-4" />
                        <p className="text-slate-500">
                          Analyzing career opportunities…
                        </p>
                      </div>
                    ) : matches ? (
                      <>
                        {matches.matches &&
                          matches.matches[0]?.career_narrative && (
                            <CareerNarrative
                              narrative={matches.matches[0].career_narrative}
                              role={matches.matches[0].role}
                              matchScore={matches.matches[0].match_score}
                              developmentPlan={
                                matches.matches[0].development_plan
                              }
                            />
                          )}
                        <RoleMatches matches={matches.matches} />
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="text-center text-sm text-slate-500 pt-4">
            Career Compass © 2025 PSA International
          </footer>
        </div>
      </div>
    </>
  );
}

export default CareerMatching;
