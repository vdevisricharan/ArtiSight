import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectUploadedImage,
  selectAnalysisResult,
  resetImageState,
} from '../redux/imageSlice';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Upload,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CompositionOverlay from './CompositionOverlay';
import TechnicalAnalysisPanel from './TechnicalAnalysisPanel';
import PersonalizedPracticeSection from './PersonalizedPracticeSection';
import CuratedResourcesSection from './CuratedResourcesSection';

const Feedback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const uploadedImage = useSelector(selectUploadedImage);
  const analysisResult = useSelector(selectAnalysisResult);

  const [expandedScore, setExpandedScore] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleNewPhoto = useCallback(() => {
    dispatch(resetImageState());
    navigate('/upload');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [dispatch, navigate]);

  const handleCopyReport = useCallback(() => {
    if (!analysisResult?.fullCritiqueMarkdown) return;
    navigator.clipboard.writeText(analysisResult.fullCritiqueMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [analysisResult]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const toggleScoreRationale = (category) => {
    setExpandedScore(expandedScore === category ? null : category);
  };

  // Fallback for missing data
  if (!uploadedImage || !analysisResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-blue-100">
            <Upload size={32} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
            Workspace Ready
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">No Active Photo Critique</h1>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Upload your photograph to generate an explainable AI critique, OpenCV technical metrics, and hands-on photography assignments.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Start New Critique
          </Link>
        </div>
      </div>
    );
  }

  const {
    summary,
    scores,
    recommendations = [],
    resources = [],
    cvMetrics,
    exifData,
    image,
    metadata,
  } = analysisResult;

  const scoreCategories = [
    { key: 'composition', label: 'Composition', data: scores.composition, color: 'bg-indigo-500' },
    { key: 'lighting', label: 'Lighting & Exposure', data: scores.lighting, color: 'bg-amber-500' },
    { key: 'focus', label: 'Focus & Clarity', data: scores.focus, color: 'bg-blue-500' },
    { key: 'color', label: 'Color & Harmony', data: scores.color, color: 'bg-emerald-500' },
    { key: 'storytelling', label: 'Story & Narrative', data: scores.storytelling, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-20 print:bg-white print:p-0">
      {/* Streamlined Workspace Action Bar (Single Clean Navigation Bar beneath Navbar) */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3 print:hidden shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 shrink-0">
              Critique Session:
            </span>
            <span className="text-xs font-semibold text-gray-800 truncate">
              {summary?.title || 'Photographic Analysis'}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
            >
              <Copy size={13} />
              <span>{copied ? 'Copied!' : 'Copy Report'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
            >
              <Printer size={13} />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleNewPhoto}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors shadow-xs"
            >
              <Upload size={13} />
              <span>New Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image, Composition Overlays, EXIF & OpenCV Signals */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Interactive Composition Preview */}
            <CompositionOverlay imageSrc={uploadedImage} altText={summary?.title} />

            {/* Image Specs Badge */}
            <div className="w-full mt-3 flex items-center justify-between text-xs text-gray-500 px-2">
              <span>{image?.width} × {image?.height} px ({image?.aspectRatio})</span>
              <span>Inference: {metadata?.processingTimeMs ? `${(metadata.processingTimeMs / 1000).toFixed(1)}s` : 'N/A'}</span>
            </div>

            {/* Technical Computer Vision & EXIF Panel */}
            <TechnicalAnalysisPanel cvMetrics={cvMetrics} exifData={exifData} />
          </div>

          {/* Right Column: Structured Rubric Scores, Strengths, Weaknesses, Exercises, Resources */}
          <div className="lg:col-span-7 space-y-6">
            {/* Overall Score & Title Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-blue-600 block mb-1">
                    Artistic & Technical Evaluation
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    {summary?.title}
                  </h1>
                </div>

                {/* Score Pill */}
                <div className="flex items-center gap-3 shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/70 p-3.5 rounded-2xl">
                  <Award className="w-7 h-7 text-blue-600 shrink-0" />
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-gray-900">
                        {scores?.overall?.value}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">/10</span>
                    </div>
                    <span className="text-[11px] text-blue-700 font-medium uppercase tracking-wider block">
                      Overall Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Headline Rationale */}
              <p className="mt-4 text-sm text-gray-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-gray-100">
                {scores?.overall?.rationale}
              </p>

              {/* Initial Observations */}
              {summary?.observations && summary.observations.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500 mb-2.5">
                    Visual Observations
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {summary.observations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Rubric Category Scores (Accessible Accordions) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide text-xs">
                  Rubric Dimension Breakdown
                </h2>
                <span className="text-[11px] text-gray-600 font-medium">Click any row to expand rationale</span>
              </div>

              <div className="space-y-3.5" role="region" aria-label="Rubric score dimensions">
                {scoreCategories.map(({ key, label, data, color }) => {
                  const isExpanded = expandedScore === key;
                  return (
                    <div
                      key={key}
                      data-testid={`dimension-${key}`}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      onClick={() => toggleScoreRationale(key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleScoreRationale(key);
                        }
                      }}
                      className="border border-gray-100 rounded-2xl p-3.5 bg-slate-50/50 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-gray-800 text-sm">{label}</span>
                            <span className="font-mono text-sm font-bold text-gray-900">
                              {data?.value} / 10
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${color}`}
                              style={{ width: `${(data?.value || 0) * 10}%` }}
                            />
                          </div>
                        </div>
                        <div className="p-1 text-gray-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Expandable rationale */}
                      {isExpanded && (
                        <p className="mt-3 text-xs text-gray-600 leading-relaxed border-t border-gray-200/60 pt-2.5 animate-fade-in">
                          {data?.rationale}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths & Improvements Grid with 30-Second Priority Calling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-emerald-800">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <h3 className="font-bold text-sm tracking-wide uppercase">Core Strengths</h3>
                </div>
                <ul className="space-y-2 text-xs text-emerald-950 leading-relaxed">
                  {summary?.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements with Priority Hierarchy */}
              <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-3 text-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="shrink-0" />
                    <h3 className="font-bold text-sm tracking-wide uppercase">Growth Areas</h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Priority Focus
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs text-amber-950 leading-relaxed">
                  {summary?.improvements?.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                        idx === 0
                          ? 'bg-amber-900 text-white'
                          : idx === 1
                          ? 'bg-amber-800 text-white'
                          : 'bg-amber-200 text-amber-950'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hands-On Practice Exercises */}
            <PersonalizedPracticeSection recommendations={recommendations} />

            {/* Curated & Discovered Learning Resources */}
            <CuratedResourcesSection resources={resources} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;
