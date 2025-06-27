import { useState } from 'react';
import { Upload, Brain, BookOpen } from 'lucide-react';
import { uploadImage, feedbackImage, resourcesImage } from '../assets';

const Example = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { 
      id: 1, 
      title: 'Upload Your Photo', 
      description: 'Drag and drop your photo or click to upload. Press the \'Get AI Critique\' button to start.',
      icon: <Upload className="w-6 h-6" />,
      image: uploadImage
    },
    { 
      id: 2, 
      title: 'Receive Feedback', 
      description: 'Get detailed feedback and suggestions on how to improve your photography skills.',
      icon: <Brain className="w-6 h-6" />,
      image: feedbackImage
    },
    { 
      id: 3, 
      title: 'Search for Resources', 
      description: 'Find tutorials, articles, and other materials to enhance your skills.',
      icon: <BookOpen className="w-6 h-6" />,
      image: resourcesImage
    }
  ];

  return (
    <section 
      id="examples" 
      className="lg:mx-12 px-4 sm:px-6 lg:px-8 py-16 rounded-3xl mx-4"
      aria-labelledby="examples-heading"
    >
      <h2 
        id="examples-heading"
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent"
      >
        How to Use the Tool
      </h2>
      <div className='flex flex-col lg:flex-row items-center gap-12'>
        <div className="lg:flex-1">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              onClick={() => setActiveStep(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStep(index);
                }
              }}
              className={`cursor-pointer p-6 rounded-xl transition-all duration-300 mb-4 ${
                activeStep === index 
                  ? 'bg-white shadow-xl border-l-4 border-primary scale-105'
                  : 'hover:bg-white/70'
              }`}
              role="button"
              tabIndex={0}
              aria-pressed={activeStep === index}
              aria-describedby={`step-${index}-description`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeStep === index 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.icon}
                </div>
                <h3 className={`font-bold text-lg md:text-xl bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent ${
                  activeStep === index ? '' : 'opacity-80'
                }`}>
                  {step.title}
                </h3>
              </div>
              <p 
                id={`step-${index}-description`}
                className={`text-sm md:text-base leading-relaxed ml-14 text-gray-700`}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div className="lg:flex-1">
          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            <div className="aspect-video rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto rounded-full flex items-center justify-center">
                  <img src={steps[activeStep].image} alt=''/>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Step {activeStep + 1}
                </h4>
                <p className="text-gray-600 text-sm">
                  {steps[activeStep].title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Example;
