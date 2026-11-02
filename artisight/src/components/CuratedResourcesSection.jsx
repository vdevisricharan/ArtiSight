import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Compass,
  ExternalLink,
  ArrowRight,
  Filter,
} from 'lucide-react';

const getSourceTypeConfig = (sourceType = '') => {
  const type = sourceType.toLowerCase();
  switch (type) {
    case 'guide':
      return {
        label: 'Guide',
        icon: BookOpen,
        classes: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      };
    case 'tutorial':
      return {
        label: 'Tutorial',
        icon: GraduationCap,
        classes: 'bg-purple-50 text-purple-700 border-purple-200/80',
      };
    case 'article':
      return {
        label: 'Article',
        icon: FileText,
        classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      };
    default:
      return {
        label: sourceType || 'Resource',
        icon: Compass,
        classes: 'bg-blue-50 text-blue-700 border-blue-200/80',
      };
  }
};

const CuratedResourcesSection = ({ resources = [] }) => {
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Extract unique topics for filtering
  const availableTopics = useMemo(() => {
    if (!resources || resources.length === 0) return [];
    const topicsSet = new Set();
    resources.forEach((res) => {
      const topic = res.searchQuery || res.topic;
      if (topic && typeof topic === 'string' && topic.trim()) {
        topicsSet.add(topic.trim());
      }
    });
    return Array.from(topicsSet);
  }, [resources]);

  const filteredResources = useMemo(() => {
    if (selectedTopic === 'All') return resources;
    return resources.filter((res) => {
      const topic = res.searchQuery || res.topic;
      return topic === selectedTopic;
    });
  }, [resources, selectedTopic]);

  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-200/80 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-wide uppercase text-xs">
              Curated Educational Resources
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Verified photography guides and tutorials tailored to your weaknesses
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full self-start sm:self-center shrink-0">
          {resources.length} Handpicked {resources.length === 1 ? 'Guide' : 'Guides'}
        </span>
      </div>

      {/* Interactive Topic Filter Pills (only shown if multiple topics exist) */}
      {availableTopics.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-6" role="tablist" aria-label="Filter resources by topic">
          <span className="text-xs text-slate-700 font-medium flex items-center gap-1 shrink-0 mr-1">
            <Filter size={12} />
            Filter:
          </span>
          <button
            type="button"
            role="tab"
            aria-selected={selectedTopic === 'All'}
            onClick={() => setSelectedTopic('All')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shrink-0 min-h-[32px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              selectedTopic === 'All'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({resources.length})
          </button>
          {availableTopics.map((topic) => {
            const count = resources.filter((r) => (r.searchQuery || r.topic) === topic).length;
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedTopic(topic)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shrink-0 min-h-[32px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {topic} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {filteredResources.map((res, idx) => {
          const typeConfig = getSourceTypeConfig(res.sourceType);
          const TypeIcon = typeConfig.icon;

          return (
            <a
              key={idx}
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-gray-200/90 hover:border-blue-500 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-all duration-200 bg-white relative hover:-translate-y-0.5 overflow-hidden min-w-0"
            >
              <div className="min-w-0">
                {/* Card Top: Type Badge & Domain Link */}
                <div className="flex items-center justify-between text-xs mb-3 gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-2xs shrink-0 ${typeConfig.classes}`}
                  >
                    <TypeIcon size={12} />
                    {typeConfig.label}
                  </span>

                  <span className="text-slate-700 group-hover:text-blue-700 transition-colors flex items-center gap-1 font-semibold text-xs bg-slate-50 group-hover:bg-blue-50/80 px-2.5 py-1 rounded-lg border border-slate-200/70 group-hover:border-blue-200 truncate max-w-[160px] xs:max-w-[220px] sm:max-w-none">
                    <span className="truncate">{res.displayLink}</span>
                    <ExternalLink size={12} className="shrink-0 ml-0.5" />
                  </span>
                </div>

                {/* Guide Title */}
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors line-clamp-2 mb-2 leading-snug break-words">
                  {res.title}
                  <span className="sr-only"> (opens in new tab)</span>
                </h3>

                {/* Guide Snippet */}
                <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed mb-4 break-words">
                  {res.snippet}
                </p>
              </div>

              {/* Card Footer: Topic Tag & CTA */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md truncate max-w-[65%] sm:max-w-[75%]">
                  {res.searchQuery ? `Topic: ${res.searchQuery}` : 'Resource'}
                </span>

                <span className="font-semibold text-blue-700 group-hover:text-blue-800 transition-colors flex items-center gap-1 text-xs shrink-0 group-hover:translate-x-1 duration-150">
                  Read Guide <ArrowRight size={13} />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

CuratedResourcesSection.propTypes = {
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      link: PropTypes.string,
      snippet: PropTypes.string,
      displayLink: PropTypes.string,
      sourceType: PropTypes.string,
      searchQuery: PropTypes.string,
      topic: PropTypes.string,
    })
  ),
};

export default CuratedResourcesSection;
