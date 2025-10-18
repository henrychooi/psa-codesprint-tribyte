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
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">{payload[0].payload.description}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Component Breakdown</h3>
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>Click bars for details</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
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
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') onComponentClick && onComponentClick(component.key);
            }}
            aria-label={`View details for ${component.name}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{component.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(component.score)}`}>
                    {component.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{component.description}</p>
                
                {/* Evidence preview */}
                {evidence[component.key] && (
                  <div className="text-xs text-gray-500 italic">
                    {Array.isArray(evidence[component.key]) 
                      ? evidence[component.key][0]
                      : evidence[component.key]
                    }
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Methodology Section */}
      <details className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <summary className="font-semibold text-psa-blue cursor-pointer flex items-center space-x-2">
          <Info className="w-4 h-4" />
          <span>How is this calculated?</span>
        </summary>
        <div className="mt-3 text-sm text-gray-700 space-y-2">
          <p><strong>Overall Score:</strong> Weighted average of 4 components</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Outcome Impact (25%):</strong> Measured by quantified project results</li>
            <li><strong>Stakeholder Complexity (25%):</strong> Count of distinct stakeholder groups engaged</li>
            <li><strong>Change Management (20%):</strong> Demonstrated change leadership competency</li>
            <li><strong>Progression Velocity (30%):</strong> Career levels advanced per year of tenure</li>
          </ul>
          <p className="text-xs text-gray-600 mt-2">
            All scores are normalized across the organization to ensure fair comparison.
          </p>
        </div>
      </details>
    </div>
  );
};

export default ComponentBreakdown;
