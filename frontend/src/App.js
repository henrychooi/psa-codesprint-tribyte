import React, { useState, useEffect } from 'react';
import { Search, User, Briefcase, TrendingUp, Loader2 } from 'lucide-react';
import { careerCompassAPI } from './services/api';
import EmployeeSearch from './components/EmployeeSearch';
import EmployeeProfile from './components/EmployeeProfile';
import RoleMatches from './components/RoleMatches';
import CareerNarrative from './components/CareerNarrative';
import './index.css';

function App() {
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
      setError('Cannot connect to API. Please ensure the backend is running on http://localhost:5000');
    }
  };

  const handleEmployeeSelect = async (employee) => {
    setSelectedEmployee(employee);
    setMatches(null);
    setError(null);
    setLoading(true);

    try {
      const result = await careerCompassAPI.matchEmployee(employee.employee_id, 5, true);
      setMatches(result);
    } catch (err) {
      setError(err.message || 'Failed to load role matches');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-psa-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Career Compass</h1>
                <p className="text-blue-200 text-sm">AI-Powered Career Development Platform</p>
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
                <User className="w-16 h-16 mx-auto text-psa-blue mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Discover Your Career Path
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Search for an employee to explore AI-powered role recommendations,
                  skill gap analysis, and personalized career development narratives.
                </p>
              </div>
              
              <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} />
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-psa-blue" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Matching</h3>
                <p className="text-gray-600 text-sm">
                  Advanced embeddings and similarity algorithms match employees to ideal roles.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Skill Gap Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Identify missing skills and get actionable development recommendations.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Career Narratives</h3>
                <p className="text-gray-600 text-sm">
                  GPT-generated personalized stories explaining your career trajectory.
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
              <Search className="w-4 h-4" />
              <span>Search Another Employee</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Profile (Left Column) */}
              <div className="lg:col-span-1">
                <EmployeeProfile employee={selectedEmployee} />
              </div>

              {/* Matches & Narrative (Right Columns) */}
              <div className="lg:col-span-2 space-y-6">
                {loading ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <Loader2 className="w-12 h-12 mx-auto text-psa-blue animate-spin mb-4" />
                    <p className="text-gray-600">Analyzing career opportunities...</p>
                  </div>
                ) : matches ? (
                  <>
                    {/* Top Match Narrative */}
                    {matches.matches && matches.matches[0]?.career_narrative && (
                      <CareerNarrative
                        narrative={matches.matches[0].career_narrative}
                        role={matches.matches[0].role}
                        matchScore={matches.matches[0].match_score}
                        developmentPlan={matches.matches[0].development_plan}
                      />
                    )}

                    {/* All Matches */}
                    <RoleMatches matches={matches.matches} />
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
            Career Compass © 2025 PSA International 
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
