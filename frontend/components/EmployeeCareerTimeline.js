import React from "react";
import { Briefcase, Calendar, TrendingUp, Award } from "lucide-react";

/**
 * EmployeeCareerTimeline Component
 * Displays the employee's career progression timeline at PSA
 */
export default function EmployeeCareerTimeline({ employeeData, timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="glass-panel p-8 text-center border border-white/40">
        <p className="text-slate-600">No career history available</p>
      </div>
    );
  }

  // Calculate duration for each position
  const calculateDuration = (start, end) => {
    if (!start) return "Duration unknown";
    
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    
    const months = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30.44));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years}y ${remainingMonths}m`;
    } else if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "Present";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="glass-panel p-6 border border-white/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              Career Timeline
            </h3>
            <p className="text-slate-600">
              Your career progression journey at PSA International
            </p>
          </div>
          {employeeData && (
            <div className="glass-chip px-4 py-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700">
                {employeeData.years_of_service ? 
                  `${employeeData.years_of_service.toFixed(1)} years at PSA` : 
                  'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="glass-panel p-8 border border-white/40">
        <div className="space-y-8">
          {timeline.map((position, index) => {
            const isCurrentRole = !position.period?.end;
            const duration = calculateDuration(position.period?.start, position.period?.end);
            
            return (
              <div key={index} className="relative">
                {/* Timeline connector line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-blue-200 -mb-8" />
                )}
                
                <div className="flex gap-6">
                  {/* Timeline dot and icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        isCurrentRole
                          ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-indigo-500/30"
                          : "bg-gradient-to-br from-blue-400 to-cyan-400 shadow-blue-400/30"
                      }`}
                    >
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    {isCurrentRole && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                    )}
                  </div>

                  {/* Position details */}
                  <div className="flex-1 min-w-0">
                    <div className="glass-card p-6 bg-white/70 border border-white/50 hover:shadow-xl transition-shadow duration-300">
                      {/* Role header */}
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-semibold text-slate-900">
                              {position.role_title}
                            </h4>
                            {isCurrentRole && (
                              <span className="glass-chip px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50/80">
                                Current Role
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 font-medium">
                            {position.organization}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="glass-chip px-3 py-2 flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span className="font-medium text-slate-700">
                              {formatDate(position.period?.start)} - {formatDate(position.period?.end)}
                            </span>
                          </div>
                          <div className="glass-chip px-3 py-1.5 text-xs font-medium text-slate-600">
                            <TrendingUp className="w-3 h-3 inline mr-1.5 text-indigo-500" />
                            {duration}
                          </div>
                        </div>
                      </div>

                      {/* Focus areas */}
                      {position.focus_areas && position.focus_areas.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                            Key Focus Areas
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {position.focus_areas.map((area, areaIndex) => (
                              <span
                                key={areaIndex}
                                className="glass-chip px-3 py-1.5 text-sm text-slate-700 bg-blue-50/50"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key skills */}
                      {position.key_skills_used && position.key_skills_used.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                            Key Skills Utilized
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {position.key_skills_used.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="glass-chip px-3 py-1.5 text-sm text-indigo-700 bg-indigo-50/60 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 border border-white/40 text-center">
          <p className="text-sm text-slate-600 mb-1">Total Positions</p>
          <p className="text-3xl font-bold text-indigo-600">{timeline.length}</p>
        </div>
        <div className="glass-panel p-5 border border-white/40 text-center">
          <p className="text-sm text-slate-600 mb-1">Current Role Since</p>
          <p className="text-lg font-semibold text-slate-900">
            {formatDate(timeline[timeline.length - 1]?.period?.start)}
          </p>
        </div>
        <div className="glass-panel p-5 border border-white/40 text-center">
          <p className="text-sm text-slate-600 mb-1">Years at PSA</p>
          <p className="text-3xl font-bold text-purple-600">
            {employeeData?.years_of_service ? 
              employeeData.years_of_service.toFixed(1) : 
              "0.0"}
          </p>
        </div>
      </div>
    </div>
  );
}
