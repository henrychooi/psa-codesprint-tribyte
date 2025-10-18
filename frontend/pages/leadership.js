import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Award, Loader2, ArrowLeft, Lightbulb, Activity, AlertCircle } from 'lucide-react';
import { careerCompassAPI } from '../services/api';
import EmployeeSearch from '../components/EmployeeSearch';
import EmployeeProfile from '../components/EmployeeProfile';
import ScoreCard from '../components/ScoreCard';
import ComponentBreakdown from '../components/ComponentBreakdown';
import EvidenceModal from '../components/EvidenceModal';
import FeedbackModal from '../components/FeedbackModal';

function LeadershipPotential() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leadershipData, setLeadershipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiHealth, setApiHealth] = useState(false);
  
  // Modal states
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

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
      setError('Cannot connect to API. Please ensure the backend is running on http://localhost:5000');
    }
  };

  const handleEmployeeSelect = async (employee) => {
    setSelectedEmployee(employee);
    setLeadershipData(null);
    setError(null);
    setLoading(true);

    try {
      const result = await careerCompassAPI.getLeadershipPotential(employee.employee_id);
      setLeadershipData(result);
    } catch (err) {
      setError(err.message || 'Failed to load leadership potential data');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedEmployee(null);
    setLeadershipData(null);
    setError(null);
  };

  const handleComponentClick = (componentKey) => {
    setSelectedComponent(componentKey);
    setEvidenceModalOpen(true);
  };

  const handleFeedbackSubmit = async (employeeId, feedbackType, comments) => {
    try {
      await careerCompassAPI.submitLeadershipFeedback(employeeId, feedbackType, comments);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Leadership Potential - Career Compass</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative min-h-screen overflow-x-hidden px-4 pb-16 sm:px-6 lg:px-10">
        <div
          className="floating-orb absolute -top-24 -left-20 w-72 h-72"
          style={{ background: 'rgba(168, 85, 247, 0.35)' }}
        />
        <div
          className="floating-orb absolute bottom-[-160px] right-[-110px] w-96 h-96"
          style={{ background: 'rgba(56, 189, 248, 0.28)' }}
        />
        <div
          className="floating-orb absolute top-1/2 right-20 w-64 h-64"
          style={{ background: 'rgba(248, 113, 113, 0.22)' }}
        />

        <div className="relative max-w-6xl mx-auto space-y-10 pt-10 sm:pt-14">
          <header className="glass-card px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start sm:items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="group rounded-2xl border border-white/50 bg-white/60 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-semibold">Back</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-purple-500 font-semibold">
                      Leadership intelligence
                    </p>
                    <h1 className="text-3xl font-semibold text-slate-900">Leadership Potential</h1>
                    <p className="text-sm text-slate-500 max-w-xl">
                      Explainable AI scoring with evidence trails, component deep-dives, and feedback loops for every leader.
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-chip px-4 py-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Activity className={`w-4 h-4 ${apiHealth ? 'text-emerald-500' : 'text-rose-500'}`} />
                {apiHealth ? 'API Connected' : 'API Offline'}
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
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                      <Award className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3">
                      Assess leadership potential with evidence
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
                      Select an employee to unpack their leadership readiness, drill into component scores, and collect feedback instantly.
                    </p>
                  </div>
                  <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { title: 'Outcome Impact', description: 'Quantified business results and achievements', colors: 'from-blue-500/85 to-indigo-500/85' },
                    { title: 'Stakeholder Complexity', description: 'Influence across diverse groups & forums', colors: 'from-purple-500/85 to-pink-500/85' },
                    { title: 'Change Management', description: 'Transformation leadership and adoption', colors: 'from-emerald-400/85 to-teal-500/85' },
                    { title: 'Progression Velocity', description: 'Career trajectory vs tenure peers', colors: 'from-rose-500/85 to-orange-500/85' },
                  ].map((card) => (
                    <div key={card.title} className="glass-panel border border-white/55 p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.colors} text-white flex items-center justify-center shadow-lg shadow-slate-900/20 mb-4`}>
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
                    </div>
                  ))}
                </section>
              </div>
            ) : (
              <div className="space-y-6 fade-in">
                <button
                  onClick={handleReset}
                  className="glass-panel border border-white/55 px-4 py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2 w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Assess another employee
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <EmployeeProfile employee={selectedEmployee} />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                      <div className="glass-panel border border-white/55 px-8 py-16 text-center">
                        <Loader2 className="w-12 h-12 mx-auto text-purple-500 animate-spin mb-4" />
                        <p className="text-slate-500">Calculating leadership potential…</p>
                      </div>
                    ) : leadershipData ? (
                      <>
                        <ScoreCard
                          score={leadershipData.overall_score}
                          rank={`Top ${100 - leadershipData.percentile_rank}%`}
                          trend={null}
                        />

                        <ComponentBreakdown
                          components={leadershipData.components}
                          evidence={leadershipData.evidence}
                          onComponentClick={handleComponentClick}
                        />

                        {leadershipData.improvement_suggestions && leadershipData.improvement_suggestions.length > 0 && (
                          <div className="glass-panel border border-white/55 px-6 py-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <Lightbulb className="w-6 h-6" />
                              </div>
                              <h3 className="text-xl font-semibold text-slate-900">
                                Development opportunities
                              </h3>
                            </div>
                            <ul className="space-y-3">
                              {leadershipData.improvement_suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-3 text-slate-600">
                                  <span className="text-amber-500 font-semibold">•</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="glass-panel border border-white/55 px-6 py-6 text-center">
                          <button
                            onClick={() => setFeedbackModalOpen(true)}
                            className="glass-button px-6 py-3 text-sm font-semibold"
                          >
                            Disagree with this score?
                          </button>
                          <p className="text-sm text-slate-500 mt-2">
                            Share feedback to improve the assessment model.
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="text-center text-sm text-slate-500 pt-4">
            Leadership Potential Assessment © 2025 PSA International
          </footer>
        </div>

        {selectedComponent && leadershipData && (
          <EvidenceModal
            isOpen={evidenceModalOpen}
            onClose={() => setEvidenceModalOpen(false)}
            componentKey={selectedComponent}
            componentData={leadershipData.components[selectedComponent]}
            evidence={leadershipData.evidence[selectedComponent]}
          />
        )}

        {selectedEmployee && (
          <FeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
            onSubmit={handleFeedbackSubmit}
            employeeId={selectedEmployee.employee_id}
          />
        )}
      </div>
    </>
  );
}

export default LeadershipPotential;
