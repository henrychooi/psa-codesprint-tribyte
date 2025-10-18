import React from 'react';
import { TrendingUp, Award } from 'lucide-react';

const ScoreCard = ({ score, rank, trend }) => {
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getScoreRing = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-psa-blue to-blue-600 mb-4">
          <Award className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
          Leadership Potential Score
        </h2>
        
        <div className={`inline-block px-8 py-6 rounded-2xl border-2 ${getScoreColor(score)} mb-4`}>
          <div className={`text-6xl font-bold ${getScoreRing(score)}`}>
            {score}
          </div>
          <div className="text-sm font-medium mt-1">out of 100</div>
        </div>
        
        <div className="flex items-center justify-center space-x-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-psa-blue">{rank}</div>
            <div className="text-sm text-gray-600">Percentile</div>
          </div>
          
          {trend && (
            <div className="flex items-center space-x-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <div>
                <div className="text-lg font-semibold">{trend}</div>
                <div className="text-xs text-gray-600">vs last quarter</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
