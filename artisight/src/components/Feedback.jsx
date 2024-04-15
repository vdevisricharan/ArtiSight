import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// Custom hook to handle typing animation, modified to indicate completion
function useTypingEffect(text, speed) {
  const [typedText, setTypedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (typedText.length === text.length) {
      setIsComplete(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      setTypedText(text.substring(0, typedText.length + 1));
    }, speed);

    return () => clearTimeout(timeoutId);
  }, [text, typedText, speed]);

  return [typedText, isComplete];
}

const Feedback = () => {
  const uploadedImage = useSelector(state => state.image.uploadedImage);

  const critique = useSelector(state => state.image.critique);

  // Using the hook to get the animated critique text
  const [animatedCritique, isTypingComplete]  = useTypingEffect(critique, 10); // Adjust speed as needed

  return (
    <div className='flex flex-col lg:flex-row items-start justify-center p-8 lg:p-20'>
      <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
        <h2 className="text-3xl font-bold mb-4 text-dark">Your photo</h2>
        <img src={uploadedImage} alt="Wine Glass" className="rounded-xl mb-8 lg:mb-0" />
      </div>
      <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
        <h2 className="text-3xl font-bold text-dark">Critique</h2>
        <p className="mt-4 text-dark leading-loose">{animatedCritique}</p>
        {isTypingComplete && (
          <Link to='/upload'>
            <button className="mt-4 bg-primary hover:bg-secondary text-white px-4 py-2 rounded focus:outline-none focus:ring-4 focus:ring-purple-300 transition-colors">Submit Another Photo</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Feedback;
