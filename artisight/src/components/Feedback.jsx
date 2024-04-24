import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSuggestions } from '../redux/imageSlice';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
<<<<<<< HEAD
import Resources from './Resources';

=======

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
>>>>>>> 6424736ee6c380b6aa4f27093aabf1a36c313766
const Feedback = () => {
  const dispatch = useDispatch();
  const uploadedImage = useSelector(state => state.image.uploadedImage);
  const critique = useSelector(state => state.image.critique);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');
<<<<<<< HEAD
  const [showResources, setShowResources] = useState(false);
=======

  // Using the hook to get the animated critique text
  const [animatedCritique, isTypingComplete] = useTypingEffect(critique, 5); // Adjust speed as needed

  const processSuggestions = (text) => {
    const lines = text.split('\n');
    if (lines[0].startsWith('**')) {

      lines.shift();
    }
    return lines.join('\n');
  };
>>>>>>> 6424736ee6c380b6aa4f27093aabf1a36c313766

  useEffect(() => {
    if (fetching || !critique) return;
    setLoading(true);
    setFetching(true);
    fetch('http://127.0.0.1:5000/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ critique })
    })
      .then(response => response.json())
      .then(data => {
        dispatch(setSuggestions(data.suggestions));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error);
        setLoading(false);
        setFetching(false);
      });
  }, [dispatch, critique]);

  const suggestions = useSelector(state => state.image.suggestions);

  return (
    <div>
      <div className='flex flex-col lg:flex-row items-start justify-center p-8 lg:px-20'>
        <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
          <h2 className="text-3xl font-bold mb-4 text-dark">Your photo</h2>
          <img src={uploadedImage} alt="Uploaded Image" className="rounded-2xl mb-8 lg:mb-0" />
        </div>
        <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
          <h2 className="text-3xl font-bold text-dark">Critique</h2>

          <div className="mt-4 flex">
            <button onClick={() => setActiveTab('feedback')} className={`text-lg font-bold ${activeTab === 'feedback' ? 'border-b-2 border-primary' : 'text-gray-500'}`}>Feedback</button>
            <button onClick={() => setActiveTab('suggestions')} className={`text-lg font-bold ml-4 ${activeTab === 'suggestions' ? 'border-b-2 border-primary' : 'text-gray-500'}`}>Suggestions</button>
          </div>

          {activeTab === 'feedback' && (
            <div className='h-96 overflow-y-auto rounded-lg my-2.5'>
              <ReactMarkdown className="mt-4 text-dark leading-loose">{critique}</ReactMarkdown>
            </div>
          )}
<<<<<<< HEAD

=======
>>>>>>> 6424736ee6c380b6aa4f27093aabf1a36c313766

          {activeTab === 'suggestions' && (
            <div className='h-96 overflow-y-auto rounded-lg my-2.5'>
              {loading ? (
                <p className='text-dark'>Loading suggestions...</p>
              ) : (
                <ReactMarkdown className="mt-4 leading-loose text-dark">{suggestions}</ReactMarkdown>
              )}
            </div>
          )}

          <div className='flex flex-wrap gap-4 justify-center'>
            <div>
              <button onClick={() => setShowResources(!showResources)} className="mt-4 bg-primary hover:bg-secondary text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-md rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 transition-colors">Search Resources</button>
            </div>
            <div>
              <Link to='/upload'>
                <button className="mt-4 border border-primary text-primary px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-md rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 transition-colors">Submit Another Photo</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div>
        {showResources && <Resources critique={critique} suggestions={suggestions}/>}
      </div>
    </div>
  );
};
export default Feedback;
