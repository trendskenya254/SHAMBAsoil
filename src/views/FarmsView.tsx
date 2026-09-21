import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Camera,
  MapPin,
  Calendar,
  Trash2,
  Edit2,
  ChevronRight,
  Sprout,
  Activity,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Farm } from '../types.js';
import { EmptyState } from '../components/EmptyState.js';

interface FarmsViewProps {
  onSelectFarm: (farmId: string) => void;
  onScanSoil: (farmId: string) => void;
}

export const FarmsView: React.FC<FarmsViewProps> = ({
  onSelectFarm,
  onScanSoil
}) => {
  const { profile, language, t } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add farm form state
  const [name, setName] = useState('');
  const [county, setCounty] = useState(profile?.county || 'Nakuru');
  const [subCounty, setSubCounty] = useState(profile?.sub_county || 'Njoro');
  const [ward, setWard] = useState(profile?.ward || '');
  const [area, setArea] = useState('2.5');
  const [areaUnit, setAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [soilType, setSoilType] = useState('Red Volcanic Soil (Nitisol)');
  const [currentCrop, setCurrentCrop] = useState('Maize (Mahindi)');
  const [previousCrop, setPreviousCrop] = useState('Common Beans (Maharage)');
  const [irrigationStatus, setIrrigationStatus] = useState<any>('rain_fed');
  const [farmNotes, setFarmNotes] = useState('');
  const [counties, setCounties] = useState<any[]>([]);
  const [subCounties, setSubCounties] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFarms();
    api.getCounties().then(data => {
      setCounties(data);
      const cObj = data.find(c => c.name === county) || data[0];
      if (cObj) {
        setSubCounties(cObj.subCounties);
        if (!subCounty) setSubCounty(cObj.subCounties[0] || '');
      }
    });
  }, []);

  const loadFarms = async () => {
    setIsLoading(true);
    try {
      const list = await api.getFarms();
      setFarms(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountyChange = (newCounty: string) => {
    setCounty(newCounty);
    const found = counties.find(c => c.name === newCounty);
    if (found) {
      setSubCounties(found.subCounties);
      setSubCounty(found.subCounties[0] || '');
    }
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createFarm({
        name: name.trim(),
        county,
        sub_county: subCounty,
        ward,
        area: Number(area),
        area_unit: areaUnit,
        soil_type: soilType,
        current_crop: currentCrop,
        previous_crop: previousCrop,
        irrigation_status: irrigationStatus,
        farm_notes: farmNotes
      });
      setIsAddModalOpen(false);
      setName('');
      setFarmNotes('');
      loadFarms();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
            {t.navFarms}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {language === 'sw'
              ? 'Mashamba yako yaliyosajiliwa na historia zake za udongo'
              : 'Your registered agricultural parcels and their soil intelligence records'}
          </p>
        </div>

        <button
          id="add-farm-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'sw' ? 'Sajili Shamba Jipya' : 'Add New Farm'}</span>
        </button>
      </div>

      {/* Farms List or Empty State */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-500 text-sm">
          {t.loading}
        </div>
      ) : farms.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={language === 'sw' ? 'Hakuna Shamba Lililosajiliwa' : 'No Farms Registered Yet'}
          description={t.noFarmsYet}
          actionLabel={language === 'sw' ? 'Sajili Shamba la Kwanza' : 'Register First Farm'}
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {farms.map(farm => (
            <div
              key={farm.id}
              id={`farm-card-${farm.id}`}
              onClick={() => onSelectFarm(farm.id)}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-stone-900 font-display">
                        {farm.name}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{farm.ward ? `${farm.ward}, ` : ''}{farm.sub_county}, {farm.county}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-800">
                    {farm.area} {farm.area_unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 text-stone-600">
                  <div className="p-2.5 rounded-xl bg-stone-50">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      {language === 'sw' ? 'Zao Lililopo' : 'Current Crop'}
                    </span>
                    <span className="font-bold text-stone-800">{farm.current_crop || 'None'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      {language === 'sw' ? 'Umwagiliaji' : 'Irrigation'}
                    </span>
                    <span className="font-bold text-stone-800 capitalize">
                      {farm.irrigation_status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  id={`farm-scan-btn-${farm.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onScanSoil(farm.id);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Pima Udongo' : 'Scan Soil'}</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-bold text-stone-700 group-hover:text-emerald-700">
                  <span>{language === 'sw' ? 'Fungua Shamba' : 'View Farm'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Farm Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full my-8 shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-lg text-stone-900 font-display">
                {language === 'sw' ? 'Sajili Shamba Jipya' : 'Add New Farm'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFarm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  {language === 'sw' ? 'Jina la Shamba' : 'Farm Name'} *
                </label>
                <input
                  id="modal-farm-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Upper Shamba, Plot 4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {t.county} *
                  </label>
                  <select
                    id="modal-farm-county"
                    value={county}
                    onChange={e => handleCountyChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {counties.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {t.subCounty} *
                  </label>
                  <select
                    id="modal-farm-subcounty"
                    value={subCounty}
                    onChange={e => setSubCounty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {subCounties.map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {language === 'sw' ? 'Ukubwa' : 'Size'} *
                  </label>
                  <input
                    id="modal-farm-area"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {language === 'sw' ? 'Kipimo' : 'Unit'}
                  </label>
                  <select
                    id="modal-farm-unit"
                    value={areaUnit}
                    onChange={e => setAreaUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {language === 'sw' ? 'Zao Lililopo' : 'Current Crop'}
                  </label>
                  <input
                    id="modal-farm-crop"
                    type="text"
                    value={currentCrop}
                    onChange={e => setCurrentCrop(e.target.value)}
                    placeholder="e.g. Maize, Beans"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {language === 'sw' ? 'Zao Lililotangulia' : 'Previous Crop'}
                  </label>
                  <input
                    id="modal-farm-prev-crop"
                    type="text"
                    value={previousCrop}
                    onChange={e => setPreviousCrop(e.target.value)}
                    placeholder="e.g. Beans, Fallow"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  {language === 'sw' ? 'Hali ya Umwagiliaji' : 'Irrigation Status'}
                </label>
                <select
                  id="modal-farm-irrigation"
                  value={irrigationStatus}
                  onChange={e => setIrrigationStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="rain_fed">Rain-Fed Only (Tegemea Mvua Tu)</option>
                  <option value="supplemental">Supplemental Irrigation (Umwagiliaji wa Ziada)</option>
                  <option value="fully_irrigated">Fully Irrigated (Drip / Furrow)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-sm font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  id="modal-save-farm-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  {isSubmitting ? t.loading : (language === 'sw' ? 'Hifadhi Shamba' : 'Save Farm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
