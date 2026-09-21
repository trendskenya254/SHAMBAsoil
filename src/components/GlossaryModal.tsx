import React from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const { language } = useAuth();
  if (!isOpen) return null;

  const terms = [
    {
      term: 'Soil pH',
      swTerm: 'Kiwango cha Asidi (pH)',
      definition: 'A scale from 1 to 14 measuring how acidic or alkaline the soil is. Most Kenyan crops (maize, beans, potatoes) thrive best between 5.8 and 6.8. A pH below 5.5 locks phosphorus and causes aluminium toxicity, requiring agricultural lime.',
      kalroNote: 'Common in Western, Rift Valley, and Central Highlands red soils.'
    },
    {
      term: 'Available Phosphorus (P)',
      swTerm: 'Fosforasi (P)',
      definition: 'Vital mineral for vigorous early root formation, seed germination, and flowering. In acidic red soils, phosphorus binds tightly with iron and aluminium, making it insoluble to plant roots unless lime is added.',
      kalroNote: 'Deficiency shows as purple discoloration on lower maize leaves.'
    },
    {
      term: 'Total Nitrogen (N)',
      swTerm: 'Naitrojeni (N)',
      definition: 'Essential for vegetative leafy growth and green chlorophyll synthesis. Nitrogen moves readily in water and can leach quickly through sandy soils during heavy rains.',
      kalroNote: 'Deficiency appears as V-shaped yellowing starting from the tip of older leaves.'
    },
    {
      term: 'Potassium (K)',
      swTerm: 'Potasiamu (K)',
      definition: 'Regulates water balance, disease resistance, and fruit filling/tuber sizing in crops like tomatoes, potatoes, and bananas.',
      kalroNote: 'Deficiency causes scorched or burnt leaf margins.'
    },
    {
      term: 'Soil Organic Carbon (SOC)',
      swTerm: 'Kaboni ya Udongo (Mbolea ya Asili)',
      definition: 'The organic matter fraction of decomposed plant residues and manure. Improves moisture holding capacity, soil aeration, and cation exchange capacity.',
      kalroNote: 'Highland soils benefit greatly from minimum 2-3% organic carbon.'
    },
    {
      term: 'Electrical Conductivity (EC)',
      swTerm: 'Uwezo wa Umeme (EC / Chumvi)',
      definition: 'Measures dissolved mineral salts in soil solution. Elevated EC indicates soil salinity, which prevents roots from taking up water even in damp soils.',
      kalroNote: 'Can build up in greenhouse horticulture and arid irrigated farms.'
    },
    {
      term: 'Agricultural Lime (Chokaa ya Kilimo)',
      swTerm: 'Chokaa ya Kilimo',
      definition: 'Crushed calcium/magnesium carbonate rock used to neutralize soil acidity, raise pH, deactivate toxic aluminium, and restore phosphorus availability.',
      kalroNote: 'Apply 2-4 weeks before planting and incorporate into topsoil.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-lg text-stone-900 font-display">
              {language === 'sw' ? 'Kamusi ya Kilimo na Udongo' : 'Agricultural Soil Glossary'}
            </h3>
          </div>
          <button
            id="glossary-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto divide-y divide-stone-100 space-y-4">
          <p className="text-xs sm:text-sm text-stone-500 mb-4 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-emerald-900">
            {language === 'sw'
              ? 'Masharti haya ya kisayansi yamethibitishwa kulingana na miongozo ya utafiti wa udongo ya KALRO na FAO.'
              : 'These scientific terms are aligned with KALRO and FAO East Africa agronomy definitions.'}
          </p>
          {terms.map((item, idx) => (
            <div key={idx} className="pt-4 first:pt-0">
              <div className="flex items-baseline justify-between mb-1">
                <h4 className="font-bold text-stone-900 text-base">
                  {language === 'sw' ? item.swTerm : item.term}
                </h4>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {item.term}
                </span>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-2">{item.definition}</p>
              <p className="text-xs text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
                <span className="font-semibold text-stone-700">Kenya Context: </span>
                {item.kalroNote}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            id="glossary-done-btn"
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors"
          >
            {language === 'sw' ? 'Funga' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
