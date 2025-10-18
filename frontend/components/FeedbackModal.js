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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h2 id="feedback-modal-title" className="text-xl font-bold text-gray-900">
                  Disagree with this score?
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Close feedback modal"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-gray-600">
                Your feedback helps us improve the leadership assessment system for everyone. 
                Please select the issue you're experiencing:
              </p>

              {/* Feedback Options */}
              <div className="space-y-2">
                {feedbackOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      feedbackType === option.value
                        ? 'border-psa-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackType"
                      value={option.value}
                      checked={feedbackType === option.value}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="mr-3 w-4 h-4 text-psa-blue"
                    />
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>

              {/* Comments */}
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psa-blue focus:border-transparent resize-none"
                  placeholder="Tell us more about your concerns..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!feedbackType || submitting}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  !feedbackType || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-psa-blue text-white hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              Your feedback helps us improve leadership assessment for everyone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
