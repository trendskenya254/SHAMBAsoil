import React, { useState } from 'react';
import {
  BookOpen,
  MapPin,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LearnView: React.FC = () => {
  const { language, t } = useAuth();
  const [activeTab, setActiveTab] = useState<'soils' | 'fertilizers' | 'sampling' | 'myths'>('soils');
  const [expandedSection, setExpandedSection] = useState<string | null>('region1');

  const toggleSection = (id: string) => {
    setExpandedSection(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
          {t.navLearn}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          {language === 'sw'
            ? 'Elimu ya kisayansi ya udongo wa Kenya, mbolea, na jinsi ya kupima maabara'
            : 'Scientific Kenyan soil agro-ecological zones, fertilizer guides, and laboratory sampling'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
        {[
          { id: 'soils', label: language === 'sw' ? 'Kanda za Udongo wa Kenya' : 'Kenyan Soil Zones' },
          { id: 'fertilizers', label: language === 'sw' ? 'Mwongozo wa Mbolea' : 'Fertilizer Guide' },
          { id: 'sampling', label: language === 'sw' ? 'Jinsi ya Kupima Maabara' : 'Lab Sampling Guide' },
          { id: 'myths', label: language === 'sw' ? 'Mambo Yasiyo ya Kweli' : 'Soil Myths Debunked' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: KENYAN SOIL ZONES ================= */}
      {activeTab === 'soils' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-950">
            Kenya possesses five primary agro-ecological soil classifications mapped by KALRO and the Kenya Soil Survey. Each requires tailored fertilizer and tillage management.
          </div>

          {[
            {
              id: 'region1',
              title: '1. Central Highlands & Mt. Kenya (Nitisols / Red Volcanic Loam)',
              counties: 'Kiambu, Murang\'a, Nyeri, Kirinyaga, Embu, Meru',
              characteristics: 'Deep, dark red to reddish brown clay-loam. Naturally porous with high water retention.',
              management: 'Highly susceptible to soil acidification from continuous DAP use. Requires agricultural lime (chokaa) every 2-3 years. Phosphorus becomes chemically fixed (locked) if pH drops below 5.5.'
            },
            {
              id: 'region2',
              title: '2. Rift Valley Escarpment & Plains (Andosols / Volcanic Ash / Luvisols)',
              counties: 'Nakuru, Uasin Gishu, Trans Nzoia, Bomet, Kericho, Narok',
              characteristics: 'Light, friable, loose crumbly volcanic ash soils. High fertility potential but prone to wind and water erosion.',
              management: 'Susceptible to subsoil hardpan compaction from heavy tractors. Practice minimum tillage, retain maize stover mulch, and apply organic compost.'
            },
            {
              id: 'region3',
              title: '3. Lake Victoria Basin & Lowlands (Vertisols / Black Cotton Soils & Planosols)',
              counties: 'Kisumu, Siaya, Homa Bay, Migori, Busia',
              characteristics: 'Heavy montmorillonite clay soils. Highly sticky and unworkable when wet; forms deep cracks when dry.',
              management: 'Requires ridge-and-furrow planting to prevent root waterlogging during rains. High natural potassium and calcium, but low available nitrogen and phosphorus.'
            },
            {
              id: 'region4',
              title: '4. Eastern & Northern Semi-Arid Plains (Ferralsols & Arenosols)',
              counties: 'Machakos, Makueni, Kitui, Tharaka Nithi, Isiolo',
              characteristics: 'Coarse sandy loams, light red to yellow-brown. Low organic matter and low nutrient-holding capacity.',
              management: 'Moisture conservation is paramount. Use zai pits, tied ridges, heavy farmyard manure mulching, and drought-tolerant legumes (Cowpeas, Green Grams).'
            },
            {
              id: 'region5',
              title: '5. Coastal Strip (Arenosols & Cambisols)',
              counties: 'Kilifi, Kwale, Lamu, Mombasa, Taita Taveta',
              characteristics: 'Deep sandy soils along the coast; coral rag limestone in patches. Fast draining, low water retention.',
              management: 'Frequent small fertilizer splits rather than single heavy applications to prevent rapid leaching into groundwater.'
            }
          ].map(zone => (
            <div key={zone.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <button
                onClick={() => toggleSection(zone.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-50"
              >
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-stone-900">{zone.title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{zone.counties}</p>
                </div>
                {expandedSection === zone.id ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
              </button>
              {expandedSection === zone.id && (
                <div className="px-5 pb-5 pt-2 border-t border-stone-100 text-xs sm:text-sm text-stone-700 space-y-2 bg-stone-50/50">
                  <p><strong>Physical Characteristics: </strong>{zone.characteristics}</p>
                  <p><strong>Agronomic Management: </strong>{zone.management}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 2: KENYA FERTILIZER GUIDE ================= */}
      {activeTab === 'fertilizers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                BASAL PLANTING
              </span>
              <h3 className="font-bold text-base text-stone-900">DAP (18-46-0)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Di-Ammonium Phosphate supplies high starter phosphorus for rapid root development.
              </p>
              <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <strong>Precaution: </strong>Acidifies soil over repeat seasons. Do not use without lime if soil pH is below 5.2.
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                TOP DRESSING
              </span>
              <h3 className="font-bold text-base text-stone-900">CAN (26-0-0 + Calcium)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Calcium Ammonium Nitrate supplies quick-release vegetative nitrogen without acidifying the soil, while supplying vital calcium.
              </p>
              <div className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <strong>Best Timing: </strong>Apply when maize is knee-high (4-6 weeks after emergence) during moist soil conditions.
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                BALANCED PLANTING
              </span>
              <h3 className="font-bold text-base text-stone-900">NPK 17-17-17 / Mavuno</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Compound fertilizers providing equal ratios of Nitrogen, Phosphorus, and Potassium plus micronutrients (Zinc, Boron). Ideal for horticulture and potatoes.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                SOIL AMENDMENT
              </span>
              <h3 className="font-bold text-base text-stone-900">Agricultural Lime (Calcium Carbonate)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Neutralizes toxic Aluminum and Hydrogen ions in acidic soils, unlocking stored phosphorus.
              </p>
              <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                Apply broadcast 500kg - 1 tonne per acre 1 month before rains.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LAB SAMPLING GUIDE ================= */}
      {activeTab === 'sampling' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-lg font-display text-stone-900">
              How to Take a Proper Laboratory Soil Sample
            </h3>
            <p className="text-xs text-stone-500">
              Laboratory accuracy depends entirely on how representative your field soil sample is.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <strong className="text-stone-900 block text-sm">Step 1: The Zig-Zag Field Traversal</strong>
              <p>Walk across your farm parcel in a W or zigzag pattern, taking 10 to 15 sub-samples from different representative spots.</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <strong className="text-stone-900 block text-sm">Step 2: Correct Depth (0 - 20 cm)</strong>
              <p>Scrape off surface leaves and weeds. Dig a V-shaped hole 20 cm deep (plow layer depth). Cut a 2 cm slice from the vertical side of the hole.</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <strong className="text-stone-900 block text-sm">Step 3: Mix Thoroughly (Composite Sample)</strong>
              <p>Place all 15 sub-samples into a clean plastic bucket (never use a chemical bucket). Mix thoroughly with a clean stick.</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <strong className="text-stone-900 block text-sm">Step 4: Package 500g for Lab</strong>
              <p>Air-dry the mixed soil in the shade on clean paper. Scoop approximately 500g into a clean, clearly labeled ziplock bag and submit to KALRO NARL, Cropnuts, or an accredited lab.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: MYTHS DEBUNKED ================= */}
      {activeTab === 'myths' && (
        <div className="space-y-4">
          {[
            {
              myth: '"DAP poisons or kills the shamba permanently."',
              fact: 'DAP does not poison the soil. However, because it contains Ammonium (NH4+), continuous use without replenishing organic manure or adding agricultural lime gradually decreases soil pH (acidification). Unchecked acidity then locks up phosphorus. The remedy is liming and manure, not abandoning balanced plant nutrition.'
            },
            {
              myth: '"You can accurately measure soil chemical pH and Nitrogen from a smartphone photo."',
              fact: 'False. A smartphone camera only captures visible light reflections. Soluble plant nutrients (NO3-, H2PO4-, K+) are dissolved invisible chemical ions that require laboratory reagent reactions or electrochemical sensors. ShambaSoil is transparent about this boundary.'
            },
            {
              myth: '"Fertilizer can be applied directly on seeds at planting."',
              fact: 'False. Inorganic fertilizers have a high salt index. If fertilizer pellets touch germinating seeds, they draw water out of the seedling (osmotic burn), killing the embryo. Always place fertilizer 5 cm to the side and 5 cm below the seed.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-red-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>MYTH: {item.myth}</span>
              </div>
              <div className="pl-6 text-stone-700 leading-relaxed">
                <strong className="text-emerald-900">THE SCIENCE: </strong>
                {item.fact}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
