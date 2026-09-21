import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Phone, MapPin, User, Shield, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess
}) => {
  const { login, register, language, t } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [counties, setCounties] = useState<any[]>([]);
  const [subCounties, setSubCounties] = useState<string[]>([]);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [ward, setWard] = useState('');
  const [role, setRole] = useState<'farmer' | 'extension_officer' | 'agronomist' | 'system_admin'>('farmer');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      api.getCounties().then(data => {
        setCounties(data);
        if (data.length > 0 && !county) {
          setCounty(data[0].name);
          setSubCounties(data[0].subCounties);
          setSubCounty(data[0].subCounties[0] || '');
        }
      }).catch(err => console.error('Failed to load counties:', err));
    }
  }, [isOpen]);

  const handleCountyChange = (selectedCountyName: string) => {
    setCounty(selectedCountyName);
    const found = counties.find(c => c.name === selectedCountyName);
    if (found) {
      setSubCounties(found.subCounties);
      setSubCounty(found.subCounties[0] || '');
    } else {
      setSubCounties([]);
      setSubCounty('');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await login(identifier, password);
      } else {
        // Kenyan phone format validation/cleanup
        let cleanPhone = phone.trim();
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '+254' + cleanPhone.substring(1);
        }

        await register({
          email,
          phone: cleanPhone,
          password,
          full_name: fullName,
          county,
          sub_county: subCounty,
          ward,
          role,
          language
        });
      }
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full my-8 shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-stone-900 font-display">
              {mode === 'signin' ? t.signInTitle : t.registerTitle}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {mode === 'signin'
                ? (language === 'sw' ? 'Ingia ili kufikia mashamba yako' : 'Access your registered farms and soil data')
                : (language === 'sw' ? 'Sajili shamba lako kuanza kupima udongo' : 'Start with your Kenyan farm and soil scans')}
            </p>
          </div>
          <button
            id="auth-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {mode === 'signin' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'sw' ? 'Barua Pepe au Simu' : 'Email or Phone Number'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="signin-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={language === 'sw' ? 'mfano 0712345678 au mkulima@gmail.com' : 'e.g. 0712345678 or farmer@gmail.com'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="signin-password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t.fullName} *
                </label>
                <input
                  id="reg-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={language === 'sw' ? 'mfano Wanjiku Mwangi' : 'e.g. Wanjiku Mwangi'}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Phone & Email in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    {language === 'sw' ? 'Nambari ya Simu' : 'Phone Number'} *
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    {t.emailAddress} *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="mkulima@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t.password} (min 6 characters) *
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* County & Sub-county Dynamic Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    {t.county} *
                  </label>
                  <select
                    id="reg-county"
                    value={county}
                    onChange={e => handleCountyChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {counties.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    {t.subCounty} *
                  </label>
                  <select
                    id="reg-sub-county"
                    value={subCounty}
                    onChange={e => setSubCounty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {subCounties.map(sc => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ward / Location */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t.ward} (Optional)
                </label>
                <input
                  id="reg-ward"
                  type="text"
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  placeholder={language === 'sw' ? 'mfano Rongai, Kikuyu, Matayos' : 'e.g. Village, Ward or Landmark'}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Agricultural Role */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t.roleLabel}
                </label>
                <select
                  id="reg-role"
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="farmer">{t.roleFarmer}</option>
                  <option value="extension_officer">{t.roleExtension}</option>
                  <option value="agronomist">{t.roleAgronomist}</option>
                  <option value="system_admin">{t.roleAdmin}</option>
                </select>
              </div>
            </>
          )}

          {/* Submit Action */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? t.navLogin : t.navRegister}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-stone-600">
            {mode === 'signin' ? (
              <p>
                {language === 'sw' ? 'Huna akaunti bado? ' : "Don't have an account yet? "}
                <button
                  id="switch-to-register"
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(null); }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  {language === 'sw' ? 'Jisajili hapa' : 'Register here'}
                </button>
              </p>
            ) : (
              <p>
                {language === 'sw' ? 'Tayari una akaunti? ' : 'Already have an account? '}
                <button
                  id="switch-to-signin"
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(null); }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  {language === 'sw' ? 'Ingia hapa' : 'Sign In here'}
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
