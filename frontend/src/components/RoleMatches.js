import React, { useState } from 'react';
import { Briefcase, MapPin, CheckCircle, XCircle, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

const RoleMatches = ({ matches }) => {
  const [expandedRole, setExpandedRole] = useState(null);

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No role matches found.</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 55) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getStrengthBadge = (strength) => {
    const colors = {
      'Excellent Match': 'bg-green-100 text-green-800',
      'Strong Match': 'bg-blue-100 text-blue-800',
      'Good Match': 'bg-yellow-100 text-yellow-800',
      'Potential Match': 'bg-orange-100 text-orange-800',
      'Stretch Opportunity': 'bg-purple-100 text-purple-800',
    };
    return colors[strength] || 'bg-gray-100 text-gray-800';
  };

  const toggleRole = (idx) => {
    setExpandedRole(expandedRole === idx ? null : idx);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-psa-blue to-psa-lightblue p-6 text-white">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-xl font-bold">Role Recommendations</h2>
        </div>
        <p className="text-blue-100 text-sm mt-2">
          AI-matched career opportunities based on skills and experience
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {matches.map((match, idx) => {
          const isExpanded = expandedRole === idx;
          const { role, match_score, skill_match, recommendation_strength } = match;

          return (
            <div key={idx} className="p-6 hover:bg-gray-50 transition">
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStrengthBadge(recommendation_strength)}`}>
                      {recommendation_strength}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {role.department}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {role.location}
                    </span>
                  </div>
                </div>
                <div className={`ml-4 px-4 py-2 rounded-lg border-2 ${getScoreColor(match_score)}`}>
                  <div className="text-2xl font-bold">{match_score}%</div>
                  <div className="text-xs">Match Score</div>
                </div>
              </div>

              {/* Description */}
              {role.description && (
                <p className="text-gray-600 text-sm mb-4">{role.description}</p>
              )}

              {/* Skill Match Summary */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center text-green-700 mb-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">Skills Matched</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {skill_match.required_match_count}/{skill_match.required_total}
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center text-orange-700 mb-1">
                    <XCircle className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">Skills to Develop</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-800">
                    {skill_match.required_missing?.length || 0}
                  </div>
                </div>
              </div>

              {/* Toggle Details Button */}
              <button
                onClick={() => toggleRole(idx)}
                className="w-full flex items-center justify-center space-x-2 text-psa-blue hover:bg-blue-50 py-2 rounded-lg transition"
              >
                <span className="text-sm font-medium">
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Matched Skills */}
                  {skill_match.required_matched && skill_match.required_matched.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Your Matching Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skill_match.required_matched.map((skill, skillIdx) => (
                          <span
                            key={skillIdx}
                            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {skill_match.required_missing && skill_match.required_missing.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                        <XCircle className="w-4 h-4 mr-2 text-orange-600" />
                        Skills to Develop
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skill_match.required_missing.map((skill, skillIdx) => (
                          <span
                            key={skillIdx}
                            className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {role.responsibilities && role.responsibilities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Responsibilities</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {role.responsibilities.map((resp, respIdx) => (
                          <li key={respIdx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Competencies */}
                  {role.required_competencies && role.required_competencies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Competencies</h4>
                      <div className="space-y-2">
                        {role.required_competencies.map((comp, compIdx) => (
                          <div key={compIdx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{comp.name}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {comp.min_level}+
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleMatches;
