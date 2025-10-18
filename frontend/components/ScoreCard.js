import React from 'react';
import { TrendingUp, Award } from 'lucide-react';

const ScoreCard = ({ score, rank, trend }) => {
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'border-emerald-200/80 bg-emerald-50/80 text-emerald-600';
    if (score >= 60) return 'border-indigo-200/80 bg-indigo-50/80 text-indigo-600';
    if (score >= 40) return 'border-amber-200/80 bg-amber-50/80 text-amber-600';
    return 'border-orange-200/80 bg-orange-50/80 text-orange-600';
  };

  const getScoreRing = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-indigo-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-orange-500';
  };

  return (
    <div className="glass-panel border border-white/55 px-8 py-8 text-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-500/30 mb-5">
          <Award className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-[0.35em] mb-3">
          Leadership Potential Score
        </h2>
        
        <div className={`inline-flex flex-col items-center px-8 py-6 rounded-2xl border ${getScoreColor(score)} shadow-inner mb-4`}>
          <div className={`text-6xl font-bold ${getScoreRing(score)}`}>
            {score}
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.32em] mt-2 text-slate-500">
            out of 100
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-semibold text-indigo-500">{rank}</div>
            <div className="text-xs text-slate-500 uppercase tracking-[0.3em] mt-1">Percentile</div>
          </div>
          
          {trend && (
            <div className="flex items-center gap-2 glass-chip px-3 py-2 text-sm font-semibold text-emerald-600">
              <TrendingUp className="w-5 h-5" />
              <div>
                <div>{trend}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/80">vs last quarter</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
