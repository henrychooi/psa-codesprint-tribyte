import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
} from "lucide-react";
import { careerCompassAPI } from "../services/api";

export default function CareerRoadmap({ employeeId, userRole = "employee" }) {
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [predictedRoadmap, setPredictedRoadmap] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminDataLoading, setAdminDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("current"); // current, predicted, comparison
  const [selectedScenario, setSelectedScenario] = useState("steady_growth");

  useEffect(() => {
    fetchRoadmapData();
  }, [employeeId, userRole]);

  // Load admin data lazily when admin switches to those tabs
  useEffect(() => {
    if (
      userRole === "admin" &&
      (activeTab === "predicted" || activeTab === "comparison") &&
      !predictedRoadmap
    ) {
      fetchAdminData();
    }
  }, [activeTab, userRole]);

  const fetchRoadmapData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch current roadmap for employee - FAST
      const currentRes = await fetch(
        `/api/career-roadmap/current/${employeeId}?limit=50`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (currentRes.ok) {
        const currentData = await currentRes.json();
        setCurrentRoadmap(currentData.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load career roadmap");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    if (adminDataLoading || predictedRoadmap) return; // Prevent duplicate fetches
    setAdminDataLoading(true);
    try {
      // Fetch predicted roadmap with only 2 quick scenarios
      const predictedRes = await fetch(
        `/api/career-roadmap/predicted/${employeeId}?scenarios=steady_growth,aggressive_growth&limit=40`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (predictedRes.ok) {
        const predictedData = await predictedRes.json();
        setPredictedRoadmap(predictedData.data);
      }

      // Fetch comparison for all 4 scenarios
      const comparisonRes = await fetch(
        `/api/career-roadmap/comparison/${employeeId}?limit=40`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (comparisonRes.ok) {
        const comparisonData = await comparisonRes.json();
        setComparison(comparisonData.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load admin roadmap data");
    } finally {
      setAdminDataLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <TrendingUp className="w-12 h-12 text-indigo-500" />
          </div>
          <p className="mt-4 text-slate-600">Loading career roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="glass-panel border border-rose-200/70 bg-rose-50/80 text-rose-700 px-6 py-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Tab Navigation - Only show admin tabs if user is admin */}
      <div className="flex gap-3 border-b border-white/20 overflow-x-auto">
        <button
          onClick={() => setActiveTab("current")}
          className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
            activeTab === "current"
              ? "border-b-2 border-indigo-500 text-indigo-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📍 Current Roadmap
        </button>

        {userRole === "admin" && (
          <>
            <button
              onClick={() => setActiveTab("predicted")}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "predicted"
                  ? "border-b-2 border-purple-500 text-purple-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🔮 Predicted Roadmap{" "}
              {adminDataLoading && activeTab === "predicted" && (
                <span className="ml-2 inline-block animate-spin">⏳</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "comparison"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⚖️ Scenario Comparison{" "}
              {adminDataLoading && activeTab === "comparison" && (
                <span className="ml-2 inline-block animate-spin">⏳</span>
              )}
            </button>
          </>
        )}
      </div>

      {/* CURRENT ROADMAP TAB */}
      {activeTab === "current" && currentRoadmap && (
        <CurrentRoadmapView roadmap={currentRoadmap} />
      )}

      {/* PREDICTED ROADMAP TAB - ADMIN ONLY */}
      {activeTab === "predicted" &&
        userRole === "admin" &&
        (predictedRoadmap ? (
          <PredictedRoadmapView
            roadmap={predictedRoadmap}
            selectedScenario={selectedScenario}
            onScenarioChange={setSelectedScenario}
          />
        ) : (
          <div className="glass-panel border border-white/40 p-8 text-center">
            <div className="inline-block animate-spin mb-4">
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-slate-600">
              Loading predicted roadmap scenarios...
            </p>
            <p className="text-sm text-slate-500 mt-2">
              This may take a moment as we analyze multiple career paths
            </p>
          </div>
        ))}

      {/* COMPARISON TAB - ADMIN ONLY */}
      {activeTab === "comparison" &&
        userRole === "admin" &&
        (comparison ? (
          <ComparisonView comparison={comparison} />
        ) : (
          <div className="glass-panel border border-white/40 p-8 text-center">
            <div className="inline-block animate-spin mb-4">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-slate-600">Loading scenario comparison...</p>
            <p className="text-sm text-slate-500 mt-2">
              Analyzing all career paths and their outcomes
            </p>
          </div>
        ))}
    </div>
  );
}

// ============================================================
// CURRENT ROADMAP VIEW - For Employees
// ============================================================

function CurrentRoadmapView({ roadmap }) {
  return (
    <div className="space-y-8">
      {/* Current Position */}
      <div className="glass-card border border-white/55 px-8 py-8">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-lg">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {roadmap.current_position.title}
            </h2>
            <p className="text-slate-600 mt-1">
              {roadmap.current_position.department}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              📅 In role for {roadmap.current_position.tenure_years} years
            </p>
          </div>
        </div>

        {/* Current Skills */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <h3 className="font-semibold text-slate-900 mb-3">
            ✨ Current Strengths
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            You have {roadmap.current_position.current_skills} key skills across
            your expertise areas
          </p>

          {/* Career Anchors */}
          <div className="flex flex-wrap gap-2">
            {roadmap.career_anchors.map((anchor, idx) => (
              <div
                key={idx}
                className="glass-chip px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200/50"
              >
                {anchor}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Logical Roles */}
      <div className="glass-card border border-white/55 px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-indigo-500" />
          <h3 className="text-2xl font-bold text-slate-900">
            Your Next Opportunities
          </h3>
        </div>

        <div className="space-y-4">
          {roadmap.next_logical_roles.map((role, idx) => (
            <div
              key={idx}
              className="glass-panel border border-white/50 px-6 py-5 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {role.title}
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    {role.department}
                  </p>

                  {/* Skills Readiness */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(role.skill_match * 100).toFixed(0)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {(role.skill_match * 100).toFixed(0)}% ready
                    </span>
                  </div>

                  {/* Skills to Develop */}
                  {role.skills_to_acquire.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        Skills to develop:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.skills_to_acquire.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {role.skills_to_acquire.length > 3 && (
                          <span className="text-xs text-slate-600 px-2 py-1">
                            +{role.skills_to_acquire.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Readiness Timeline */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1 justify-end">
                    <Clock className="w-4 h-4" />
                    {role.estimated_time_to_ready}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills to Develop */}
      <div className="glass-card border border-white/55 px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <h3 className="text-2xl font-bold text-slate-900">
            Skills Development Plan
          </h3>
        </div>

        <div className="space-y-3">
          {roadmap.skills_to_develop.slice(0, 5).map((skill, idx) => (
            <div
              key={idx}
              className="glass-panel border border-white/50 px-5 py-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">
                  {skill.skill}
                </h4>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      skill.priority === "high"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {skill.priority === "high"
                      ? "🔥 High Priority"
                      : "⚡ Medium Priority"}
                  </span>
                  <span className="text-xs text-slate-600">
                    ~{skill.estimated_months_to_learn} months to master
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Resources */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-sm font-medium text-slate-900 mb-3">
            📚 Recommended Learning Resources
          </p>
          <div className="flex flex-wrap gap-2">
            {["Coursera", "Internal Training", "Mentorship", "On-the-job"].map(
              (resource, idx) => (
                <div key={idx} className="glass-chip px-3 py-1 text-sm">
                  {resource}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card border border-white/55 px-8 py-8 bg-gradient-to-r from-indigo-50/30 to-blue-50/30">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          ⏱️ Your Career Timeline
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          {roadmap.timeline.estimated_progression}
        </p>
        <p className="text-sm text-slate-500 mt-3">
          Next milestone expected around{" "}
          {new Date(roadmap.timeline.next_milestone).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PREDICTED ROADMAP VIEW - For Admins
// ============================================================

function PredictedRoadmapView({ roadmap, selectedScenario, onScenarioChange }) {
  const scenario = roadmap.scenarios[selectedScenario];

  if (!scenario) {
    return <div>Scenario not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Scenario Selector */}
      <div className="glass-card border border-white/55 px-8 py-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Select Scenario to Explore
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.keys(roadmap.scenarios).map((scenario_key) => (
            <button
              key={scenario_key}
              onClick={() => onScenarioChange(scenario_key)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedScenario === scenario_key
                  ? "border-indigo-500 bg-indigo-50 shadow-lg"
                  : "border-white/30 bg-white/40 hover:border-indigo-300"
              }`}
            >
              <p className="font-semibold text-sm text-slate-900 capitalize">
                {scenario_key.replace("_", " ")}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Success:{" "}
                {(
                  roadmap.scenarios[scenario_key].success_probability * 100
                ).toFixed(0)}
                %
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card border border-white/55 px-6 py-6 text-center">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-1">Success Probability</p>
          <p className="text-3xl font-bold text-slate-900">
            {(scenario.success_probability * 100).toFixed(0)}%
          </p>
        </div>

        <div className="glass-card border border-white/55 px-6 py-6 text-center">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-1">Salary Growth</p>
          <p className="text-3xl font-bold text-slate-900">
            {scenario.salary_growth_estimate.total_growth_multiplier}
          </p>
        </div>

        <div className="glass-card border border-white/55 px-6 py-6 text-center">
          <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-1">Promotion Probability</p>
          <p className="text-3xl font-bold text-slate-900">
            {(scenario.promotion_probability * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Year-by-Year Milestones */}
      <div className="glass-card border border-white/55 px-8 py-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">
          10-Year Career Path
        </h3>

        <div className="space-y-4">
          {scenario.milestones.map((milestone, idx) => (
            <div
              key={idx}
              className="glass-panel border border-white/50 px-6 py-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold">
                    {milestone.year}
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-1">
                    {new Date(milestone.projected_date).toLocaleDateString()}
                  </p>

                  {milestone.role && (
                    <div>
                      <h4 className="font-semibold text-slate-900 text-lg">
                        {milestone.role}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {milestone.department}
                        {milestone.level && ` • Level ${milestone.level}`}
                      </p>
                    </div>
                  )}

                  {/* Skills Acquired */}
                  {milestone.skills_acquired.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        Skills Acquired:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {milestone.skills_acquired
                          .slice(0, 4)
                          .map((skill, i) => (
                            <span
                              key={i}
                              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Competency Growth */}
                  {milestone.competency_growth.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        Growth Areas:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {milestone.competency_growth.map((comp, i) => (
                          <span
                            key={i}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                          >
                            {comp.competency}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPARISON VIEW - For Admins
// ============================================================

function ComparisonView({ comparison }) {
  return (
    <div className="space-y-8">
      {/* Recommendation */}
      <div className="glass-card border border-white/55 px-8 py-8 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
        <div className="flex items-start gap-4">
          <Zap className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Recommended Career Path
            </h3>
            <p className="text-slate-600 capitalize">
              <span className="font-semibold text-indigo-600">
                {comparison.optimal_recommendation.replace("_", " ")}
              </span>{" "}
              is the optimal path based on employee profile and success
              probability
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Comparison Table */}
      <div className="glass-card border border-white/55 px-8 py-8 overflow-x-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Scenarios at a Glance
        </h3>

        <table className="w-full text-sm">
          <thead className="border-b border-white/20">
            <tr className="text-slate-600 font-semibold">
              <th className="text-left py-3">Scenario</th>
              <th className="text-center py-3">Success %</th>
              <th className="text-center py-3">Salary Growth</th>
              <th className="text-center py-3">Promotions</th>
              <th className="text-center py-3">Final Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {comparison.scenarios_comparison.map((scenario, idx) => (
              <tr key={idx} className="hover:bg-white/20 transition-colors">
                <td className="py-4 font-medium text-slate-900 capitalize">
                  {scenario.scenario.replace("_", " ")}
                </td>
                <td className="py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded font-semibold ${
                      scenario.success_probability > 0.7
                        ? "bg-green-100 text-green-700"
                        : scenario.success_probability > 0.5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {(scenario.success_probability * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="py-4 text-center text-slate-700">
                  {scenario.salary_growth}
                </td>
                <td className="py-4 text-center text-slate-700">
                  {scenario.milestones_count > 3 ? "Multiple" : "Few"}
                </td>
                <td className="py-4 text-center text-slate-700 text-xs">
                  {scenario.final_milestone?.role || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk Factors */}
      <div className="glass-card border border-white/55 px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <h3 className="text-xl font-bold text-slate-900">Risk Factors</h3>
        </div>

        <div className="space-y-3">
          {comparison.risk_analysis.map((risk, idx) => (
            <div
              key={idx}
              className={`glass-panel border px-5 py-4 ${
                risk.severity === "high"
                  ? "border-rose-200/50 bg-rose-50/30"
                  : "border-amber-200/50 bg-amber-50/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    risk.severity === "high"
                      ? "text-rose-600"
                      : "text-amber-600"
                  }`}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {risk.risk}
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    {risk.description}
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    ✓ {risk.mitigation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retention Factors */}
      <div className="glass-card border border-white/55 px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-green-500" />
          <h3 className="text-xl font-bold text-slate-900">
            Retention Factors
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strengths */}
          <div className="glass-panel border border-green-200/50 bg-green-50/30 px-5 py-5">
            <h4 className="font-semibold text-slate-900 mb-3">✨ Strengths</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {comparison.retention_factors.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Development Areas */}
          <div className="glass-panel border border-amber-200/50 bg-amber-50/30 px-5 py-5">
            <h4 className="font-semibold text-slate-900 mb-3">
              📈 Development Areas
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {comparison.retention_factors.development_areas.map(
                (area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">→</span>
                    <span>{area}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Strategies */}
          <div className="glass-panel border border-indigo-200/50 bg-indigo-50/30 px-5 py-5">
            <h4 className="font-semibold text-slate-900 mb-3">
              🎯 Retention Strategies
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {comparison.retention_factors.retention_strategies.map(
                (strategy, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">💡</span>
                    <span>{strategy}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
