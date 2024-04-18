import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSuggestions } from '../redux/imageSlice';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

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
  const dispatch = useDispatch();
  const uploadedImage = useSelector(state => state.image.uploadedImage);
  const critique = useSelector(state => state.image.critique);
  const suggestions = useSelector(state => state.image.suggestions);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');

  // Using the hook to get the animated critique text
  const [animatedCritique, isTypingComplete] = useTypingEffect(critique, 5); // Adjust speed as needed

  const processSuggestions = (text) => {
    const lines = text.split('\n');
    if (lines[0].startsWith('**')) {
      // Remove the first line if it's a heading
      lines.shift();
    }
    return lines.join('\n');
  };

  useEffect(() => {
    setLoading(true);
    fetch('https://artisight.onrender.com/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ critique })
    })
      .then(response => response.json())
      .then(data => {
        const processedSuggestions = processSuggestions(data.suggestions);
        dispatch(setSuggestions(processedSuggestions));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error);
        setLoading(false);
      });
  }, [critique]);

  return (
    <div>
      <div className='flex flex-col lg:flex-row items-start justify-center p-8 lg:p-20'>
        <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
          <h2 className="text-3xl font-bold mb-4 text-dark">Your photo</h2>
          <img src={uploadedImage} alt="Wine Glass" className="rounded-xl mb-8 lg:mb-0" />
        </div>
        <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
          <h2 className="text-3xl font-bold text-dark">Critique</h2>

          <div className="mt-4 flex">
            <button onClick={() => setActiveTab('feedback')} className={`text-lg font-bold ${activeTab === 'feedback' ? 'border-b-2 border-primary' : 'text-gray-500'}`}>Feedback</button>
            <button onClick={() => setActiveTab('suggestions')} className={`text-lg font-bold ml-4 ${activeTab === 'suggestions' ? 'border-b-2 border-primary' : 'text-gray-500'}`}>Suggestions</button>
          </div>

          {activeTab === 'feedback' && (
            <div>
              <ReactMarkdown className="mt-4 text-dark leading-loose">{animatedCritique}</ReactMarkdown>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div>
              {loading ? (
                <p className='mt-4 text-dark'>Loading suggestions...</p>
              ) : (
                <div>
                  <ReactMarkdown className="mt-4 leading-loose text-dark">{suggestions}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {isTypingComplete && (
            <Link to='/upload'>
              <button className="mt-4 bg-primary hover:bg-secondary text-white px-4 py-2 rounded focus:outline-none focus:ring-4 focus:ring-purple-300 transition-colors">Submit Another Photo</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
