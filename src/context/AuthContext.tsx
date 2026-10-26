import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Language } from '../types.js';
import { api, getAuthToken, setAuthToken, flushOfflineQueue } from '../services/api.js';
import { translations } from '../i18n/translations.js';

interface AuthContextType {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isOnline: boolean;
  syncOfflineQueue: () => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('shambasoil_lang') as Language) || 'en';
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('shambasoil_lang', lang);
  };

  const t = translations[language];

  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setProfile(res.profile);
      if (res.profile.language) {
        setLanguageState(res.profile.language);
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      setAuthToken(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();

    const handleOnline = () => {
      setIsOnline(true);
      flushOfflineQueue().then(synced => {
        if (synced > 0) {
          console.log(`Synchronized ${synced} offline farm actions.`);
        }
      });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login({ identifier, password: pass });
    setAuthToken(res.token);
    setProfile(res.profile);
    if (res.profile.language) {
      setLanguage(res.profile.language);
    }
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setAuthToken(res.token);
    setProfile(res.profile);
    if (res.profile.language) {
      setLanguage(res.profile.language);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setAuthToken(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const res = await api.updateProfile(data);
    setProfile(res.profile);
  };

  const syncOfflineQueue = async () => {
    return await flushOfflineQueue();
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        isAuthenticated: !!profile,
        isLoading,
        language,
        setLanguage,
        t,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        isOnline,
        syncOfflineQueue
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
