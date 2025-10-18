import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronRight, Info } from 'lucide-react';

const ComponentBreakdown = ({ components, evidence, onComponentClick }) => {
  // Prepare data for chart
  const chartData = [
    {
      name: 'Outcome Impact',
      score: components.outcome_impact,
      description: 'Tangible business results achieved',
      color: '#0066CC',
      key: 'outcome_impact'
    },
    {
      name: 'Stakeholder Complexity',
      score: components.stakeholder_complexity,
      description: 'Ability to influence diverse groups',
      color: '#7C3AED',
      key: 'stakeholder_complexity'
    },
    {
      name: 'Change Management',
      score: components.change_management,
      description: 'Demonstrated change leadership',
      color: '#059669',
      key: 'change_management'
    },
    {
      name: 'Progression Velocity',
      score: components.progression_velocity,
      description: 'Career advancement rate',
      color: '#DC2626',
      key: 'progression_velocity'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'border-emerald-200/80 bg-emerald-50/80 text-emerald-600';
    if (score >= 60) return 'border-indigo-200/80 bg-indigo-50/80 text-indigo-600';
    if (score >= 40) return 'border-amber-200/80 bg-amber-50/80 text-amber-600';
    return 'border-orange-200/80 bg-orange-50/80 text-orange-600';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border border-white/60 px-4 py-3 shadow-lg">
          <p className="font-semibold text-slate-800">{payload[0].payload.name}</p>
          <p className="text-sm text-slate-500">{payload[0].payload.description}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel border border-white/55 px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Component Breakdown</h3>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-400">
          <Info className="w-4 h-4" />
          <span>Click bars for details</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 glass-panel border border-white/60 px-4 py-4 bg-white/70">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" width={110} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="score" 
              radius={[0, 8, 8, 0]}
              cursor="pointer"
              onClick={(data) => onComponentClick && onComponentClick(data.key)}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Component Cards */}
      <div className="space-y-4">
        {chartData.map((component) => (
          <div
            key={component.key}
            onClick={() => onComponentClick && onComponentClick(component.key)}
            className="glass-panel border border-white/60 px-4 py-4 hover:border-indigo-200/70 transition cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') onComponentClick && onComponentClick(component.key);
            }}
            aria-label={`View details for ${component.name}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-slate-900">{component.name}</h4>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreColor(component.score)}`}>
                    {component.score}%
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">{component.description}</p>
                
                {/* Evidence preview */}
                {evidence[component.key] && (
                  <div className="text-xs text-slate-400 italic">
                    {Array.isArray(evidence[component.key]) 
                      ? evidence[component.key][0]
                      : evidence[component.key]
                    }
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Methodology Section */}
      <details className="mt-6 glass-panel border border-white/60 px-4 py-4">
        <summary className="font-semibold text-indigo-600 cursor-pointer flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>How is this calculated?</span>
        </summary>
        <div className="mt-3 text-sm text-slate-600 space-y-2">
          <p><strong>Overall Score:</strong> Weighted average of 4 components</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Outcome Impact (25%):</strong> Measured by quantified project results</li>
            <li><strong>Stakeholder Complexity (25%):</strong> Count of distinct stakeholder groups engaged</li>
            <li><strong>Change Management (20%):</strong> Demonstrated change leadership competency</li>
            <li><strong>Progression Velocity (30%):</strong> Career levels advanced per year of tenure</li>
          </ul>
          <p className="text-xs text-slate-400 mt-2">
            All scores are normalized across the organization to ensure fair comparison.
          </p>
        </div>
      </details>
    </div>
  );
};

export default ComponentBreakdown;
