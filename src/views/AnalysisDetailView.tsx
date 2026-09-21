import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Download,
  Share2,
  FileText,
  Clock,
  Sparkles,
  Info,
  Layers,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { SoilAnalysis, Farm, SoilTestResult } from '../types.js';

interface AnalysisDetailViewProps {
  analysisId: string;
  onBack: () => void;
  onRequestExpertReview: (analysisId: string, farmId: string) => void;
  onOpenReport: (analysisId: string) => void;
}

export const AnalysisDetailView: React.FC<AnalysisDetailViewProps> = ({
  analysisId,
  onBack,
  onRequestExpertReview,
  onOpenReport
}) => {
  const { language, t } = useAuth();
  const [analysis, setAnalysis] = useState<SoilAnalysis | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [labResults, setLabResults] = useState<SoilTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.getSoilAnalysisById(analysisId)
      .then(res => {
        setAnalysis(res.analysis);
        setFarm(res.farm);
        setLabResults(res.labResults || []);
      })
      .catch(err => {
        console.error('Error fetching analysis details:', err);
      })
      .finally(() => setIsLoading(false));
  }, [analysisId]);

  const handleFeedback = async (rating: 'useful' | 'partly' | 'not_useful') => {
    setFeedbackGiven(rating);
    try {
      await api.submitFeedback({
        analysis_id: analysisId,
        rating,
        comment: feedbackComment
      });
      setFeedbackSubmitted(true);
    } catch (e) {
      console.error('Failed submitting feedback:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-stone-500 text-sm">{t.loading}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 space-y-4 max-w-md mx-auto my-8">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h3 className="text-lg font-bold text-stone-900">Analysis Record Not Found</h3>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-semibold"
        >
          {t.back}
        </button>
      </div>
    );
  }

  const result = analysis.ai_result;
  const hasLab = labResults.length > 0;
  const latestLab = hasLab ? labResults[0] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Back & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="detail-request-review-btn"
            onClick={() => onRequestExpertReview(analysis.id, analysis.farm_id)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.askAgronomist}</span>
          </button>

          <button
            id="detail-print-report-btn"
            onClick={() => onOpenReport(analysis.id)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportReport}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Assessment Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                {farm?.name || analysis.farm_name} • {farm?.county}
              </span>
              <span className="text-[11px] text-stone-400">
                {new Date(analysis.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
              {language === 'sw' ? 'Matokeo ya Tathmini ya Udongo' : 'Soil Visual Assessment Report'}
            </h1>
          </div>

          {/* Assessment Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {result?.overall_assessment === 'soil_appears_promising' ? (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{language === 'sw' ? 'Udongo Una Matumaini Mzuri' : 'Soil Appears Promising'}</span>
              </span>
            ) : result?.overall_assessment === 'soil_suitable_with_management' ? (
              <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-amber-300">
                <Info className="w-4 h-4 text-amber-700" />
                <span>{language === 'sw' ? 'Inafaa kwa Uangalizi' : 'Suitable With Management'}</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-red-100 text-red-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-red-300">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                <span>{language === 'sw' ? 'Inahitaji Marekebisho' : 'Requires Attention'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Confidence Statement & Lab Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px] block mb-0.5">
              {t.confidenceScore}: {analysis.confidence.toUpperCase()}
            </span>
            <p className="text-stone-600 leading-relaxed">
              {result?.confidence_reason || 'Visual assessment calibrated against farmer inputs.'}
            </p>
          </div>

          <div className={`p-3 rounded-2xl border ${hasLab ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-amber-50/70 border-amber-200 text-amber-950'}`}>
            <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">
              {hasLab ? 'Verified Laboratory Integration' : 'Chemical Test Status'}
            </span>
            <p className="text-[11px] leading-relaxed">
              {hasLab
                ? `Backed by lab sample from ${latestLab?.laboratory_name} (pH ${latestLab?.ph ?? 'N/A'}).`
                : 'No laboratory results entered. Chemical metrics (pH, N-P-K) are not measured.'}
            </p>
          </div>
        </div>
      </div>

      {/* Captured Photographs Gallery */}
      {analysis.images && analysis.images.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
            {language === 'sw' ? 'Picha za Udongo Zilizopigwa' : 'Field Photographs Evaluated'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {analysis.images.map((img, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border border-stone-200 aspect-video group">
                <img
                  src={img.storage_path}
                  alt={`Soil Sample ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/75 text-white px-2 py-0.5 rounded-full capitalize">
                  {img.position_type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Observations & Observed Characteristics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Observations Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-stone-900 font-display">
              {t.visualObservations}
            </h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
            {result?.visual_observations?.map((obs, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span className="leading-relaxed">{obs}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Possible Concerns & Risks */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-stone-900 font-display">
              {t.possibleConcerns}
            </h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
            {result?.possible_risks?.map((risk, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">!</span>
                <span className="leading-relaxed">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Practical Soil Actions (Organized by Timing) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-stone-900 font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <span>{t.recommendedActions}</span>
        </h3>

        <div className="space-y-3">
          {result?.management_actions?.map((act, i) => {
            const isAvoid = act.timing === 'avoid';
            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1.5 ${
                  isAvoid
                    ? 'bg-red-50/50 border-red-200 text-red-950'
                    : 'bg-stone-50 border-stone-200 text-stone-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm sm:text-base">{act.action}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isAvoid ? 'bg-red-200 text-red-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {act.timing.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong className="text-stone-800">Why: </strong>{act.why}
                </p>
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong className="text-stone-900">How: </strong>{act.how}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fertility Guidance (Safety-First) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-stone-900 font-display flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>{t.fertilityGuidance}</span>
        </h3>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 space-y-2">
          {result?.fertility_guidance?.map((item, i) => (
            <p key={i} className="leading-relaxed">
              • {item}
            </p>
          ))}
        </div>

        {/* Explicit Explanation of Optical Camera Limits */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Info className="w-4 h-4 text-amber-700" />
            <span>Why your smartphone camera cannot measure chemical nutrients:</span>
          </div>
          <p className="leading-relaxed text-amber-900/90">
            Optical smartphone sensors capture reflected visible light. They cannot detect dissolved microscopic ions such as Hydrogen ions (pH), Phosphate (P), Nitrate (N), or soluble salts (Salinity). These require laboratory extraction reagents.
          </p>
        </div>
      </div>

      {/* Feedback Widget */}
      <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 text-center space-y-3">
        <h4 className="font-bold text-stone-900 text-sm">
          {t.feedbackPrompt}
        </h4>

        {feedbackSubmitted ? (
          <p className="text-xs text-emerald-800 font-bold">
            Asante sana! Your feedback helps calibrate agricultural intelligence for your county.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="fb-useful-btn"
              onClick={() => handleFeedback('useful')}
              className="px-4 py-2 bg-white hover:bg-emerald-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span>{language === 'sw' ? 'Ndiyo, Imenisaidia' : 'Yes, Very Useful'}</span>
            </button>
            <button
              id="fb-partly-btn"
              onClick={() => handleFeedback('partly')}
              className="px-4 py-2 bg-white hover:bg-amber-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 flex items-center gap-2"
            >
              <span>{language === 'sw' ? 'Kwa Kiasi Fulani' : 'Partly Useful'}</span>
            </button>
            <button
              id="fb-not-btn"
              onClick={() => handleFeedback('not_useful')}
              className="px-4 py-2 bg-white hover:bg-red-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 flex items-center gap-2"
            >
              <ThumbsDown className="w-4 h-4 text-red-600" />
              <span>{language === 'sw' ? 'Hapana' : 'Not Useful'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
