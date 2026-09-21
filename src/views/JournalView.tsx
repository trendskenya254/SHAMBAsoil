import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  Layers,
  Filter,
  Activity,
  CheckCircle2,
  Trash2,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Farm, FarmEvent } from '../types.js';
import { EmptyState } from '../components/EmptyState.js';

export const JournalView: React.FC = () => {
  const { language, t } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [events, setEvents] = useState<FarmEvent[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetFarmId, setTargetFarmId] = useState('');
  const [eventType, setEventType] = useState<FarmEvent['event_type']>('fertilizer');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fList, eList] = await Promise.all([
        api.getFarms(),
        api.getFarmEvents()
      ]);
      setFarms(fList);
      setEvents(eList);
      if (fList.length > 0 && !targetFarmId) {
        setTargetFarmId(fList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFarmId) return;
    setIsSubmitting(true);
    try {
      await api.createFarmEvent({
        farm_id: targetFarmId,
        event_type: eventType,
        event_date: eventDate,
        notes
      });
      setIsModalOpen(false);
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter(ev => {
    const matchesFarm = selectedFarmId === 'all' || ev.farm_id === selectedFarmId;
    const matchesType = selectedType === 'all' || ev.event_type === selectedType;
    return matchesFarm && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
            {t.navJournal}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {language === 'sw'
              ? 'Rekodi shughuli zote za kupanda, mbolea, mvua na mavuno shambani mwako'
              : 'Log all field applications, planting dates, rainfall events, and seasonal yields'}
          </p>
        </div>

        <button
          id="journal-add-btn"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'sw' ? 'Andika Shughuli' : 'Log Activity'}</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Farm filter */}
        <select
          value={selectedFarmId}
          onChange={e => setSelectedFarmId(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
        >
          <option value="all">{language === 'sw' ? 'Mashamba Yote' : 'All Farms'}</option>
          {farms.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
        >
          <option value="all">{language === 'sw' ? 'Shughuli Zote' : 'All Activity Types'}</option>
          <option value="planting">Planting (Kupanda)</option>
          <option value="fertilizer">Fertilizer (Mbolea)</option>
          <option value="manure">Manure (Samadi)</option>
          <option value="compost">Compost (Mboji)</option>
          <option value="soil_amendment">Soil Amendment (Lime)</option>
          <option value="irrigation">Irrigation</option>
          <option value="harvest">Harvest (Kuvuna)</option>
          <option value="rain">Rain Event</option>
          <option value="pest_scouting">Pest / Disease</option>
        </select>
      </div>

      {/* Events Stream */}
      {isLoading ? (
        <div className="py-20 text-center text-stone-500 text-sm">{t.loading}</div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title={language === 'sw' ? 'Shajara Haina Rekodi Bado' : 'Journal is Empty'}
          description={t.noEventsYet}
          actionLabel={language === 'sw' ? 'Andika Shughuli ya Kwanza' : 'Log First Activity'}
          onAction={() => setIsModalOpen(true)}
        />
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-xs">
          No activities match your selected filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map(ev => {
            const farmName = farms.find(f => f.id === ev.farm_id)?.name || 'Farm';
            return (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base capitalize">
                        {ev.event_type.replace(/_/g, ' ')}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {farmName}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {ev.notes || 'Activity logged.'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-stone-400 font-medium self-end sm:self-center flex-shrink-0">
                  {new Date(ev.event_date).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-lg text-stone-900 font-display">Log Farm Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Farm *
                </label>
                <select
                  required
                  value={targetFarmId}
                  onChange={e => setTargetFarmId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.county})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Activity Type *
                </label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  <option value="planting">Planting (Kupanda)</option>
                  <option value="fertilizer">Fertilizer Application (Kuweka Mbolea)</option>
                  <option value="manure">Manure (Samadi)</option>
                  <option value="compost">Compost (Mboji)</option>
                  <option value="soil_amendment">Soil Amendment (Lime)</option>
                  <option value="irrigation">Irrigation (Kumwagilia)</option>
                  <option value="harvest">Harvesting (Kuvuna)</option>
                  <option value="rain">Heavy Rain Event</option>
                  <option value="pest_scouting">Pest / Disease Observation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Notes / Quantities
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Applied 2 bags of DAP per acre at planting"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
