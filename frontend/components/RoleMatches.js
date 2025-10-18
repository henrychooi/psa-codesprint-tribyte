import React, { useState } from 'react';
import { Briefcase, MapPin, CheckCircle, XCircle, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

const RoleMatches = ({ matches }) => {
  const [expandedRole, setExpandedRole] = useState(null);

  if (!matches || matches.length === 0) {
    return (
      <div className="glass-panel border border-white/55 px-8 py-10 text-center">
        <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">No role matches found.</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 85) return 'border-emerald-200/80 bg-emerald-50/80 text-emerald-600';
    if (score >= 70) return 'border-indigo-200/80 bg-indigo-50/80 text-indigo-600';
    if (score >= 55) return 'border-amber-200/80 bg-amber-50/80 text-amber-600';
    return 'border-orange-200/80 bg-orange-50/80 text-orange-600';
  };

  const getStrengthBadge = (strength) => {
    const colors = {
      'Excellent Match': 'border-emerald-200/80 bg-emerald-50/80 text-emerald-600',
      'Strong Match': 'border-indigo-200/80 bg-indigo-50/80 text-indigo-600',
      'Good Match': 'border-amber-200/80 bg-amber-50/80 text-amber-600',
      'Potential Match': 'border-orange-200/80 bg-orange-50/80 text-orange-600',
      'Stretch Opportunity': 'border-purple-200/80 bg-purple-50/80 text-purple-600',
    };
    return colors[strength] || 'border-slate-200/80 bg-slate-50/80 text-slate-600';
  };

  const toggleRole = (idx) => {
    setExpandedRole(expandedRole === idx ? null : idx);
  };

  return (
    <div className="glass-panel border border-white/55 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-6 text-white">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Role Recommendations</h2>
        </div>
        <p className="text-indigo-100 text-sm mt-2">
          AI-matched opportunities aligned to the employee’s strengths and aspirations.
        </p>
      </div>

      <div className="divide-y divide-white/50">
        {matches.map((match, idx) => {
          const isExpanded = expandedRole === idx;
          const { role, match_score, skill_match, recommendation_strength } = match;

          return (
            <div key={idx} className="px-6 py-6 bg-white/65 hover:bg-white/75 transition-colors">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{role.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStrengthBadge(recommendation_strength)}`}>
                      {recommendation_strength}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      {role.department}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {role.location}
                    </span>
                  </div>
                </div>
                <div className={`px-4 py-2 text-center rounded-xl border ${getScoreColor(match_score)}`}>
                  <div className="text-2xl font-semibold">{match_score}%</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    Match score
                  </div>
                </div>
              </div>

              {role.description && (
                <p className="text-sm text-slate-500 mt-4">
                  {role.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="glass-panel border border-emerald-200/70 bg-emerald-50/70 px-4 py-3">
                  <div className="flex items-center text-emerald-600 mb-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">Skills matched</span>
                  </div>
                  <div className="text-2xl font-semibold text-emerald-700">
                    {skill_match.required_match_count}/{skill_match.required_total}
                  </div>
                </div>
                <div className="glass-panel border border-amber-200/70 bg-amber-50/70 px-4 py-3">
                  <div className="flex items-center text-amber-600 mb-1">
                    <XCircle className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-sm">Skills to develop</span>
                  </div>
                  <div className="text-2xl font-semibold text-amber-700">
                    {skill_match.required_missing?.length || 0}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleRole(idx)}
                className="mt-5 w-full glass-panel border border-white/60 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                {isExpanded ? 'Hide details' : 'Show details'}
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/60 space-y-4">
                  {skill_match.required_matched && skill_match.required_matched.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Your matching skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skill_match.required_matched.map((skill, skillIdx) => (
                          <span
                            key={skillIdx}
                            className="glass-chip px-3 py-1 text-xs font-semibold text-emerald-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {skill_match.required_missing && skill_match.required_missing.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-amber-500" />
                        Skills to develop
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skill_match.required_missing.map((skill, skillIdx) => (
                          <span
                            key={skillIdx}
                            className="glass-chip px-3 py-1 text-xs font-semibold text-amber-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {role.responsibilities && role.responsibilities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Key responsibilities</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        {role.responsibilities.map((resp, respIdx) => (
                          <li key={respIdx} className="flex items-start gap-2">
                            <span className="text-indigo-500">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {role.required_competencies && role.required_competencies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Required competencies</h4>
                      <div className="space-y-2">
                        {role.required_competencies.map((comp, compIdx) => (
                          <div key={compIdx} className="flex items-center justify-between text-sm text-slate-600">
                            <span>{comp.name}</span>
                            <span className="glass-chip px-2 py-0.5 text-xs font-semibold text-indigo-600">
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
