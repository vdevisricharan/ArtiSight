import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Award,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Lightbulb,
  Sparkles,
  Target,
  CircleDot,
} from 'lucide-react';

const getTopicColor = (topic = '') => {
  const lower = topic.toLowerCase();
  if (lower.includes('lighting') || lower.includes('exposure')) {
    return {
      badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      accent: 'border-l-amber-500',
    };
  }
  if (lower.includes('focus') || lower.includes('sharpness') || lower.includes('shutter')) {
    return {
      badge: 'bg-sky-50 text-sky-800 border-sky-200/80',
      accent: 'border-l-sky-500',
    };
  }
  if (lower.includes('color') || lower.includes('harmony') || lower.includes('white balance')) {
    return {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      accent: 'border-l-emerald-500',
    };
  }
  if (lower.includes('story') || lower.includes('narrative')) {
    return {
      badge: 'bg-purple-50 text-purple-800 border-purple-200/80',
      accent: 'border-l-purple-500',
    };
  }
  // Default: composition or general practice
  return {
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
    accent: 'border-l-indigo-500',
  };
};

const PersonalizedPracticeSection = ({ recommendations = [] }) => {
  const [completedDrills, setCompletedDrills] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const toggleDrillCompletion = useCallback((idx) => {
    setCompletedDrills((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }, []);

  const handleCopyDrill = useCallback((rec, idx) => {
    const textToCopy = [
      `ArtiSight Shooting Drill #${idx + 1}: ${rec.problem}`,
      `Topic: ${rec.learning_topic || 'Photography Practice'}`,
      `Shooting Assignment: ${rec.exercise}`,
      `Recommended Adjustment: ${rec.recommendation}`,
      `Target Skill Outcome: ${rec.expected_outcome}`,
    ].join('\n\n');

    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(idx);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2200);
  }, []);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const completedCount = Object.values(completedDrills).filter(Boolean).length;
  const totalCount = recommendations.length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-200/80 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-wide uppercase text-xs">
              Personalized Practice Assignments
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Hands-on deliberate practice drills engineered to build photographic muscle memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} />
              {completedCount} of {totalCount} Completed
            </span>
          )}
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3 py-1 rounded-full">
            {totalCount} Active {totalCount === 1 ? 'Exercise' : 'Exercises'}
          </span>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-5">
        {recommendations.map((rec, idx) => {
          const isDone = !!completedDrills[idx];
          const isCopied = copiedIndex === idx;
          const { badge: topicBadgeClass, accent: borderAccentClass } = getTopicColor(rec.learning_topic);

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 p-4 sm:p-6 bg-white border-l-4 ${borderAccentClass} overflow-hidden ${
                isDone
                  ? 'border-gray-200/80 bg-slate-50/50 shadow-2xs'
                  : 'border-gray-200/90 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              {/* Card Top Row: Index Badge, Topic Pill, Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${topicBadgeClass}`}
                  >
                    {rec.learning_topic || 'Practice'}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    Exercise #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyDrill(rec, idx)}
                    className="inline-flex items-center justify-center min-h-[32px] gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200/80 hover:border-indigo-200 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    title="Copy assignment details for your shoot"
                  >
                    {isCopied ? (
                      <>
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="shrink-0" />
                        <span>Copy Drill</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    onClick={() => toggleDrillCompletion(idx)}
                    className={`inline-flex items-center justify-center min-h-[32px] gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                      isDone
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 size={13} className="shrink-0" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <CircleDot size={13} className="text-slate-400 shrink-0" />
                        <span>Mark Done</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Problem Heading */}
              <h3 className={`text-base font-bold text-gray-900 mb-2 leading-snug break-words ${isDone ? 'line-through text-gray-500' : ''}`}>
                {rec.problem}
              </h3>

              {/* Diagnostic Evidence Pill */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 mb-3.5">
                <Eye className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed break-words min-w-0">
                  <strong className="text-slate-900 font-bold">Evidence:</strong>{' '}
                  <span>{rec.evidence}</span>
                </div>
              </div>

              {/* Why it Matters (Pedagogical Principle - if present) */}
              {rec.why_it_matters && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 mb-3.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed break-words min-w-0">
                    <strong className="text-amber-900 font-bold">Photographic Principle:</strong>{' '}
                    <span>{rec.why_it_matters}</span>
                  </div>
                </div>
              )}

              {/* Recommended Adjustment & Shooting Assignment Cards */}
              <div className="grid grid-cols-1 gap-3 mb-3.5">
                {/* Recommended Adjustment */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <strong className="font-bold text-slate-900">Recommended Adjustment:</strong>
                  </div>
                  <p className="leading-relaxed pl-5 text-slate-700 break-words">
                    {rec.recommendation}
                  </p>
                </div>

                {/* Shooting Assignment - The Hero Field Drill */}
                <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-indigo-50/20 p-4 rounded-xl border border-indigo-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <div className="flex items-center gap-1.5 text-indigo-950">
                      <Camera className="w-4 h-4 text-indigo-700 shrink-0" />
                      <strong className="font-bold text-indigo-950 text-xs uppercase tracking-wide">
                        Shooting Assignment:
                      </strong>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100/80 text-indigo-700 rounded-md">
                      Field Drill
                    </span>
                  </div>
                  <p className="font-medium text-indigo-950 text-xs leading-relaxed pl-5 break-words">
                    {rec.exercise}
                  </p>
                </div>
              </div>

              {/* Target Skill Outcome Footer */}
              <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 p-3 rounded-xl border border-emerald-200/70 flex items-start gap-2.5">
                <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed break-words min-w-0">
                  <strong className="text-emerald-900 font-bold">Target Skill Outcome:</strong>{' '}
                  <span>{rec.expected_outcome}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

PersonalizedPracticeSection.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      problem: PropTypes.string,
      evidence: PropTypes.string,
      why_it_matters: PropTypes.string,
      recommendation: PropTypes.string,
      exercise: PropTypes.string,
      expected_outcome: PropTypes.string,
      learning_topic: PropTypes.string,
    })
  ),
};

export default PersonalizedPracticeSection;
