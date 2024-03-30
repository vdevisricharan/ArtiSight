import React from 'react';
import { Link } from 'react-router-dom';
import { uploadedImage } from '../assets';

const Feedback = () => {
  return (
    <div className='flex flex-col lg:flex-row items-start justify-center p-8 lg:p-20'>
      <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
        <h2 className="text-3xl font-bold mb-4 text-dark">Your photo</h2>
        <img src={uploadedImage} alt="Wine Glass" className="rounded-xl mb-8 lg:mb-0" />
      </div>
      <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
        <h2 className="text-3xl font-bold text-dark">Critique</h2>
        <p className="mt-4 text-dark">The photo showcases a wine glass juxtaposed against a scenic background, with a sharp focus and blurred background. The lighting is natural and soft, but could be improved with post-processing. The wine's golden hue stands out against the cooler background tones, creating a captivating contrast.</p>
        <h3 className="text-xl font-bold mt-4 mb-4 text-secondary">Suggestions for improvement</h3>
        <ul className="list-disc pl-8 mb-4 text-dark">
          <li className="mb-4">Slightly reframe the shot to give more space on the left side of the glass.</li>
          <li className="mb-4">Adjust the horizon to be completely level for a balanced composition.</li>
          <li className="mb-4">Increase the clarity of the background just slightly while maintaining the focus on the wine glass.</li>
          <li>Enhance the image's contrast and color saturation in post-processing</li>
        </ul>
        <Link to='/'>
          <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded focus:outline-none focus:ring-4 focus:ring-purple-300 transition-colors">Search Resources</button>
        </Link>
      </div>
    </div>
  );
};

export default Feedback;
