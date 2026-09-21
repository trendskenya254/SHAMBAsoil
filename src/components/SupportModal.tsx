import React, { useState } from 'react';
import { X, HelpCircle, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { language, profile } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      setSubject('');
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-lg text-stone-900 font-display">
              {language === 'sw' ? 'Msaada & Huduma kwa Wakulima' : 'Farmer Help & Support'}
            </h3>
          </div>
          <button
            id="support-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Extension Contacts */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 text-stone-800 space-y-3">
            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700" />
              {language === 'sw' ? 'Mawasiliano ya Ugani wa Kilimo' : 'Agricultural Extension Desk'}
            </h4>
            <div className="text-xs sm:text-sm text-stone-600 space-y-1">
              <p>• <strong>Farmer Toll-Free Line:</strong> +254 700 000 742 (08:00 - 17:00 EAT)</p>
              <p>• <strong>Email:</strong> support@shambasoil.co.ke</p>
              <p>• <strong>SMS / USSD Code:</strong> *384*742# (Safaricom & Airtel Kenya)</p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-bold text-stone-900 text-lg">
                {language === 'sw' ? 'Ujumbe Wako Umepokelewa!' : 'Support Request Received!'}
              </h4>
              <p className="text-stone-600 text-sm max-w-sm mx-auto">
                {language === 'sw'
                  ? 'Afisa wetu wa kilimo atawasiliana nawe kupitia simu au barua pepe yako.'
                  : 'An agricultural advisor will follow up via your registered phone number or email.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'sw' ? 'Mada' : 'Subject'}
                </label>
                <input
                  id="support-subject"
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={language === 'sw' ? 'mfano: Swali kuhusu chokaa au upimaji' : 'e.g. Question about liming or soil scan'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'sw' ? 'Ujumbe Wako' : 'Describe your inquiry or problem'}
                </label>
                <textarea
                  id="support-message"
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={language === 'sw' ? 'Eleza hali ya shamba lako au hitilafu yoyote...' : 'Explain your farm situation, crop questions, or any application issues...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  id="support-cancel-btn"
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-sm font-medium hover:bg-stone-50"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  id="support-submit-btn"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {language === 'sw' ? 'Tuma Ujumbe' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
