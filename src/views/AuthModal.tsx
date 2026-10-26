import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  Phone,
  MapPin,
  User,
  AlertCircle,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
      api.getCounties()
        .then(data => {
          setCounties(data);
          if (data && data.length > 0) {
            // If county not set, default to first or Nairobi/Kiambu
            const defaultCounty = data.find(c => c.name === 'Kiambu') || data[0];
            if (!county) {
              setCounty(defaultCounty.name);
              setSubCounties(defaultCounty.subCounties);
              setSubCounty(defaultCounty.subCounties[0] || '');
            }
          }
        })
        .catch(err => console.error('Failed to load counties:', err));
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

  const switchMode = (newMode: 'signin' | 'register') => {
    setMode(newMode);
    setErrorMsg(null);
    if (newMode === 'register' && identifier) {
      if (identifier.includes('@')) {
        if (!email) setEmail(identifier);
      } else {
        if (!phone) setPhone(identifier);
      }
    } else if (newMode === 'signin' && (phone || email)) {
      if (!identifier) {
        setIdentifier(phone || email);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const cleanId = identifier.trim();
        if (!cleanId) {
          throw new Error(language === 'sw' ? 'Tafadhali weka nambari ya simu au barua pepe.' : 'Please enter your phone number or email.');
        }
        await login(cleanId, password);
      } else {
        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();
        if (!cleanName) {
          throw new Error(language === 'sw' ? 'Tafadhali weka majina yako kamili.' : 'Please enter your full name.');
        }
        if (!cleanPhone) {
          throw new Error(language === 'sw' ? 'Tafadhali weka nambari yako ya simu.' : 'Please enter your phone number.');
        }
        if (!county || !subCounty) {
          throw new Error(language === 'sw' ? 'Tafadhali chagua kaunti na tarafa (sub-county).' : 'Please select your county and sub-county.');
        }
        if (password.length < 6) {
          throw new Error(language === 'sw' ? 'Nenosiri lazima liwe na herufi 6 au zaidi.' : 'Password must be at least 6 characters.');
        }

        await register({
          email: email.trim() ? email.trim() : undefined,
          phone: cleanPhone,
          password,
          full_name: cleanName,
          county,
          sub_county: subCounty,
          ward: ward.trim() || undefined,
          role,
          language
        });
      }

      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || (language === 'sw' ? 'Imeshindikana. Tafadhali thibitisha taarifa zako.' : 'Authentication failed. Please verify your credentials.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full my-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🌱
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900 font-display">
                {mode === 'signin' ? t.signInTitle : t.registerTitle}
              </h3>
              <p className="text-[11px] text-stone-500">
                {mode === 'signin'
                  ? (language === 'sw' ? 'Ingia ili kufikia mashamba yako' : 'Access your Kenyan farms and soil records')
                  : (language === 'sw' ? 'Sajili shamba kuanza kupima udongo' : 'Start with your Kenyan farm and soil scans')}
              </p>
            </div>
          </div>
          <button
            id="auth-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-100 bg-stone-100/70 p-1 m-4 mb-2 rounded-xl">
          <button
            id="auth-tab-signin"
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'sw' ? 'Ingia (Sign In)' : 'Sign In'}
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'sw' ? 'Sajili Akaunti (Register)' : 'Create Free Account'}
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-2 text-xs text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-700 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 pt-2 space-y-4 overflow-y-auto max-h-[72vh]">
          {mode === 'signin' ? (
            <>
              {/* Identifier (Phone or Email) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'sw' ? 'Nambari ya Simu au Barua Pepe' : 'Phone Number or Email'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="signin-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={language === 'sw' ? 'mfano 0712345678 au barua pepe' : 'e.g. 0712345678 or farmer@gmail.com'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  {language === 'sw'
                    ? 'Weka nambari yako ya kawaida ya simu (mfano 07..., 01... au +254...)'
                    : 'Enter your Safaricom/Airtel phone number or your email'}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t.password} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="reg-full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={language === 'sw' ? 'mfano Wanjiku Mwangi' : 'e.g. Wanjiku Mwangi'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    {language === 'sw' ? 'Nambari ya Simu' : 'Phone Number'} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0712 345 678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">07..., 01... au +254...</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    {t.emailAddress} <span className="font-normal text-stone-400">({language === 'sw' ? 'Si lazima' : 'Optional'})</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="mkulima@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t.password} (min 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* County & Sub-county */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    {t.county} *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      id="reg-county"
                      value={county}
                      onChange={e => handleCountyChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {counties.map(c => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    {t.subCounty} *
                  </label>
                  <select
                    id="reg-sub-county"
                    value={subCounty}
                    onChange={e => setSubCounty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {subCounties.map(sc => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ward / Village */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {t.ward} <span className="font-normal text-stone-400">({language === 'sw' ? 'Si lazima' : 'Optional'})</span>
                </label>
                <input
                  id="reg-ward"
                  type="text"
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  placeholder={language === 'sw' ? 'mfano Rongai, Kikuyu, Matayos, Kieni' : 'e.g. Village, Ward or Landmark'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm mt-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{language === 'sw' ? 'Inapakia...' : 'Processing...'}</span>
              </>
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
                  onClick={() => switchMode('register')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  {language === 'sw' ? 'Jisajili hapa bure' : 'Create Free Account'}
                </button>
              </p>
            ) : (
              <p>
                {language === 'sw' ? 'Tayari una akaunti? ' : 'Already have an account? '}
                <button
                  id="switch-to-signin"
                  type="button"
                  onClick={() => switchMode('signin')}
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
