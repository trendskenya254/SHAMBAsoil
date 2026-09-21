import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Thermometer,
  Droplets,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Crop } from '../types.js';

export const CropExplorerView: React.FC = () => {
  const { profile, language, t } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getCrops()
      .then(data => {
        setCrops(data);
        if (data.length > 0) {
          setSelectedCrop(data[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [
    { id: 'all', label: language === 'sw' ? 'Zote' : 'All Crops' },
    { id: 'cereal', label: language === 'sw' ? 'Nafaka (Cereals)' : 'Cereals' },
    { id: 'legume', label: language === 'sw' ? 'Kunde & Maharage (Legumes)' : 'Legumes' },
    { id: 'vegetable', label: language === 'sw' ? 'Mboga (Vegetables)' : 'Vegetables' },
    { id: 'tuber', label: language === 'sw' ? 'Mizizi (Tubers)' : 'Tubers' },
    { id: 'cash_crop', label: language === 'sw' ? 'Mazao ya Biashara' : 'Cash Crops' }
  ];

  const filteredCrops = crops.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.kenya_notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            KALRO Grounded
          </span>
          {profile?.county && (
            <span className="text-xs text-stone-500">
              Personalized for {profile.county} County
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900 mt-1">
          {t.navCrops}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          {language === 'sw'
            ? 'Miongozo ya kisayansi ya uzalishaji wa mazao kulingana na aina ya udongo na mbolea'
            : 'Agronomic soil requirements, fertilization timing, and yield guidelines for Kenyan staples'}
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            id="crop-search"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'sw' ? 'Tafuta zao (mf. Mahindi, Maharage, Viazi)...' : 'Search crop (e.g. Maize, Beans, Potato)...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-stone-500 text-sm">{t.loading}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Crop List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredCrops.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-xs">
                No crops match your search query.
              </div>
            ) : (
              filteredCrops.map(crop => {
                const isSelected = selectedCrop?.id === crop.id;
                return (
                  <div
                    key={crop.id}
                    id={`crop-item-${crop.id}`}
                    onClick={() => setSelectedCrop(crop)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-600 shadow-sm'
                        : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        <Sprout className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 text-sm truncate">{crop.name}</h4>
                        <p className="text-stone-500 text-xs italic truncate">{crop.scientific_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 capitalize">
                        {crop.category.replace('_', ' ')}
                      </span>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-stone-400'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Crop Agronomy Guide */}
          <div className="lg:col-span-7">
            {selectedCrop ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-stone-900">
                      {selectedCrop.name}
                    </h2>
                    <p className="text-xs text-stone-500 italic mt-0.5">
                      {selectedCrop.scientific_name}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 self-start sm:self-auto capitalize">
                    {selectedCrop.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Key Soil & Environmental Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      OPTIMAL PH
                    </span>
                    <span className="font-bold text-stone-800">{selectedCrop.ph_preference}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      DURATION
                    </span>
                    <span className="font-bold text-stone-800">{selectedCrop.growth_duration_days}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      WATER
                    </span>
                    <span className="font-bold text-stone-800 capitalize">{selectedCrop.water_requirement}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      DRAINAGE
                    </span>
                    <span className="font-bold text-stone-800 capitalize">{selectedCrop.drainage_preference}</span>
                  </div>
                </div>

                {/* Soil Texture & Planting Guidance */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Soil Preferences & Texture</span>
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                    {selectedCrop.soil_preferences}
                  </p>
                </div>

                {/* Planting Guidance & Spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="font-bold text-stone-900 block">Planting Guidance</span>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      {selectedCrop.planting_guidance}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="font-bold text-stone-900 block">Spacing & Plant Density</span>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      {selectedCrop.spacing}
                    </p>
                  </div>
                </div>

                {/* Nutrient Demands & KALRO Formulation */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-800" />
                    <span>KALRO Nutrient Requirements</span>
                  </span>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="px-2.5 py-1 rounded bg-white text-stone-800 border border-emerald-300">
                      N: {selectedCrop.nutrient_requirements.n.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white text-stone-800 border border-emerald-300">
                      P: {selectedCrop.nutrient_requirements.p.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white text-stone-800 border border-emerald-300">
                      K: {selectedCrop.nutrient_requirements.k.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-900/90 leading-relaxed">
                    {selectedCrop.nutrient_requirements.description}
                  </p>
                </div>

                {/* Common Soil Deficiencies & Risks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-2">
                    <span className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Common Soil Deficiencies</span>
                    </span>
                    <ul className="space-y-1 list-disc pl-4 text-amber-900/90 text-[11px] leading-relaxed">
                      {selectedCrop.common_deficiencies.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 space-y-2">
                    <span className="font-bold flex items-center gap-1.5 text-stone-900">
                      <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Harvest & Yield Information</span>
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {selectedCrop.harvest_info}
                    </p>
                  </div>
                </div>

                {/* Kenyan Agro-ecological Notes */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 text-xs space-y-1">
                  <span className="font-bold text-stone-900 block">Kenyan Growing Notes & Zones</span>
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    {selectedCrop.kenya_notes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400 text-sm">
                Select a crop to view detailed agronomic recommendations.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
