import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Layers,
  MapPin,
  Calendar,
  Trash2,
  Edit2,
  FileText,
  Activity,
  Plus,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Farm, SoilAnalysis, SoilTestResult, FarmEvent } from '../types.js';

interface FarmDetailViewProps {
  farmId: string;
  onBack: () => void;
  onScanSoil: (farmId: string) => void;
  onSelectAnalysis: (analysisId: string) => void;
}

export const FarmDetailView: React.FC<FarmDetailViewProps> = ({
  farmId,
  onBack,
  onScanSoil,
  onSelectAnalysis
}) => {
  const { language, t } = useAuth();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [analyses, setAnalyses] = useState<SoilAnalysis[]>([]);
  const [labResults, setLabResults] = useState<SoilTestResult[]>([]);
  const [events, setEvents] = useState<FarmEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Lab Result Modal
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [labName, setLabName] = useState('KALRO National Agricultural Research Laboratories (NARL)');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [ph, setPh] = useState('6.2');
  const [nitrogen, setNitrogen] = useState('0.18');
  const [phosphorus, setPhosphorus] = useState('14');
  const [potassium, setPotassium] = useState('180');
  const [organicCarbon, setOrganicCarbon] = useState('2.4');
  const [ec, setEc] = useState('0.35');
  const [labNotes, setLabNotes] = useState('');
  const [isSubmittingLab, setIsSubmittingLab] = useState(false);

  // Add Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventType, setEventType] = useState<FarmEvent['event_type']>('fertilizer');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventNotes, setEventNotes] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [farmId]);

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFarmById(farmId);
      setFarm(res.farm);
      setAnalyses(res.analyses);
      setLabResults(res.labResults);
      setEvents(res.events);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLabResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLab(true);
    try {
      await api.createLabResult({
        farm_id: farmId,
        laboratory_name: labName,
        test_date: testDate,
        ph: ph ? Number(ph) : undefined,
        nitrogen: nitrogen ? Number(nitrogen) : undefined,
        phosphorus: phosphorus ? Number(phosphorus) : undefined,
        potassium: potassium ? Number(potassium) : undefined,
        organic_carbon: organicCarbon ? Number(organicCarbon) : undefined,
        ec: ec ? Number(ec) : undefined,
        notes: labNotes
      });
      setIsLabModalOpen(false);
      loadDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingLab(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEvent(true);
    try {
      await api.createFarmEvent({
        farm_id: farmId,
        event_type: eventType,
        event_date: eventDate,
        notes: eventNotes
      });
      setIsEventModalOpen(false);
      setEventNotes('');
      loadDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteFarm = async () => {
    if (!confirm(language === 'sw' ? 'Je, una uhakika unataka kufuta shamba hili na rekodi zake zote?' : 'Are you sure you want to permanently delete this farm and all its history?')) {
      return;
    }
    try {
      await api.deleteFarm(farmId);
      onBack();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (isLoading || !farm) {
    return (
      <div className="py-20 text-center text-stone-500 text-sm">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          id="farm-detail-back"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="farm-scan-action-btn"
            onClick={() => onScanSoil(farm.id)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>{t.navScan}</span>
          </button>
          <button
            onClick={handleDeleteFarm}
            className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            title="Delete Farm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Farm Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{farm.ward ? `${farm.ward}, ` : ''}{farm.sub_county}, {farm.county}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
              {farm.name}
            </h1>
          </div>
          <span className="text-sm font-bold px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 self-start sm:self-auto">
            {farm.area} {farm.area_unit}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
              {language === 'sw' ? 'Zao Lililopo' : 'Current Crop'}
            </span>
            <span className="font-bold text-stone-800">{farm.current_crop || 'None'}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
              {language === 'sw' ? 'Zao Lililotangulia' : 'Previous Crop'}
            </span>
            <span className="font-bold text-stone-800">{farm.previous_crop || 'None'}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
              {language === 'sw' ? 'Aina ya Udongo' : 'Soil Classification'}
            </span>
            <span className="font-bold text-stone-800">{farm.soil_type || 'Unspecified'}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
              {language === 'sw' ? 'Umwagiliaji' : 'Irrigation'}
            </span>
            <span className="font-bold text-stone-800 capitalize">{farm.irrigation_status?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Verified Laboratory Results Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-stone-900 font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <span>{language === 'sw' ? 'Matokeo ya Maabara Yaliyothibitishwa' : 'Verified Laboratory Results'}</span>
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'sw' ? 'Vipimo vya kemikali kutoka maabara zilizoidhinishwa (k.m. KALRO NARL, Cropnuts)' : 'Accredited chemical diagnostic records (e.g. KALRO, Cropnuts, SoilCares)'}
            </p>
          </div>
          <button
            id="add-lab-result-btn"
            onClick={() => setIsLabModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? '+ Weka Kipimo cha Maabara' : '+ Enter Lab Test'}</span>
          </button>
        </div>

        {labResults.length === 0 ? (
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
            <p className="text-xs text-stone-600">{t.noLabYet}</p>
            <p className="text-[11px] text-stone-500 max-w-md mx-auto">
              If you have had your soil tested at a laboratory, adding your certificate will calibrate your visual scans with exact mineral requirements.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {labResults.map(lab => (
              <div key={lab.id} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-950">{lab.laboratory_name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold">
                      SOURCE: LABORATORY
                    </span>
                  </div>
                  <span className="text-stone-500">{new Date(lab.test_date).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-[10px] text-stone-400 block">pH</span>
                    <span className="font-mono font-bold text-stone-900">{lab.ph ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-[10px] text-stone-400 block">Nitrogen (N)</span>
                    <span className="font-mono font-bold text-stone-900">{lab.nitrogen ? `${lab.nitrogen}%` : '—'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-[10px] text-stone-400 block">Phosphorus (P)</span>
                    <span className="font-mono font-bold text-stone-900">{lab.phosphorus ? `${lab.phosphorus} ppm` : '—'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-[10px] text-stone-400 block">Potassium (K)</span>
                    <span className="font-mono font-bold text-stone-900">{lab.potassium ? `${lab.potassium} ppm` : '—'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-[10px] text-stone-400 block">Organic Carbon</span>
                    <span className="font-mono font-bold text-stone-900">{lab.organic_carbon ? `${lab.organic_carbon}%` : '—'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-[10px] text-stone-400 block">EC (Salinity)</span>
                    <span className="font-mono font-bold text-stone-900">{lab.ec ? `${lab.ec} dS/m` : '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Soil Analyses History for this Farm */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <h2 className="font-bold text-lg text-stone-900 font-display flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-700" />
          <span>{language === 'sw' ? 'Historia ya Upimaji wa Picha' : 'Soil Assessment History'}</span>
        </h2>

        {analyses.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">{t.noAnalysesYet}</p>
        ) : (
          <div className="space-y-3">
            {analyses.map(a => (
              <div
                key={a.id}
                onClick={() => onSelectAnalysis(a.id)}
                className="p-4 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {a.images?.[0] ? (
                    <img
                      src={a.images[0].storage_path}
                      alt="Scan"
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-stone-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 capitalize">
                      {a.ai_result?.overall_assessment?.replace(/_/g, ' ') || 'Completed Assessment'}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {new Date(a.created_at).toLocaleDateString()} • {a.confidence} confidence
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Farm Activity Journal Events */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-stone-900 font-display flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-700" />
            <span>{language === 'sw' ? 'Shajara ya Shamba' : 'Farm Activity Timeline'}</span>
          </h2>
          <button
            id="log-event-btn"
            onClick={() => setIsEventModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? '+ Andika Shughuli' : '+ Log Activity'}</span>
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">{t.noEventsYet}</p>
        ) : (
          <div className="space-y-2.5">
            {events.map(e => (
              <div key={e.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 capitalize">
                    {e.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(e.event_date).toLocaleDateString()}
                  </span>
                </div>
                {e.notes && <p className="text-stone-600">{e.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Lab Result Modal */}
      {isLabModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full my-8 shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-lg text-stone-900 font-display">
                Enter Laboratory Test Certificate
              </h3>
              <button onClick={() => setIsLabModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleSaveLabResult} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Testing Laboratory Name *
                </label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={e => setLabName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Test Date *
                </label>
                <input
                  type="date"
                  required
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Soil pH (H2O)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.5"
                    max="10.0"
                    value={ph}
                    onChange={e => setPh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Total N (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nitrogen}
                    onChange={e => setNitrogen(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Avail. P (ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={phosphorus}
                    onChange={e => setPhosphorus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Potassium (ppm)</label>
                  <input
                    type="number"
                    step="1"
                    value={potassium}
                    onChange={e => setPotassium(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Organic C (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={organicCarbon}
                    onChange={e => setOrganicCarbon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">EC (dS/m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ec}
                    onChange={e => setEc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Lab Notes or Certificate Number
                </label>
                <textarea
                  rows={2}
                  value={labNotes}
                  onChange={e => setLabNotes(e.target.value)}
                  placeholder="e.g. Sample ID #NARL-2024-890"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsLabModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLab}
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  {isSubmittingLab ? 'Saving...' : 'Save Lab Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-lg text-stone-900 font-display">Log Farm Activity</h3>
              <button onClick={() => setIsEventModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
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
                  <option value="manure">Manure / Samadi</option>
                  <option value="compost">Compost / Mboji</option>
                  <option value="soil_amendment">Soil Amendment / Lime</option>
                  <option value="irrigation">Irrigation (Kumwagilia Maji)</option>
                  <option value="harvest">Harvesting (Kuvuna)</option>
                  <option value="rain">Heavy Rain Event (Mvua Kubwa)</option>
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
                  value={eventNotes}
                  onChange={e => setEventNotes(e.target.value)}
                  placeholder="e.g. Applied CAN top-dressing 50kg at knee-high stage"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-6 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  {isSubmittingEvent ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
