import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Camera, Grid, BarChart3 } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-4 md:mx-8 lg:mx-20 my-6" aria-labelledby="hero-heading">
      <div className="rounded-3xl py-20 md:py-28 px-6 sm:px-12 lg:px-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        {/* Subtle photographic grid background accent */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full border border-white/20 grid grid-cols-3 grid-rows-3"></div>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-6">
            <Sparkles size={14} className="text-blue-400" />
            ArtiSight 2.0 • Multimodal AI & Computer Vision Critique
          </div>

          <h1
            id="hero-heading"
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent"
          >
            Master Photography Through Explainable AI Feedback
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
            Transform raw photographs into structured rubric scores, deterministic OpenCV exposure metrics, actionable shooting assignments, and curated educational resources.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer"
            >
              <Camera size={16} />
              Start Free Photo Critique
              <ArrowRight size={16} />
            </button>
            <a
              href="#capabilities"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-sm transition-all border border-white/10"
            >
              Explore Evaluation Rubric
            </a>
          </div>

          {/* Key Metric Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 text-left">
            <div>
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold mb-1">
                <Grid size={14} /> 6 Rubric Dimensions
              </div>
              <span className="text-xs text-slate-400">Composition, Light, Color, Focus, Story</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold mb-1">
                <BarChart3 size={14} /> Deterministic CV
              </div>
              <span className="text-xs text-slate-400">Laplacian Sharpness & Exposure Histograms</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                <Sparkles size={14} /> Targeted Practice
              </div>
              <span className="text-xs text-slate-400">Custom exercises for detected weaknesses</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
