import { Upload, Brain, BookOpen } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Upload className="w-10 h-10" />,
      title: "1. Upload Photograph",
      description: "Select any JPEG, PNG, or WebP image. Client-side optimization validates and prepares your photo securely without permanent server storage.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "2. Multimodal AI & CV Analysis",
      description: "Gemini 2.5 Flash evaluates 6 rubric dimensions while OpenCV calculates objective exposure histograms, clipping gauges, and sharpness variance.",
      color: "from-indigo-600 to-purple-600"
    },
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: "3. Actionable Growth Path",
      description: "Receive concrete hands-on shooting assignments, compositional grid overlays, and curated educational guides tailored to detected weaknesses.",
      color: "from-purple-600 to-pink-600"
    }
  ];

  return (
    <section 
      id="how-it-works" 
      className="max-w-7xl mx-auto px-6 py-16 lg:px-12"
      aria-labelledby="how-it-works-heading"
    >
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
          Structured Learning Workflow
        </span>
        <h2 
          id="how-it-works-heading"
          className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight"
        >
          From Raw Photograph to Actionable Mastery
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-3 leading-relaxed">
          ArtiSight guides photographers through a continuous cycle of analysis, technical explainability, and targeted practice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
              {step.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
