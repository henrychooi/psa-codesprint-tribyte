import React from 'react';
import { X, FileText, Users, TrendingUp, Zap } from 'lucide-react';

const EvidenceModal = ({ isOpen, onClose, componentKey, componentData, evidence }) => {
  if (!isOpen) return null;

  const componentInfo = {
    outcome_impact: {
      title: 'Outcome Impact',
      icon: TrendingUp,
      description: 'Tangible business results and measurable achievements',
      weight: '25%',
      color: 'text-blue-600 bg-blue-100'
    },
    stakeholder_complexity: {
      title: 'Stakeholder Complexity',
      icon: Users,
      description: 'Ability to influence and collaborate with diverse groups',
      weight: '25%',
      color: 'text-purple-600 bg-purple-100'
    },
    change_management: {
      title: 'Change Management',
      icon: Zap,
      description: 'Leadership in transformation and change initiatives',
      weight: '20%',
      color: 'text-green-600 bg-green-100'
    },
    progression_velocity: {
      title: 'Progression Velocity',
      icon: FileText,
      description: 'Career advancement rate and growth trajectory',
      weight: '30%',
      color: 'text-red-600 bg-red-100'
    }
  };

  const info = componentInfo[componentKey] || componentInfo.outcome_impact;
  const Icon = info.icon;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg ${info.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">{info.title}</h2>
              <p className="text-sm text-gray-600">Weight: {info.weight} of overall score</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-psa-blue mb-2">
                {componentData}%
              </div>
              <p className="text-gray-700">{info.description}</p>
            </div>
          </div>

          {/* Evidence */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Supporting Evidence</h3>
            <div className="space-y-3">
              {Array.isArray(evidence) ? (
                evidence.length > 0 ? (
                  evidence.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-psa-blue rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700 flex-1">{item}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No specific evidence documented</p>
                )
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{evidence}</p>
                </div>
              )}
            </div>
          </div>

          {/* How to Improve */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">💡 How to Improve This Score</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              {componentKey === 'outcome_impact' && (
                <>
                  <li>• Quantify your project outcomes with specific metrics (e.g., "30% cost reduction")</li>
                  <li>• Document measurable business impact in project reports</li>
                  <li>• Focus on high-impact initiatives with clear ROI</li>
                </>
              )}
              {componentKey === 'stakeholder_complexity' && (
                <>
                  <li>• Lead cross-functional projects involving multiple departments</li>
                  <li>• Engage with senior management and executive stakeholders</li>
                  <li>• Work with external partners, vendors, or customers</li>
                </>
              )}
              {componentKey === 'change_management' && (
                <>
                  <li>• Take on transformation or migration projects</li>
                  <li>• Document your change management approach and lessons learned</li>
                  <li>• Pursue change management training or certifications</li>
                </>
              )}
              {componentKey === 'progression_velocity' && (
                <>
                  <li>• Discuss career advancement goals with your manager</li>
                  <li>• Identify and close skill gaps for the next level</li>
                  <li>• Seek stretch assignments and leadership opportunities</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-psa-blue text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceModal;
