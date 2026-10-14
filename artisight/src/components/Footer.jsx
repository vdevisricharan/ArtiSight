import { Github, Globe, Sparkles, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <Sparkles className="w-5 h-5 text-blue-400" />
            ArtiSight 2.0
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Applied AI and computer vision photography critique platform. Providing objective rubric scores, exposure histograms, and personalized practice exercises.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-white uppercase tracking-wider mb-3">
            Engineering & Project Links
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="https://github.com/vdevisricharan/ArtiSight"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <Github size={14} />
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://vdevisricharan.netlify.app/project/artisight"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <Globe size={14} />
                Portfolio Case Study
              </a>
            </li>
            <li>
              <a
                href="https://artisight.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <BookOpen size={14} />
                Live Application
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-white uppercase tracking-wider mb-3">
            Technical Privacy
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Photographs are processed statelessly in memory and temporary storage. GPS metadata is automatically stripped, and images are never stored permanently or used for model training.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} ArtiSight 2.0 • Devi Sri Charan Valupadasu</p>
      </div>
    </footer>
  );
};

export default Footer;
