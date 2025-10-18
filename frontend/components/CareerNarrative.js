import React from 'react';
import { Sparkles, Target, TrendingUp, BookOpen } from 'lucide-react';

const CareerNarrative = ({ narrative, role, matchScore, developmentPlan }) => {
  if (!narrative) return null;

  return (
    <div className="glass-panel border border-white/55 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Your Career Story</h2>
        </div>
        <p className="text-purple-100 text-sm">
          Generated for <span className="font-semibold">{role?.title}</span> to explain the opportunity and pathway clearly.
        </p>
      </div>

      <div className="px-6 py-6 space-y-6 bg-white/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="font-semibold uppercase tracking-[0.28em] text-xs text-purple-500">
              Match score
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/80 border border-purple-200/70 text-purple-600 font-semibold text-xl">
            {matchScore}%
          </div>
        </div>

        <div className="glass-card border border-white/60 bg-white/85 px-6 py-6">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{narrative}</p>
        </div>

        {developmentPlan && developmentPlan.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900">Your development roadmap</h3>
            </div>
            
            <div className="space-y-3">
              {developmentPlan.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-panel border border-white/60 px-4 py-4 hover:border-purple-200/80 transition-colors"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      <h4 className="font-medium text-slate-900">{item.skill}</h4>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.priority === 'High'
                          ? 'bg-rose-50/80 border border-rose-200/80 text-rose-600'
                          : 'bg-amber-50/80 border border-amber-200/80 text-amber-600'
                      }`}
                    >
                      {item.priority} priority
                    </span>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                      Suggested actions
                    </p>
                    <ul className="space-y-2">
                      {item.suggested_actions.map((action, actionIdx) => (
                        <li key={actionIdx} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-purple-500">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {item.estimated_timeline && (
                    <div className="mt-4 pt-3 border-t border-white/60 text-xs text-slate-500">
                      ⏱️ Estimated timeline: <span className="font-medium text-slate-600">{item.estimated_timeline}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-panel border border-purple-200/80 bg-purple-50/80 px-4 py-4">
          <p className="text-sm text-purple-700">
            <span className="font-semibold">💡 Next step:</span> Schedule a conversation with your line manager to align on this path and embed the development actions into your plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerNarrative;
