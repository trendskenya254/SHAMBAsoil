import React, { useState } from 'react';
import { Sparkles, Layers, Camera, ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onStartFirstScan: (farmId: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onStartFirstScan
}) => {
  const { profile, language, t } = useAuth();
  const [step, setStep] = useState(1);
  const [farmName, setFarmName] = useState('');
  const [farmArea, setFarmArea] = useState('2');
  const [areaUnit, setAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [currentCrop, setCurrentCrop] = useState('Maize (Mahindi)');
  const [createdFarmId, setCreatedFarmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateFarm = async () => {
    if (!farmName) return;
    setIsSubmitting(true);
    try {
      const newFarm = await api.createFarm({
        name: farmName,
        county: profile?.county || 'Nakuru',
        sub_county: profile?.sub_county || 'Njoro',
        ward: profile?.ward || '',
        area: Number(farmArea),
        area_unit: areaUnit,
        current_crop: currentCrop,
        irrigation_status: 'rain_fed'
      });
      setCreatedFarmId(newFarm.id);
      setStep(4);
    } catch (e: any) {
      alert('Could not create initial farm: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Progress Bar */}
        <div className="h-2 bg-stone-100 w-full">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-2xl shadow-inner">
                🌱
              </div>
              <h3 className="text-2xl font-bold font-display text-stone-900">
                {language === 'sw' ? 'Karibu ShambaSoil!' : 'Welcome to ShambaSoil!'}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {language === 'sw'
                  ? 'Jukwaa la kidijitali la kuelewa afya ya udongo, kuchagua mazao yanayofaa, na kupata mwongozo sahihi wa kilimo shambani mwako.'
                  : 'Your soil intelligence companion designed for Kenyan farms. Understand soil conditions, prevent nutrient loss, and choose the right crops before planting.'}
              </p>
              <div className="pt-4">
                <button
                  id="onboarding-step1-next"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>{language === 'sw' ? 'Endelea' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation of Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-display text-stone-900">
                    {language === 'sw' ? 'Eneo Lako la Kilimo' : 'Your Farming Region'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {language === 'sw' ? 'Tumethibitisha kaunti yako kutoa miongozo sahihi.' : 'Verified to tailor agro-ecological advice to your climate.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">{t.county}:</span>
                  <span className="font-bold text-stone-900">{profile?.county || 'Kenya'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t.subCounty}:</span>
                  <span className="font-bold text-stone-900">{profile?.sub_county || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{language === 'sw' ? 'Mkulima' : 'Farmer'}:</span>
                  <span className="font-bold text-stone-900">{profile?.full_name}</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'sw'
                  ? 'Miongozo yote ya rutuba, chokaa ya kilimo, na mimea inalingana na utafiti wa udongo wa KALRO katika kaunti yako.'
                  : 'All nutrient recommendations and acidity warnings are automatically calibrated to soil surveys of your county.'}
              </p>

              <button
                id="onboarding-step2-next"
                onClick={() => setStep(3)}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{language === 'sw' ? 'Sajili Shamba Lako la Kwanza' : 'Add Your First Farm'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 3: Add First Farm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-display text-stone-900">
                    {language === 'sw' ? 'Sajili Shamba Lako' : 'Register Your Farm'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {language === 'sw' ? 'Jina na ukubwa wa shamba lako.' : 'Name and size of your agricultural parcel.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'sw' ? 'Jina la Shamba' : 'Farm Name'} *
                  </label>
                  <input
                    id="onboarding-farm-name"
                    type="text"
                    required
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    placeholder={language === 'sw' ? 'mfano Shamba Kuu, Shamba la Mahindi' : 'e.g. Home Plot, Main Shamba'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'sw' ? 'Ukubwa' : 'Size'}
                    </label>
                    <input
                      id="onboarding-farm-area"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={farmArea}
                      onChange={e => setFarmArea(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'sw' ? 'Kipimo' : 'Unit'}
                    </label>
                    <select
                      id="onboarding-farm-unit"
                      value={areaUnit}
                      onChange={e => setAreaUnit(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="acres">{language === 'sw' ? 'Ekari (Acres)' : 'Acres'}</option>
                      <option value="hectares">{language === 'sw' ? 'Hekta (Hectares)' : 'Hectares'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'sw' ? 'Zao Lililopo / Linalolengwa' : 'Current or Target Crop'}
                  </label>
                  <select
                    id="onboarding-crop"
                    value={currentCrop}
                    onChange={e => setCurrentCrop(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Maize (Mahindi)">Maize (Mahindi)</option>
                    <option value="Common Beans (Maharage)">Common Beans (Maharage)</option>
                    <option value="Tomatoes (Nyanya)">Tomatoes (Nyanya)</option>
                    <option value="Sukuma Wiki (Collard Greens)">Sukuma Wiki</option>
                    <option value="Irish Potatoes (Viazi)">Irish Potatoes (Viazi)</option>
                    <option value="Bulb Onions (Kitunguu)">Bulb Onions</option>
                    <option value="Hass Avocado">Hass Avocado</option>
                    <option value="Green Grams (Ndengu)">Green Grams (Ndengu)</option>
                  </select>
                </div>
              </div>

              <button
                id="onboarding-save-farm-btn"
                disabled={!farmName.trim() || isSubmitting}
                onClick={handleCreateFarm}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? t.loading : (language === 'sw' ? 'Hifadhi Shamba' : 'Save Farm & Proceed')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 4: First Soil Scan Prompt */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold font-display text-stone-900">
                {language === 'sw' ? 'Shamba Limesajiliwa!' : 'Farm Registered!'}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {language === 'sw'
                  ? 'Je, uko tayari kupiga picha ya kwanza ya udongo wa shamba lako sasa?'
                  : 'Would you like to take your first soil photograph now to establish your soil baseline?'}
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  id="onboarding-start-scan-now"
                  onClick={() => {
                    if (createdFarmId) onStartFirstScan(createdFarmId);
                    onComplete();
                  }}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>{language === 'sw' ? 'Piga Picha ya Udongo Sasa' : 'Take Soil Photo Now'}</span>
                </button>

                <button
                  id="onboarding-skip-scan"
                  onClick={onComplete}
                  className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors text-sm"
                >
                  {language === 'sw' ? 'Nitafanya Baadaye (Nenda Dashibodi)' : "I'll do this later (Go to Dashboard)"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
