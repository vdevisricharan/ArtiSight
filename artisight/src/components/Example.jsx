import { useState } from 'react';
import { Upload, Brain, BookOpen } from 'lucide-react';
import { uploadImage, feedbackImage, resourcesImage } from '../assets';

const Example = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: '1. Select & Optimize Image',
      description: 'Drag and drop your photograph. Client-side processing verifies dimensions and handles safe orientation normalization.',
      icon: <Upload className="w-5 h-5" />,
      image: uploadImage,
    },
    {
      id: 2,
      title: '2. Review Structured Critique',
      description: 'Explore the 6-dimension rubric scores, interactive composition guides, EXIF parameters, and OpenCV exposure histograms.',
      icon: <Brain className="w-5 h-5" />,
      image: feedbackImage,
    },
    {
      id: 3,
      title: '3. Practice Hands-On Exercises',
      description: 'Complete tailored shooting assignments and study curated photography guides matched directly to your detected weaknesses.',
      icon: <BookOpen className="w-5 h-5" />,
      image: resourcesImage,
    },
  ];

  return (
    <section
      id="examples"
      className="max-w-7xl mx-auto px-6 py-16 lg:px-12"
      aria-labelledby="examples-heading"
    >
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
          Interactive Experience
        </span>
        <h2
          id="examples-heading"
          className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight"
        >
          Visualizing the Critique Journey
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-3 leading-relaxed">
          See how an uploaded photo transforms into an actionable, explainable learning path.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-10">
        {/* Step Selector List */}
        <div className="lg:w-1/2 space-y-4 w-full">
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStep(index);
                  }
                }}
                className={`cursor-pointer p-6 rounded-2xl transition-all duration-300 border ${
                  isActive
                    ? 'bg-white shadow-xl border-blue-500 scale-[1.02]'
                    : 'bg-white/60 hover:bg-white border-gray-100 hover:border-gray-200'
                }`}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pl-13">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Visual Preview Card */}
        <div className="lg:w-1/2 w-full">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="aspect-[16/10] bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden relative">
              <img
                src={steps[activeStep].image}
                alt={steps[activeStep].title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
                Step {activeStep + 1}: {steps[activeStep].title}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Example;
