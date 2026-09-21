import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  CreditCard,
  Wifi,
  WifiOff,
  LogOut,
  Shield,
  CheckCircle2,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface ProfileViewProps {
  onOpenGlossary: () => void;
  onOpenSupport: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenGlossary,
  onOpenSupport
}) => {
  const { profile, logout, isOnline, language, setLanguage, updateProfile, t } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name || '');
  const [ward, setWard] = useState(profile?.ward || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ full_name: name, ward });
      setIsEditing(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    try {
      await api.flushOfflineQueue();
      setSyncMsg(language === 'sw' ? 'Marekebisho yote yamesawazishwa!' : 'All offline records synced successfully!');
    } catch (e: any) {
      setSyncMsg(e.message || 'Sync completed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
          {t.navProfile}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          {language === 'sw'
            ? 'Taarifa za akaunti yako ya mkulima, lugha, na usawazishaji wa simu'
            : 'Your farmer profile, regional settings, and synchronization status'}
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl font-display">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'M'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-stone-900">
                {profile?.full_name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                {profile?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-stone-400" />
            <div>
              <span className="text-[10px] text-stone-400 block font-bold">PHONE NUMBER</span>
              <span className="font-semibold text-stone-800">{profile?.phone || 'Not set'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-stone-400" />
            <div>
              <span className="text-[10px] text-stone-400 block font-bold">EMAIL ADDRESS</span>
              <span className="font-semibold text-stone-800">{profile?.email || 'Not set'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-stone-400" />
            <div>
              <span className="text-[10px] text-stone-400 block font-bold">COUNTY & SUB-COUNTY</span>
              <span className="font-semibold text-stone-800">{profile?.county}, {profile?.sub_county}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-stone-400" />
            <div>
              <span className="text-[10px] text-stone-400 block font-bold">WARD / VILLAGE</span>
              <span className="font-semibold text-stone-800">{profile?.ward || 'Unspecified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-700" />
          <span>{language === 'sw' ? 'Lugha ya Mfumo' : 'System Language'}</span>
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
              language === 'en'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            English (Default)
          </button>
          <button
            onClick={() => setLanguage('sw')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
              language === 'sw'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            Kiswahili (Mkulima)
          </button>
        </div>
      </div>

      {/* Connectivity & Offline Sync */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-emerald-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                {isOnline ? 'Online - Cloud Connected' : 'Offline Mode Active'}
              </h3>
              <p className="text-xs text-stone-500">
                {isOnline
                  ? 'All farm data and scans are synchronizing with ShambaSoil cloud'
                  : 'New entries are queued locally in browser storage'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={isSyncing || !isOnline}
            className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
        {syncMsg && (
          <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg">
            {syncMsg}
          </p>
        )}
      </div>

      {/* Subscription & M-Pesa Integration Status */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-sm text-stone-900">M-Pesa Account & Tier</h3>
              <p className="text-xs text-stone-500">Free Kenyan Smallholder Tier (Active)</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
            ACTIVE
          </span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Full visual soil assessment, crop matching, and farm journal are free for Kenyan smallholders. Optional agronomist review packages can be settled via M-Pesa STK push.
        </p>
      </div>

      {/* Useful Links & Logout */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenGlossary}
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 text-center"
          >
            {t.navGlossary}
          </button>
          <button
            onClick={onOpenSupport}
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 text-center"
          >
            {t.navSupport}
          </button>
        </div>

        <button
          id="profile-logout-btn"
          onClick={logout}
          className="w-full py-3 px-4 rounded-2xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.navLogout}</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-stone-900 font-display">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ward / Location</label>
                <input
                  type="text"
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
