import React, { useState, useEffect } from 'react';
import {
  Home,
  Camera,
  Layers,
  Clock,
  User,
  Sprout,
  Activity,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Bell,
  WifiOff,
  LogOut,
  Menu,
  X,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenGlossary: () => void;
  onOpenSupport: () => void;
  children?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  onOpenGlossary,
  onOpenSupport,
  children
}) => {
  const { profile, logout, language, setLanguage, isOnline, t } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      api.getNotifications()
        .then(list => {
          const unread = list.filter(n => !n.read).length;
          setUnreadNotifications(unread);
        })
        .catch(() => {});
    }
  }, [profile, currentView]);

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: Home },
    { id: 'scan', label: t.navScan, icon: Camera, highlight: true },
    { id: 'farms', label: t.navFarms, icon: Layers },
    { id: 'history', label: t.navHistory, icon: Clock },
    { id: 'crops', label: t.navCrops, icon: Sprout },
    { id: 'soil-health', label: t.navSoilHealth, icon: Activity },
    { id: 'journal', label: t.navJournal, icon: FileSpreadsheet },
    { id: 'reviews', label: t.navReviews, icon: MessageSquare },
    { id: 'learn', label: t.navLearn, icon: BookOpen },
    { id: 'payments', label: t.navPayments, icon: CreditCard }
  ];

  if (profile?.role === 'system_admin') {
    navItems.push({ id: 'admin', label: t.navAdmin, icon: ShieldCheck, highlight: false });
  }

  const handleNav = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar (Mobile and Desktop) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-stone-600 hover:text-stone-900 rounded-lg lg:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div
            id="brand-header-home"
            onClick={() => handleNav('dashboard')}
            className="cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="text-amber-400">🌱</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-stone-900">
                  Shamba<span className="text-emerald-700">Soil</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 hidden sm:inline-block">
                  Kenya
                </span>
              </div>
              <p className="text-[10px] text-stone-500 hidden md:block leading-none">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Offline Badge */}
          {!isOnline && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-700" />
              <span className="hidden sm:inline">{t.offlineBadge}</span>
              <span className="sm:hidden">Offline</span>
            </div>
          )}

          {/* Language Toggle (EN / SW) */}
          <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs font-medium border border-stone-200">
            <button
              id="lang-switch-en"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'en'
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              EN
            </button>
            <button
              id="lang-switch-sw"
              onClick={() => setLanguage('sw')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'sw'
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              SW
            </button>
          </div>

          {/* Glossary Button */}
          <button
            id="nav-glossary-btn"
            onClick={onOpenGlossary}
            title={t.navGlossary}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span className="hidden md:inline">{t.navGlossary}</span>
          </button>

          {/* Help Button */}
          <button
            id="nav-support-btn"
            onClick={onOpenSupport}
            title={t.navSupport}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
          >
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span className="hidden md:inline">{t.navSupport}</span>
          </button>

          {/* Notifications */}
          <button
            id="nav-notifications-btn"
            onClick={() => handleNav('dashboard')}
            className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* User Profile Pill / Menu */}
          {profile && (
            <button
              id="nav-profile-header-btn"
              onClick={() => handleNav('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[100px]">
                  {profile.full_name}
                </p>
                <p className="text-[10px] text-stone-500 leading-none capitalize">
                  {profile.county}
                </p>
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed top-[61px] left-0 bottom-0 w-64 bg-stone-900 text-stone-200 flex-col justify-between border-r border-stone-800 z-30 overflow-y-auto">
        <div className="p-4 space-y-1">
          {/* Main Navigation List */}
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`desktop-nav-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md'
                      : item.highlight
                      ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/50'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-400 px-2 py-1">
            <span>{profile?.role === 'system_admin' ? 'Administrator' : 'Farmer'}</span>
            <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
              v1.2 KE
            </span>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.navLogout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (When hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-72 max-w-[80vw] bg-stone-900 text-stone-200 h-full flex flex-col justify-between p-4 shadow-2xl animate-slide-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
                <span className="font-display font-bold text-lg text-white">
                  Shamba<span className="text-emerald-400">Soil</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-stone-800 space-y-1">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenGlossary(); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 text-stone-300 hover:text-white text-sm"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>{t.navGlossary}</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenSupport(); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 text-stone-300 hover:text-white text-sm"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.navSupport}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.navLogout}</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          id="mob-nav-home"
          onClick={() => handleNav('dashboard')}
          className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
            currentView === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-stone-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.navHome}</span>
        </button>

        <button
          id="mob-nav-farms"
          onClick={() => handleNav('farms')}
          className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
            currentView === 'farms' ? 'text-emerald-700 font-bold' : 'text-stone-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.navFarms}</span>
        </button>

        {/* Center Prominent Scan Button */}
        <button
          id="mob-nav-scan"
          onClick={() => handleNav('scan')}
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg ring-4 ring-white active:scale-95 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-emerald-800 mt-1">{t.navScan}</span>
        </button>

        <button
          id="mob-nav-history"
          onClick={() => handleNav('history')}
          className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
            currentView === 'history' ? 'text-emerald-700 font-bold' : 'text-stone-500'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.navHistory}</span>
        </button>

        <button
          id="mob-nav-profile"
          onClick={() => handleNav('profile')}
          className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
            currentView === 'profile' ? 'text-emerald-700 font-bold' : 'text-stone-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.navProfile}</span>
        </button>
      </nav>

      {/* Main App Content Area */}
      <main className="lg:pl-64 pt-16 min-h-screen px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </>
  );
};
