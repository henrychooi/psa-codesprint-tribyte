import React from 'react';
import { Sparkles, Target, TrendingUp, BookOpen } from 'lucide-react';

const CareerNarrative = ({ narrative, role, matchScore, developmentPlan }) => {
  if (!narrative) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg overflow-hidden border-2 border-purple-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-xl font-bold">Your Career Story</h2>
        </div>
        <p className="text-purple-100 text-sm">
          AI-generated personalized narrative for: <span className="font-semibold">{role?.title}</span>
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Match Score Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Match Score</span>
          </div>
          <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-bold text-xl">
            {matchScore}%
          </div>
        </div>

        {/* Narrative Text */}
        <div className="bg-white rounded-lg p-6 border border-purple-200">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{narrative}</p>
          </div>
        </div>

        {/* Development Plan */}
        {developmentPlan && developmentPlan.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Your Development Roadmap</h3>
            </div>
            
            <div className="space-y-3">
              {developmentPlan.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-4 border border-purple-200 hover:border-purple-400 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium text-gray-900">{item.skill}</h4>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>
                  
                  <div className="space-y-1 mt-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Suggested Actions:</p>
                    <ul className="space-y-1">
                      {item.suggested_actions.map((action, actionIdx) => (
                        <li key={actionIdx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {item.estimated_timeline && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        ⏱️ Estimated timeline: <span className="font-medium">{item.estimated_timeline}</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-purple-100 rounded-lg p-4 border border-purple-300">
          <p className="text-sm text-purple-900">
            <span className="font-semibold">💡 Next Step:</span> Schedule a conversation with your line manager
            to discuss this opportunity and create your personalized development plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerNarrative;
