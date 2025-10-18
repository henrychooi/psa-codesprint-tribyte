import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, onSubmit, employeeId }) => {
  const [feedbackType, setFeedbackType] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const feedbackOptions = [
    { value: 'too_high', label: 'This score feels too high' },
    { value: 'too_low', label: 'This score feels too low' },
    { value: 'missing_evidence', label: 'Missing evidence from my work' },
    { value: 'weights_issue', label: "Weights don't reflect my role's reality" }
  ];

  const handleSubmit = async () => {
    if (!feedbackType) return;
    
    setSubmitting(true);
    try {
      await onSubmit(employeeId, feedbackType, comments);
      setSubmitted(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedbackType('');
    setComments('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="glass-card border border-white/55 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/60 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 id="feedback-modal-title" className="text-lg font-semibold text-slate-900">
                  Disagree with this score?
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="glass-chip px-3 py-2 text-xs font-semibold text-slate-500 hover:text-indigo-500 transition-colors"
                aria-label="Close feedback modal"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-6 space-y-5 bg-white/70">
              <p className="text-sm text-slate-500">
                Your input refines the leadership model for everyone. Tell us what feels off:
              </p>

              <div className="space-y-3">
                {feedbackOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`glass-panel border px-4 py-3 rounded-2xl flex items-center gap-3 cursor-pointer transition ${
                      feedbackType === option.value ? 'border-indigo-300/80 ring-2 ring-indigo-200/60' : 'border-white/60 hover:border-indigo-200/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackType"
                      value={option.value}
                      checked={feedbackType === option.value}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="w-4 h-4 text-indigo-500 focus:ring-indigo-400"
                    />
                    <span className="text-sm font-medium text-slate-800">{option.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label htmlFor="comments" className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 mb-2">
                  Additional comments (optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 resize-none"
                  placeholder="Share context or evidence we should take into account..."
                />
              </div>
            </div>

            <div className="border-t border-white/60 bg-white/70 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                className="glass-panel border border-white/60 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!feedbackType || submitting}
                className="glass-button px-6 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </div>
          </>
        ) : (
          <div className="px-6 py-12 text-center bg-white/70">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Thank you!</h3>
            <p className="text-sm text-slate-500">
              Your perspective helps us make the leadership assessment sharper and more equitable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
