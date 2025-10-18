import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Award, Loader2, ArrowLeft, Lightbulb } from 'lucide-react';
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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-psa-blue to-purple-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <Award className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Leadership Potential</h1>
                  <p className="text-purple-200 text-sm">Explainable AI-Powered Assessment</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiHealth ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">{apiHealth ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!selectedEmployee ? (
            /* Employee Search View */
            <div className="fade-in">
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="text-center mb-8">
                  <Award className="w-16 h-16 mx-auto text-psa-blue mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Assess Leadership Potential
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Search for an employee to view their leadership potential score with full transparency, 
                    component breakdowns, and evidence-based insights.
                  </p>
                </div>
                
                <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} />
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Outcome Impact</h3>
                  <p className="text-gray-600 text-sm">
                    Quantified business results and measurable achievements
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Stakeholder Complexity</h3>
                  <p className="text-gray-600 text-sm">
                    Ability to influence diverse groups and navigate complexity
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Change Management</h3>
                  <p className="text-gray-600 text-sm">
                    Demonstrated leadership in transformation initiatives
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Progression Velocity</h3>
                  <p className="text-gray-600 text-sm">
                    Career advancement rate and growth trajectory
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="fade-in">
              <button
                onClick={handleReset}
                className="mb-6 px-4 py-2 text-psa-blue hover:bg-blue-50 rounded-lg transition flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Assess Another Employee</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employee Profile (Left Column) */}
                <div className="lg:col-span-1">
                  <EmployeeProfile employee={selectedEmployee} />
                </div>

                {/* Leadership Assessment (Right Columns) */}
                <div className="lg:col-span-2 space-y-6">
                  {loading ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                      <Loader2 className="w-12 h-12 mx-auto text-psa-blue animate-spin mb-4" />
                      <p className="text-gray-600">Calculating leadership potential...</p>
                    </div>
                  ) : leadershipData ? (
                    <>
                      {/* Score Card */}
                      <ScoreCard
                        score={leadershipData.overall_score}
                        rank={`Top ${100 - leadershipData.percentile_rank}%`}
                        trend={null}
                      />

                      {/* Component Breakdown */}
                      <ComponentBreakdown
                        components={leadershipData.components}
                        evidence={leadershipData.evidence}
                        onComponentClick={handleComponentClick}
                      />

                      {/* Improvement Suggestions */}
                      {leadershipData.improvement_suggestions && 
                       leadershipData.improvement_suggestions.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Lightbulb className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                              Development Opportunities
                            </h3>
                          </div>
                          <ul className="space-y-3">
                            {leadershipData.improvement_suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-3">
                                <span className="text-yellow-600 font-bold">•</span>
                                <span className="text-gray-700">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Feedback Button */}
                      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <button
                          onClick={() => setFeedbackModalOpen(true)}
                          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                        >
                          Disagree with this score?
                        </button>
                        <p className="text-sm text-gray-600 mt-2">
                          Your feedback helps us improve the assessment
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              Leadership Potential Assessment © 2025 PSA International
            </p>
          </div>
        </footer>

        {/* Modals */}
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
