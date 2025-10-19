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
      className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="glass-card border border-white/55 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-white/60 px-6 py-4 flex items-center z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${info.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-slate-900">{info.title}</h2>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Weight {info.weight}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6 bg-white/70">
          <div className="glass-panel border border-white/60 px-6 py-6 text-center rounded-2xl">
            <div className="text-5xl font-semibold text-indigo-500 mb-2">
              {componentData}%
            </div>
            <p className="text-sm text-slate-600">{info.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Supporting Evidence</h3>
            <div className="space-y-3">
              {Array.isArray(evidence) ? (
                evidence.length > 0 ? (
                  evidence.map((item, index) => (
                    <div key={index} className="glass-panel border border-white/60 px-4 py-3">
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2" />
                        <p className="flex-1">{item}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No specific evidence documented.</p>
                )
              ) : (
                <div className="glass-panel border border-white/60 px-4 py-3 text-sm text-slate-600">
                  {evidence}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel border border-amber-200/80 bg-amber-50/80 px-4 py-4">
            <h4 className="font-semibold text-slate-900 mb-2">💡 How to improve this score</h4>
            <ul className="text-sm text-slate-600 space-y-2">
              {componentKey === 'outcome_impact' && (
                <>
                  <li>• Quantify project outcomes with clear metrics.</li>
                  <li>• Document impact in retrospectives and reports.</li>
                  <li>• Prioritize initiatives with measurable ROI.</li>
                </>
              )}
              {componentKey === 'stakeholder_complexity' && (
                <>
                  <li>• Lead cross-functional initiatives with diverse groups.</li>
                  <li>• Engage senior stakeholders and executive sponsors.</li>
                  <li>• Partner with external vendors or customers.</li>
                </>
              )}
              {componentKey === 'change_management' && (
                <>
                  <li>• Take ownership of transformation programmes.</li>
                  <li>• Capture change playbooks and lessons learned.</li>
                  <li>• Pursue change management accreditation.</li>
                </>
              )}
              {componentKey === 'progression_velocity' && (
                <>
                  <li>• Align advancement goals with your manager.</li>
                  <li>• Target key skill gaps for the next level.</li>
                  <li>• Take on stretch roles and leadership rotations.</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/60 bg-white/70 px-6 py-4">
          <button
            onClick={onClose}
            className="glass-button w-full py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceModal;
