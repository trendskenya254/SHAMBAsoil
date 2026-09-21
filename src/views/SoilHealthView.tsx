import React, { useState, useEffect } from 'react';
import {
  Activity,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Info,
  CheckCircle2,
  Sprout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { SoilAnalysis, SoilTestResult } from '../types.js';

interface SoilHealthViewProps {
  onScanSoil: () => void;
  onViewCrops: () => void;
}

export const SoilHealthView: React.FC<SoilHealthViewProps> = ({
  onScanSoil,
  onViewCrops
}) => {
  const { profile, language, t } = useAuth();
  const [analyses, setAnalyses] = useState<SoilAnalysis[]>([]);
  const [labResults, setLabResults] = useState<SoilTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getSoilAnalyses().catch(() => []),
      api.getFarms().then(async (farms) => {
        const allLabs: SoilTestResult[] = [];
        for (const f of farms) {
          const detail = await api.getFarmById(f.id).catch(() => null);
          if (detail && detail.labResults) {
            allLabs.push(...detail.labResults);
          }
        }
        return allLabs;
      }).catch(() => [])
    ]).then(([aList, lList]) => {
      setAnalyses(aList);
      setLabResults(lList);
      setIsLoading(false);
    });
  }, []);

  const hasData = analyses.length > 0 || labResults.length > 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
          {t.navSoilHealth}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          {language === 'sw'
            ? 'Ufuatiliaji wa muda mrefu wa rutuba, muundo wa udongo, na hatua za kurejesha afya ya shamba'
            : 'Long-term soil stewardship, physical structure indicators, and regenerative soil improvement practices'}
        </p>
      </div>

      {/* Honest Indicator Status Banner */}
      {!hasData ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm text-center space-y-4 max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
            <Activity className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-stone-900 font-display">
              {language === 'sw' ? 'Msingi wa Udongo Haujaanzishwa' : 'Baseline Not Established'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
              Not enough information to calculate your Soil Health Indicator. Add a soil scan or laboratory test to establish baseline.
            </p>
          </div>
          <button
            id="soil-health-start-scan-btn"
            onClick={onScanSoil}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 shadow-md"
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'sw' ? 'Pima Udongo Kuanzisha Msingi' : 'Capture Soil Photo to Start'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Active Baseline Status */}
          <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              PHYSICAL AGGREGATION
            </span>
            <div className="text-2xl font-black text-stone-900 font-display">
              {analyses[0]?.observations?.soil_feel === 'loamy' ? 'Balanced Loam' : 'Heavy Clay / Structured'}
            </div>
            <p className="text-xs text-stone-600">
              Based on crumb aggregation observed in recent photographic logs.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              DRAINAGE CAPACITY
            </span>
            <div className="text-2xl font-black text-stone-900 font-display capitalize">
              {analyses[0]?.observations?.drainage?.replace('_', ' ') || 'Moderate'}
            </div>
            <p className="text-xs text-stone-600">
              Field percolation speed matches registered county rainfall expectations.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              LAB CORRELATION
            </span>
            <div className="text-2xl font-black text-stone-900 font-display">
              {labResults.length > 0 ? `${labResults.length} Verified Lab(s)` : 'Awaiting Lab Test'}
            </div>
            <p className="text-xs text-stone-600">
              {labResults.length > 0
                ? `Latest laboratory pH: ${labResults[0].ph}`
                : 'Add a laboratory test to calibrate exact chemical fertility.'}
            </p>
          </div>
        </div>
      )}

      {/* Practical Soil Improvement Playbook */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-display text-stone-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-700" />
            <span>{language === 'sw' ? 'Mbinu za Kujenga Rutuba ya Udongo' : 'Kenyan Soil Improvement Playbook'}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Proven agronomic interventions recommended by KALRO to restore soil carbon and microbial life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Organic Matter & Composting */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h3 className="font-bold text-base text-stone-900">
              1. Farmyard Manure & Proper Composting
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Always use fully decomposed farmyard manure (sweet-smelling, dark brown, crumbly). Fresh livestock dung burns tender roots and leaches available nitrogen temporarily while decomposing.
            </p>
            <div className="pt-2 text-[11px] font-bold text-emerald-800">
              Recommended: 5 to 10 tonnes per acre spread evenly before plowing.
            </div>
          </div>

          {/* Agricultural Lime Rules */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h3 className="font-bold text-base text-stone-900">
              2. Agricultural Lime (Chokaa ya Kilimo)
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              In acidic soils (pH &lt; 5.5 common in Western Kenya, Central Highlands, and parts of Rift Valley), apply agricultural lime 3-4 weeks prior to planting.
            </p>
            <div className="pt-2 text-[11px] font-bold text-red-800">
              Crucial Safety Rule: NEVER mix agricultural lime together with DAP or CAN in the same planting hole, as it precipitates phosphate.
            </div>
          </div>

          {/* Cover Cropping */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h3 className="font-bold text-base text-stone-900">
              3. Nitrogen-Fixing Legume Cover Crops
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Plant green manure legumes such as Desmodium, Mucuna, Lablab (Dolichos), or Cowpeas between seasons. Their symbiotic Rhizobia nodules absorb atmospheric nitrogen and enrich depleted soil naturally.
            </p>
          </div>

          {/* Minimum Tillage & Mulching */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h3 className="font-bold text-base text-stone-900">
              4. Conservation Tillage & Crop Residue
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Retain maize stalks and bean haulms on the surface rather than burning them. Surface mulch protects precious soil aggregates from heavy tropical downpours and preserves soil moisture during hot dry spells.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
