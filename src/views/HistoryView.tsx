import React, { useState, useEffect } from 'react';
import {
  Camera,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { SoilAnalysis } from '../types.js';
import { EmptyState } from '../components/EmptyState.js';

interface HistoryViewProps {
  onSelectAnalysis: (id: string) => void;
  onNewScan: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onSelectAnalysis,
  onNewScan
}) => {
  const { language, t } = useAuth();
  const [analyses, setAnalyses] = useState<SoilAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setIsLoading(true);
    try {
      const list = await api.getSoilAnalyses();
      setAnalyses(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = analyses.filter(a => {
    const term = searchQuery.toLowerCase();
    const farmMatch = (a.farm_name || '').toLowerCase().includes(term);
    const cropMatch = (a.observations?.intended_crop || '').toLowerCase().includes(term);
    return farmMatch || cropMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
            {t.navHistory}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {language === 'sw'
              ? 'Kumbukumbu kamili za vipimo vya udongo zilizofanywa kwenye simu yako'
              : 'Complete repository of photographic soil assessments performed on your farms'}
          </p>
        </div>

        <button
          id="history-new-scan-btn"
          onClick={onNewScan}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>{t.navScan}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
        <input
          id="history-search"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={language === 'sw' ? 'Tafuta kwa jina la shamba au zao...' : 'Search by farm name or crop...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white shadow-xs"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 text-center text-stone-500 text-sm">{t.loading}</div>
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={Camera}
          title={language === 'sw' ? 'Hakuna Vipimo Bado' : 'No Soil Assessments Yet'}
          description={t.noAnalysesYet}
          actionLabel={t.navScan}
          onAction={onNewScan}
        />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-sm">
          No records match your search query.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(analysis => {
            const thumb = analysis.images?.[0]?.storage_path;
            const status = analysis.ai_result?.overall_assessment;

            return (
              <div
                key={analysis.id}
                id={`history-item-${analysis.id}`}
                onClick={() => onSelectAnalysis(analysis.id)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt="Sample"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-stone-900 truncate">
                        {analysis.farm_name || 'Farm Soil Scan'}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {analysis.confidence} confidence
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Crop: {analysis.observations?.intended_crop || 'General'}</span>
                      <span>•</span>
                      <span className="capitalize">{analysis.observations?.soil_feel} soil</span>
                    </div>

                    <p className="text-xs text-stone-700 line-clamp-1">
                      {analysis.ai_result?.visual_observations?.[0] || 'Soil analysis completed.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    status === 'soil_appears_promising'
                      ? 'bg-emerald-100 text-emerald-900'
                      : status === 'soil_suitable_with_management'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-red-100 text-red-900'
                  }`}>
                    {status ? status.replace(/_/g, ' ') : 'Completed'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
