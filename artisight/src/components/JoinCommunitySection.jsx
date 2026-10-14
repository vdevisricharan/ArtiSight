import { Sliders, Sun, Focus, Palette, BookOpen, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const capabilities = [
  {
    icon: <Sliders className="w-6 h-6 text-indigo-600" />,
    title: "Composition Analysis",
    description: "Evaluates Rule of Thirds, negative space balance, leading lines, framing, and visual hierarchy."
  },
  {
    icon: <Sun className="w-6 h-6 text-amber-600" />,
    title: "Lighting & Exposure",
    description: "Detects highlight clipping, crushed shadow details, dynamic range balance, and directional light."
  },
  {
    icon: <Focus className="w-6 h-6 text-blue-600" />,
    title: "Technical Clarity & Focus",
    description: "Measures edge sharpness with OpenCV Laplacian variance, depth of field intent, and motion blur."
  },
  {
    icon: <Palette className="w-6 h-6 text-emerald-600" />,
    title: "Color Harmony & Tones",
    description: "Assesses white balance neutrality, color palette cohesion, saturation, and tonal gradations."
  },
  {
    icon: <BookOpen className="w-6 h-6 text-purple-600" />,
    title: "Personalized Practice Assignments",
    description: "Translates detected flaws into specific, actionable shooting exercises and verified educational guides."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
    title: "Privacy-First Architecture",
    description: "Stateless processing, zero permanent image storage, and automated GPS location stripping."
  }
];

const JoinCommunitySection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="capabilities"
      className="py-16 mx-4 sm:mx-8 lg:mx-20 my-8"
      aria-labelledby="capabilities-heading"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-14 border border-gray-200/80 shadow-lg">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
            Applied AI & Computer Vision Architecture
          </span>
          <h2
            id="capabilities-heading"
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight"
          >
            Built on Classical Photography Principles
          </h2>
          <p className="text-base text-gray-600 mt-3 leading-relaxed">
            ArtiSight pairs multimodal generative intelligence with deterministic pixel analysis, delivering structured feedback rather than arbitrary text essays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-100 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                {cap.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{cap.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{cap.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg"
          >
            Analyze Your Photograph Now →
          </button>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunitySection;
