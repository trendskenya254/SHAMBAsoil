import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle2, Loader2, Sparkles, Phone } from 'lucide-react';
import { api } from '../services/api.js';

interface ExpertReviewModalProps {
  isOpen: boolean;
  analysisId: string;
  farmId: string;
  onClose: () => void;
}

export const ExpertReviewModal: React.FC<ExpertReviewModalProps> = ({
  isOpen,
  analysisId,
  farmId,
  onClose
}) => {
  const [question, setQuestion] = useState('');
  const [preferredContact, setPreferredContact] = useState<'sms' | 'whatsapp' | 'call'>('whatsapp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.requestExpertReview({
        analysis_id: analysisId,
        farm_id: farmId,
        farmer_question: question,
        preferred_contact_method: preferredContact
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-lg text-stone-900 font-display">Ask an Agronomist</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-stone-900 font-display">Request Received!</h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              A certified Kenyan agronomist has been notified with your soil photo, county profile, and question. You will receive feedback via {preferredContact.toUpperCase()} within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              Back to Analysis
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Have an agronomist review your soil photo, observations, and local county weather context.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Your Specific Question or Concern *
              </label>
              <textarea
                required
                rows={3}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="e.g. My maize leaves are yellowing at the tips in lower section. Should I top-dress CAN now or wait?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                How should the agronomist contact you?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['whatsapp', 'sms', 'call'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContact(method)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-colors ${
                      preferredContact === method
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !question.trim()}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Request</span>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
