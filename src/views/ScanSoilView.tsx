import React, { useState, useEffect } from 'react';
import {
  Camera,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Farm, FarmerObservations, SoilAnalysis } from '../types.js';
import { CameraCapture } from '../components/CameraCapture.js';

interface ScanSoilViewProps {
  initialFarmId?: string;
  onAnalysisCompleted: (analysisId: string) => void;
  onCancel: () => void;
  onNavigateToFarms: () => void;
}

export const ScanSoilView: React.FC<ScanSoilViewProps> = ({
  initialFarmId,
  onAnalysisCompleted,
  onCancel,
  onNavigateToFarms
}) => {
  const { profile, language, t } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(initialFarmId || '');

  // Wizard Steps:
  // 1 = Guide & Prep
  // 2 = Photo Capture
  // 3 = Observations Questionnaire
  // 4 = Processing AI Pipeline
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Photos captured
  const [photos, setPhotos] = useState<{ dataUrl: string; position_type: string }[]>([]);

  // Observations State
  const [observations, setObservations] = useState<FarmerObservations>({
    soil_feel: 'loamy',
    soil_color: 'dark_brown',
    drainage: 'moderate',
    water_source: 'rain_fed',
    current_crop: '',
    intended_crop: 'Maize (Mahindi)',
    recent_fertilizer: {
      product: '',
      amount: '',
      application_date: ''
    },
    photo_representation: 'same_location'
  });

  // Processing state
  const [processingStage, setProcessingStage] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getFarms().then(list => {
      setFarms(list);
      if (!selectedFarmId && list.length > 0) {
        setSelectedFarmId(list[0].id);
        if (list[0].current_crop) {
          setObservations(prev => ({ ...prev, current_crop: list[0].current_crop || '' }));
        }
      }
    });
  }, []);

  const handlePhotosCaptured = (captured: { dataUrl: string; position_type: string }[]) => {
    setPhotos(captured);
    setCurrentStep(3); // Proceed to questionnaire
  };

  const handleStartAnalysis = async () => {
    if (!selectedFarmId) {
      setErrorMessage('Please choose which farm this soil sample comes from.');
      return;
    }
    if (photos.length === 0) {
      setErrorMessage('Please capture or upload at least one soil photograph.');
      return;
    }

    setErrorMessage(null);
    setCurrentStep(4); // Processing view

    // Simulate animated step indicators for transparency
    const stageTimer1 = setTimeout(() => setProcessingStage(2), 1200);
    const stageTimer2 = setTimeout(() => setProcessingStage(3), 2800);
    const stageTimer3 = setTimeout(() => setProcessingStage(4), 4400);

    try {
      const completed = await api.createSoilAnalysis({
        farm_id: selectedFarmId,
        observations,
        images: photos
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      setProcessingStage(5);
      setTimeout(() => {
        onAnalysisCompleted(completed.id);
      }, 900);
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setCurrentStep(3);
      setErrorMessage(err.message || 'Analysis could not be completed. Please try again with clear lighting.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {language === 'sw' ? 'Mchakato wa Upimaji' : 'Soil Assessment'}
            </span>
            <span className="text-xs text-stone-500">
              {language === 'sw' ? `Hatua ya ${currentStep} kati ya 4` : `Step ${currentStep} of 4`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900 mt-1">
            {t.scanTitle}
          </h1>
        </div>
        {currentStep < 4 && (
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100"
          >
            {t.cancel}
          </button>
        )}
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-between gap-2 px-1">
        {[1, 2, 3, 4].map(st => (
          <div
            key={st}
            className={`h-1.5 rounded-full flex-1 transition-colors ${
              currentStep >= st ? 'bg-emerald-700' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* ==================== STEP 1: PREPARATION & FARM SELECTION ==================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          {/* Farm selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              {language === 'sw' ? 'Chagua Shamba Linalopimwa' : 'Select Farm to Assess'} *
            </label>
            {farms.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-stone-800 text-xs sm:text-sm space-y-3">
                <p>
                  {language === 'sw'
                    ? 'Hujasajili shamba bado. Lazima uwe na shamba lililosajiliwa ili kuunganisha matokeo ya udongo.'
                    : 'You have not registered any farms yet. Please register a farm first to attach your soil assessment.'}
                </p>
                <button
                  id="scan-create-farm-cta"
                  onClick={onNavigateToFarms}
                  className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Sajili Shamba Sasa' : 'Register Farm First'}</span>
                </button>
              </div>
            ) : (
              <select
                id="scan-farm-select"
                value={selectedFarmId}
                onChange={e => setSelectedFarmId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.area} {f.area_unit} - {f.county}, {f.sub_county})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Photography Guidelines */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-stone-900 font-display flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>{language === 'sw' ? 'Miongozo ya Picha Nzuri ya Udongo' : 'How to Take a Useful Soil Photo'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="font-bold text-stone-900 text-sm">1. Natural Light</span>
                <p>{t.prepTip2}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="font-bold text-stone-900 text-sm">2. Clear Surface</span>
                <p>{t.prepTip1}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="font-bold text-stone-900 text-sm">3. 20-30 cm Distance</span>
                <p>{t.prepTip3}</p>
              </div>
            </div>
          </div>

          {/* Safety reminder */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">{t.safetyDisclaimerTitle}: </span>
              <span>{t.safetyDisclaimerText}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="scan-step1-next-btn"
              disabled={!selectedFarmId || farms.length === 0}
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>{language === 'sw' ? 'Endelea Kwenye Kamera' : 'Proceed to Camera'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 2: CAMERA CAPTURE ==================== */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <CameraCapture
            maxPhotos={3}
            onPhotosCaptured={handlePhotosCaptured}
            onCancel={() => setCurrentStep(1)}
          />
        </div>
      )}

      {/* ==================== STEP 3: OBSERVATIONS QUESTIONNAIRE ==================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-lg text-stone-900 font-display">
                {t.scanStep3}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'sw'
                  ? 'Taarifa hizi husaidia mfumo kuelewa muktadha wa shamba lako.'
                  : 'Your field experience anchors the visual analysis to reality.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">
                {photos.length} {language === 'sw' ? 'picha' : 'photo(s)'}
              </span>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                {language === 'sw' ? 'Badilisha Picha' : 'Change Photos'}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Soil Feel / Texture */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                {t.soilFeelQuestion} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'loamy', label: language === 'sw' ? 'Tifutifu (Loam)' : 'Loamy (Balanced)' },
                  { id: 'clay', label: language === 'sw' ? 'Mfinyanzi (Sticky)' : 'Clay (Heavy/Sticky)' },
                  { id: 'sandy', label: language === 'sw' ? 'Mchanga (Gritty)' : 'Sandy (Loose/Coarse)' },
                  { id: 'rocky', label: language === 'sw' ? 'Mawe Mawe' : 'Stony / Gravelly' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    id={`feel-${item.id}`}
                    onClick={() => setObservations(prev => ({ ...prev, soil_feel: item.id as any }))}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      observations.soil_feel === item.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/30'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Soil Color */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                {t.soilColorQuestion} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'red', label: language === 'sw' ? 'Mwekundu (Red)' : 'Red / Terracotta', color: '#b91c1c' },
                  { id: 'dark_brown', label: language === 'sw' ? 'Kahawia Nzito' : 'Dark Brown', color: '#451a03' },
                  { id: 'black', label: language === 'sw' ? 'Mweusi (Black)' : 'Black Cotton / Dark', color: '#18181b' },
                  { id: 'pale', label: language === 'sw' ? 'Mweupe / Kijivu' : 'Pale / Light Grey', color: '#a8a29e' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    id={`color-${item.id}`}
                    onClick={() => setObservations(prev => ({ ...prev, soil_color: item.id as any }))}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center gap-2.5 transition-all ${
                      observations.soil_color === item.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/30'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drainage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                {t.drainageQuestion} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'moderate', label: language === 'sw' ? 'Wastani (Nzuri)' : 'Moderate (Drains well)' },
                  { id: 'drains_quickly', label: language === 'sw' ? 'Hukauka Haraka' : 'Drains very fast (Dries out)' },
                  { id: 'holds_water', label: language === 'sw' ? 'Husimama Maji (Hutuama)' : 'Holds water / Waterlogs' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    id={`drain-${item.id}`}
                    onClick={() => setObservations(prev => ({ ...prev, drainage: item.id as any }))}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      observations.drainage === item.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/30'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intended Crop */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {t.intendedCropLabel} *
              </label>
              <select
                id="obs-intended-crop"
                value={observations.intended_crop}
                onChange={e => setObservations(prev => ({ ...prev, intended_crop: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Maize (Mahindi)">Maize (Mahindi)</option>
                <option value="Common Beans (Maharage)">Common Beans (Maharage)</option>
                <option value="Tomatoes (Nyanya)">Tomatoes (Nyanya)</option>
                <option value="Sukuma Wiki (Collard Greens)">Sukuma Wiki</option>
                <option value="Irish Potatoes (Viazi)">Irish Potatoes (Viazi)</option>
                <option value="Bulb Onions (Kitunguu)">Bulb Onions</option>
                <option value="Hass Avocado">Hass Avocado</option>
                <option value="Sorghum (Mtama)">Sorghum (Mtama)</option>
                <option value="Green Grams (Ndengu)">Green Grams (Ndengu)</option>
                <option value="Other / Mixed Farming">Other / Mixed Farming</option>
              </select>
            </div>

            {/* Recent Fertilizer / Manure */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {t.fertilizerQuestion}
              </label>
              <input
                id="obs-fertilizer"
                type="text"
                value={observations.recent_fertilizer?.product || ''}
                onChange={e => setObservations(prev => ({
                  ...prev,
                  recent_fertilizer: {
                    ...prev.recent_fertilizer,
                    applied: !!e.target.value,
                    product: e.target.value
                  }
                }))}
                placeholder={language === 'sw' ? 'mfano Samadi ya ng\'ombe, DAP mfuko 1, au hakuna' : 'e.g. Farmyard manure, DAP 50kg, or none'}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.previous}</span>
            </button>

            <button
              id="scan-start-analysis-btn"
              onClick={handleStartAnalysis}
              className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{language === 'sw' ? 'Anza Uchunguzi wa Udongo' : 'Analyze Soil Sample'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== STEP 4: PROCESSING STATE ==================== */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center ring-8 ring-emerald-50/50">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-700" />
          </div>

          <div>
            <h3 className="text-2xl font-bold font-display text-stone-900">
              {t.analyzingSoil}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              {t.analyzingSubtitle}
            </p>
          </div>

          {/* Progress sequence */}
          <div className="max-w-md mx-auto space-y-2.5 text-left text-xs sm:text-sm">
            {[
              { id: 1, label: language === 'sw' ? 'Inakagua uwazi wa picha na mwangaza wa shamba...' : 'Validating photograph resolution and field lighting...' },
              { id: 2, label: language === 'sw' ? 'Inaunganisha hali ya hewa ya kaunti yako...' : `Preparing agro-ecological context for ${profile?.county || 'Kenya'}...` },
              { id: 3, label: language === 'sw' ? 'Inachunguza viashiria vya muundo wa udongo...' : 'Assessing physical color, crumb aggregation, and texture indicators...' },
              { id: 4, label: language === 'sw' ? 'Inakagua miongozo ya usalama na utafiti wa KALRO...' : 'Verifying safety thresholds and KALRO agronomy recommendations...' },
              { id: 5, label: language === 'sw' ? 'Inakamilisha ripoti ya shamba...' : 'Finalizing structured soil intelligence assessment...' }
            ].map(stage => {
              const isDone = processingStage > stage.id;
              const isCurrent = processingStage === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                      : isCurrent
                      ? 'bg-stone-50 border-stone-300 text-stone-900 font-bold'
                      : 'bg-white border-stone-100 text-stone-400 opacity-60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-700 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-stone-300 flex-shrink-0" />
                  )}
                  <span className="text-xs">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
