import React, { useState } from 'react';
import { uploadImage, feedbackImage, resourcesImage } from '../assets';

const steps = [
  { id: 1, title: 'Upload Your Photo', description: 'Drag and drop your photo here or click to upload. Press the \'Generate Critique\' button to start.', imgSrc: uploadImage },
  { id: 2, title: 'Receive Feedback', description: 'Get detailed feedback and suggestions on how to improve your photography skills.', imgSrc: feedbackImage },
  { id: 3, title: 'Search for Resources', description: 'Find tutorials, articles, and other materials to enhance your skills.', imgSrc: resourcesImage }
];

const Example = () => {
  const [activeStep, setActiveStep] = useState(steps[0]);

  const handleClick = (step) => {
    setActiveStep(step);
  };

  return (
    <div className="lg:mx-12 px-4 sm:px-6 lg:px-0 py-12 bg-gray rounded-2xl border-2">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-8 text-center">Example: How to Use the Tool</h2>
      <div className='flex flex-col md:flex-row items-center'>
        <div className="md:flex-1">
          {steps.map((step, index) => (
            <div key={step.id} onClick={() => handleClick(step)} className={`cursor-pointer flex flex-col items-center justify-center py-4 ${activeStep.id === step.id ? 'text-primary' : 'text-gray-400'}`}>
              <div className="text-lg sm:text-xl md:text-2xl font-semibold">{index + 1}</div>
              <div className="font-medium text-md sm:text-lg md:text-xl">{step.title}</div>
              <p className="text-sm md:text-md lg:text-lg py-2 sm:py-3 md:py-4 w-full sm:w-3/4 md:w-2/3 text-center">{step.description}</p>
              {index < steps.length - 1 && <div className="w-full border-t-2 border-gray-200 my-2"></div>}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <img src={activeStep.imgSrc} alt={activeStep.title} className="max-w-full h-auto rounded-lg transition duration-500 ease-in-out" />
        </div>
      </div>
    </div>
  );
}

export default Example;
