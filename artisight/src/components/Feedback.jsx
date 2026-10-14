import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectUploadedImage,
  selectAnalysisResult,
  resetImageState,
} from '../redux/imageSlice';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Copy,
  Printer,
  Upload,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import CompositionOverlay from './CompositionOverlay';
import TechnicalAnalysisPanel from './TechnicalAnalysisPanel';

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
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Upload size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Active Photo Critique</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Upload your photograph to generate an explainable AI critique, OpenCV technical metrics, and hands-on photography assignments.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg"
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
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-3.5 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              ArtiSight <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">2.0</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500 font-medium truncate max-w-xs">
              {summary?.title || 'Photography Critique'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Copy markdown critique"
            >
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy Report'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Print / Save PDF"
            >
              <Printer size={14} />
              Print / PDF
            </button>
            <button
              onClick={handleNewPhoto}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Upload size={14} />
              New Photo
            </button>
          </div>
        </div>
      </header>

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

            {/* Rubric Category Scores */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
              <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide text-xs">
                Rubric Dimension Breakdown
              </h2>
              <div className="space-y-3.5">
                {scoreCategories.map(({ key, label, data, color }) => {
                  const isExpanded = expandedScore === key;
                  return (
                    <div
                      key={key}
                      className="border border-gray-100 rounded-2xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        onClick={() => toggleScoreRationale(key)}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
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
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                          aria-label={`Toggle ${label} rationale`}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {/* Expandable rationale */}
                      {isExpanded && (
                        <p className="mt-3 text-xs text-gray-600 leading-relaxed border-t border-gray-200/60 pt-2.5">
                          {data?.rationale}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths & Improvements Grid */}
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

              {/* Improvements */}
              <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-amber-800">
                  <AlertTriangle size={18} className="shrink-0" />
                  <h3 className="font-bold text-sm tracking-wide uppercase">Growth Areas</h3>
                </div>
                <ul className="space-y-2 text-xs text-amber-950 leading-relaxed">
                  {summary?.improvements?.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hands-On Practice Exercises */}
            {recommendations && recommendations.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
                <div className="flex items-center gap-2 mb-5">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-gray-900 tracking-wide uppercase text-xs">
                    Personalized Practice Assignments
                  </h2>
                </div>

                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="border border-indigo-100 rounded-2xl p-5 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                          {rec.learning_topic || 'Practice'}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">Exercise #{idx + 1}</span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm mb-2">{rec.problem}</h4>
                      <p className="text-xs text-gray-600 mb-3 italic">
                        <strong>Evidence:</strong> {rec.evidence}
                      </p>

                      <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-100/70 mb-3 text-xs space-y-2 text-gray-700">
                        <div>
                          <strong className="text-indigo-950 block mb-0.5">Recommended Adjustment:</strong>
                          {rec.recommendation}
                        </div>
                        <div>
                          <strong className="text-indigo-950 block mb-0.5">Shooting Assignment:</strong>
                          <span className="font-medium text-indigo-900">{rec.exercise}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-500 font-medium">
                        <strong>Target Skill Outcome:</strong> {rec.expected_outcome}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curated & Discovered Learning Resources */}
            {resources && resources.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-wide uppercase text-xs">
                      Curated Educational Resources
                    </h2>
                    <p className="text-xs text-gray-500">
                      Verified photography guides and tutorials tailored to your weaknesses
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col justify-between p-4 rounded-2xl border border-gray-200/80 hover:border-blue-500 hover:shadow-md transition-all bg-white"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-blue-600 font-semibold mb-2">
                          <span className="uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-blue-50">
                            {res.sourceType || 'Guide'}
                          </span>
                          <span className="text-gray-400 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                            {res.displayLink}
                            <ExternalLink size={12} />
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-1.5">
                          {res.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {res.snippet}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <span>{res.searchQuery ? `Topic: ${res.searchQuery}` : 'Resource'}</span>
                        <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                          Read Guide →
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;