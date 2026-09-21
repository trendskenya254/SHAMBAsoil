import React, { useState, useEffect } from 'react';
import {
  Camera,
  Layers,
  Sprout,
  FileSpreadsheet,
  Activity,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CloudSun,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Farm, SoilAnalysis, FarmEvent, NotificationItem } from '../types.js';
import { EmptyState } from '../components/EmptyState.js';

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenScanWithFarm?: (farmId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenScanWithFarm
}) => {
  const { profile, language, t } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<SoilAnalysis[]>([]);
  const [recentEvents, setRecentEvents] = useState<FarmEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [farmsRes, analysesRes, eventsRes, notifsRes] = await Promise.all([
        api.getFarms().catch(() => []),
        api.getSoilAnalyses().catch(() => []),
        api.getFarmEvents().catch(() => []),
        api.getNotifications().catch(() => [])
      ]);

      setFarms(farmsRes);
      setRecentAnalyses(analysesRes.slice(0, 5));
      setRecentEvents(eventsRes.slice(0, 5));
      setNotifications(notifsRes.slice(0, 5));
    } catch (e) {
      console.error('Failed loading dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {}
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* Top Welcome & Region Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {profile?.county} County • {profile?.sub_county}
              </span>
              <span className="text-xs text-stone-400 capitalize">
                {profile?.role === 'system_admin' ? 'Administrator' : 'Verified Farmer'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              {language === 'sw' ? 'Habari,' : 'Welcome back,'} {profile?.full_name}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              {language === 'sw'
                ? 'Angalia udongo kabla ya kupanda. Maamuzi bora ya mbolea na chokaa huokoa gharama na huongeza mavuno.'
                : 'Monitor your soil before input purchasing. Calibrated agronomic intelligence for your registered shamba.'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              id="dash-scan-cta"
              onClick={() => onNavigate('scan')}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{t.navScan}</span>
            </button>
            <button
              id="dash-add-farm-cta"
              onClick={() => onNavigate('farms')}
              className="px-4 py-3 bg-stone-800/90 hover:bg-stone-700 text-stone-200 font-semibold rounded-2xl border border-stone-700 transition-colors text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'sw' ? 'Ongeza Shamba' : 'Add Farm'}</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Farms Count */}
        <div
          id="stat-card-farms"
          onClick={() => onNavigate('farms')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-emerald-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.navFarms}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
            {farms.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {farms.length === 0
              ? (language === 'sw' ? 'Hakuna shamba bado' : 'No farms added')
              : `${farms.reduce((acc, f) => acc + (f.area || 0), 0)} ${farms[0]?.area_unit || 'acres'}`}
          </p>
        </div>

        {/* Soil Analyses Completed */}
        <div
          id="stat-card-analyses"
          onClick={() => onNavigate('history')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-emerald-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {language === 'sw' ? 'Upimaji wa Udongo' : 'Soil Scans'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-700 group-hover:text-white transition-colors">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
            {recentAnalyses.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {recentAnalyses.length === 0
              ? (language === 'sw' ? 'Anza picha ya kwanza' : 'Run first scan')
              : (language === 'sw' ? 'Tathmini zilizokamilika' : 'Completed assessments')}
          </p>
        </div>

        {/* Soil Health Indicator Card */}
        <div
          id="stat-card-soil-health"
          onClick={() => onNavigate('soil-health')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-emerald-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.navSoilHealth}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-stone-800 font-display">
            {recentAnalyses.length === 0 ? (
              <span className="text-stone-400 font-normal text-xs">{language === 'sw' ? 'Haijakokotolewa' : 'Not Established'}</span>
            ) : (
              <span className="text-emerald-700 font-bold text-base sm:text-lg">
                {language === 'sw' ? 'Inahitaji Uangalizi' : 'Active Baseline'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 mt-1 truncate">
            {recentAnalyses.length === 0
              ? (language === 'sw' ? 'Pima kuanzisha msingi' : 'Add scan to calculate')
              : `${recentAnalyses.length} record(s) logged`}
          </p>
        </div>

        {/* Verified Crop Library */}
        <div
          id="stat-card-crops"
          onClick={() => onNavigate('crops')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-emerald-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.navCrops}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
            9+
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {language === 'sw' ? 'Miongozo ya KALRO' : 'KALRO guides'}
          </p>
        </div>
      </div>

      {/* Weather & Agro-Ecological Context for Registered County */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
            <CloudSun className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <span className="font-bold text-stone-900">
              {profile?.county} Regional Agro-Ecological Climate:
            </span>{' '}
            <span className="text-stone-700">
              {language === 'sw'
                ? 'Msimu wa maandalizi ya shamba. Zingatia kupima udongo na kuweka chokaa ya kilimo wiki 2-4 kabla ya mvua kuanza.'
                : 'Seasonal field preparation window. Consider testing soil acidity and applying agricultural lime 2-4 weeks prior to rainfall onset.'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('learn')}
          className="text-emerald-800 font-bold hover:underline flex-shrink-0 text-xs self-end sm:self-center"
        >
          {language === 'sw' ? 'Soma zaidi' : 'Agronomy tips'} →
        </button>
      </div>

      {/* Main Grid: Recent Analyses & Farms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Soil Scans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 font-display flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-700" />
              <span>{language === 'sw' ? 'Upimaji wa Hivi Karibuni' : 'Recent Soil Assessments'}</span>
            </h2>
            {recentAnalyses.length > 0 && (
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>{language === 'sw' ? 'Tazama yote' : 'View all'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentAnalyses.length === 0 ? (
            <EmptyState
              icon={Camera}
              title={language === 'sw' ? 'Hakuna Vipimo Bado' : 'No Soil Scans Yet'}
              description={t.noAnalysesYet}
              actionLabel={t.navScan}
              onAction={() => onNavigate('scan')}
            />
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map(analysis => {
                const imgThumb = analysis.images?.[0]?.storage_path;
                return (
                  <div
                    key={analysis.id}
                    id={`analysis-card-${analysis.id}`}
                    onClick={() => onNavigate('analysis-detail', analysis.id)}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {imgThumb ? (
                        <img
                          src={imgThumb}
                          alt="Soil Sample"
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                            {analysis.farm_name || 'Farm Soil Scan'}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {analysis.confidence} confidence
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{analysis.observations?.intended_crop || 'General agriculture'}</span>
                        </p>
                        <p className="text-xs text-stone-700 truncate mt-1">
                          {analysis.ai_result?.visual_observations?.[0] || 'Soil analysis completed'}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-stone-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions Strip */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              {language === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                id="qa-new-scan"
                onClick={() => onNavigate('scan')}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-600 transition-colors text-left flex flex-col justify-between h-20"
              >
                <Camera className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold text-stone-800">{t.navScan}</span>
              </button>

              <button
                id="qa-add-lab"
                onClick={() => onNavigate('farms')}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-600 transition-colors text-left flex flex-col justify-between h-20"
              >
                <FileText className="w-5 h-5 text-blue-700" />
                <span className="text-xs font-bold text-stone-800">{t.navLaboratory}</span>
              </button>

              <button
                id="qa-journal"
                onClick={() => onNavigate('journal')}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-600 transition-colors text-left flex flex-col justify-between h-20"
              >
                <FileSpreadsheet className="w-5 h-5 text-amber-700" />
                <span className="text-xs font-bold text-stone-800">{t.navJournal}</span>
              </button>

              <button
                id="qa-crops"
                onClick={() => onNavigate('crops')}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-600 transition-colors text-left flex flex-col justify-between h-20"
              >
                <Sprout className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold text-stone-800">{t.navCrops}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Farms List & Notifications */}
        <div className="space-y-6">
          {/* Registered Farms Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900 font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>{t.navFarms}</span>
              </h3>
              <button
                id="dash-add-farm-btn"
                onClick={() => onNavigate('farms')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                + {language === 'sw' ? 'Ongeza' : 'Add'}
              </button>
            </div>

            {farms.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-500 space-y-2">
                <p>{t.noFarmsYet}</p>
                <button
                  onClick={() => onNavigate('farms')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  {language === 'sw' ? 'Sajili shamba la kwanza' : 'Register your first farm'}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {farms.map(f => (
                  <div
                    key={f.id}
                    onClick={() => onNavigate('farm-detail', f.id)}
                    className="p-3 rounded-xl bg-stone-50 hover:bg-emerald-50/50 border border-stone-100 hover:border-emerald-200 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">{f.name}</h4>
                      <p className="text-[11px] text-stone-500">
                        {f.area} {f.area_unit} • {f.county}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (onOpenScanWithFarm) onOpenScanWithFarm(f.id);
                        else onNavigate('scan');
                      }}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100"
                      title={t.navScan}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications / Advice Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-stone-900 font-display flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-700" />
              <span>{language === 'sw' ? 'Arifa & Ushauri' : 'Alerts & Notifications'}</span>
            </h3>

            {notifications.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">{t.noNotifications}</p>
            ) : (
              <div className="space-y-2">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkNotificationRead(n.id)}
                    className={`p-3 rounded-xl text-xs transition-colors border ${
                      n.read
                        ? 'bg-stone-50/70 border-stone-100 text-stone-600'
                        : 'bg-emerald-50/70 border-emerald-200 text-stone-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-900">{n.title}</span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-stone-600">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
