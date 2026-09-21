import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, ShieldCheck, Download } from 'lucide-react';
import { api } from '../services/api.js';
import { SoilAnalysis, Farm, SoilTestResult } from '../types.js';

interface PrintReportViewProps {
  analysisId: string;
  onBack: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ analysisId, onBack }) => {
  const [analysis, setAnalysis] = useState<SoilAnalysis | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [labResults, setLabResults] = useState<SoilTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getSoilAnalysisById(analysisId)
      .then(res => {
        setAnalysis(res.analysis);
        setFarm(res.farm);
        setLabResults(res.labResults || []);
      })
      .finally(() => setIsLoading(false));
  }, [analysisId]);

  if (isLoading || !analysis) {
    return <div className="p-12 text-center text-sm text-stone-500">Generating report...</div>;
  }

  const result = analysis.ai_result;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Non-print controls */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Paper Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-md print:border-0 print:shadow-none print:p-0 space-y-8 text-stone-900">
        {/* Letterhead Header */}
        <div className="border-b-2 border-emerald-900 pb-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-black font-display tracking-tight text-stone-950">
              Shamba<span className="text-emerald-700">Soil</span> Kenya
            </span>
            <p className="text-xs text-stone-500 mt-0.5">
              Agricultural Soil Intelligence & Farmer Decision Support
            </p>
          </div>
          <div className="text-right text-xs text-stone-600">
            <span className="font-bold text-stone-900">Report ID:</span> #{analysis.id.substring(0, 8).toUpperCase()}
            <br />
            <span className="font-bold text-stone-900">Date:</span> {new Date(analysis.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Farmer & Farm Overview */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div>
            <span className="text-stone-500 font-bold block">FARM PARCEL:</span>
            <span className="font-bold text-sm text-stone-900">{farm?.name || analysis.farm_name}</span>
            <p className="text-stone-600">{farm?.ward ? `${farm.ward}, ` : ''}{farm?.sub_county}, {farm?.county} County</p>
          </div>
          <div>
            <span className="text-stone-500 font-bold block">TARGET CROP:</span>
            <span className="font-bold text-sm text-stone-900">{analysis.observations?.intended_crop || 'General Crop'}</span>
            <p className="text-stone-600">Texture: {analysis.observations?.soil_feel} | Drainage: {analysis.observations?.drainage}</p>
          </div>
        </div>

        {/* Assessment Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
            Visual Soil Assessment Summary
          </h3>
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-emerald-950 text-sm capitalize">
              {result?.overall_assessment?.replace(/_/g, ' ')}
            </div>
            <p className="text-emerald-900/90 leading-relaxed">
              {result?.confidence_reason}
            </p>
          </div>
        </div>

        {/* Visual Observations */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Observed Physical Indicators
          </h3>
          <ul className="text-xs text-stone-700 space-y-1 pl-4 list-disc">
            {result?.visual_observations?.map((obs, i) => (
              <li key={i}>{obs}</li>
            ))}
          </ul>
        </div>

        {/* Recommended Management Actions */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Agronomic Soil Management Recommendations
          </h3>
          <div className="space-y-2 text-xs">
            {result?.management_actions?.map((act, i) => (
              <div key={i} className="p-3 rounded-lg border border-stone-200 bg-stone-50">
                <span className="font-bold text-stone-900">{act.action} ({act.timing})</span>
                <p className="text-stone-600 mt-0.5"><strong className="text-stone-700">Why:</strong> {act.why}</p>
                <p className="text-stone-600"><strong className="text-stone-700">How:</strong> {act.how}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Laboratory Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Laboratory Chemical Integration
          </h3>
          {labResults.length > 0 ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950">
              Verified with test from <strong>{labResults[0].laboratory_name}</strong> (pH: {labResults[0].ph}).
            </div>
          ) : (
            <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-700">
              No laboratory results on file. When exact chemical rates (lime tonnage, N-P-K) are required, a laboratory test at KALRO or an accredited laboratory is recommended.
            </div>
          )}
        </div>

        {/* Mandatory Safety Notice */}
        <div className="pt-4 border-t border-stone-200 text-[10px] text-stone-500 space-y-1">
          <p className="font-bold text-stone-700">SAFETY & ADVISORY NOTICE:</p>
          <p>
            Visual soil assessment provides observable physical indicators and agronomic guidance. It does not replace chemical laboratory testing. Do not apply massive quantities of agricultural lime or chemical fertilizers without verifying laboratory soil pH. Calibrated with KALRO reference standards.
          </p>
        </div>
      </div>
    </div>
  );
};
