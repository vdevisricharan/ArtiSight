import { useState, useEffect, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSuggestions, selectUploadedImage, selectCritique, selectSuggestions, resetImageState } from '../redux/imageSlice';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Resources from './Resources';
import axios from 'axios';

// Enhanced Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-3 text-dark">Loading suggestions...</span>
  </div>
);

// Skeleton loader for better perceived performance
const SkeletonLoader = () => (
  <div className="animate-pulse mt-4">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
);

// Error component with retry functionality
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-600 mb-3" role="alert">{error}</p>
    <button
      onClick={onRetry}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
    >
      Try Again
    </button>
  </div>
);

const Feedback = memo(() => {
  const dispatch = useDispatch();
  const uploadedImage = useSelector(selectUploadedImage);
  const critique = useSelector(selectCritique);
  const suggestions = useSelector(selectSuggestions);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');
  const [showResources, setShowResources] = useState(false);
  
  const navigate = useNavigate();

  // Fetch suggestions function
  const fetchSuggestions = useCallback(async () => {
    if (!critique || suggestions) return; // Don't fetch if we already have suggestions
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/suggest`,
        { critique },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout
        }
      );
      dispatch(setSuggestions(response.data.suggestions));
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        error.message ||
        'Failed to fetch suggestions. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, critique, suggestions]);

  // Fetch suggestions
  useEffect(() => {
    if (!suggestions) {
      fetchSuggestions();
    }
  }, [suggestions]);

  // Tab change handler with keyboard support
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Handle keyboard navigation for tabs
  const handleKeyDown = useCallback((event, tab) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabChange(tab);
    }
  }, [handleTabChange]);

  // Handle new photo submission
  const handleNewPhoto = useCallback(() => {
    dispatch(resetImageState());
    navigate('/upload');
  }, [dispatch, navigate]);

  // Fallbacks for missing data
  if (!uploadedImage || !critique) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">No photo uploaded</h2>
          <p className="text-gray-600 mb-6">Please upload a photo to get started</p>
          <Link to="/upload">
            <button className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300">
              Go to Upload
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className='flex flex-col lg:flex-row items-start justify-center p-8 lg:px-20 max-w-7xl mx-auto'>
        {/* Image Section */}
        <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
          <h2 className="text-3xl font-bold mb-6 text-dark">Your Photo</h2>
          <div className="relative">
            <img 
              src={uploadedImage} 
              alt="Uploaded preview" 
              className="rounded-2xl shadow-lg max-w-full h-auto mb-8 lg:mb-0" 
              loading="lazy"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className='flex flex-col items-center lg:items-start justify-center px-5 lg:px-10 w-full lg:w-1/2'>
          <h2 className="text-3xl font-bold text-dark mb-6">Analysis</h2>
          
          {/* Tab Navigation */}
          <div className="w-full">
            <div className="flex border-b border-gray-200 mb-4" role="tablist" aria-label="Feedback and Suggestions Tabs">
              <button
                onClick={() => handleTabChange('feedback')}
                onKeyDown={(e) => handleKeyDown(e, 'feedback')}
                className={`px-4 py-2 text-lg font-semibold transition-colors ${
                  activeTab === 'feedback' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                role="tab"
                aria-selected={activeTab === 'feedback'}
                aria-controls="feedback-panel"
                id="feedback-tab"
                tabIndex={0}
              >
                Feedback
              </button>
              <button
                onClick={() => handleTabChange('suggestions')}
                onKeyDown={(e) => handleKeyDown(e, 'suggestions')}
                className={`px-4 py-2 text-lg font-semibold ml-6 transition-colors ${
                  activeTab === 'suggestions' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                role="tab"
                aria-selected={activeTab === 'suggestions'}
                aria-controls="suggestions-panel"
                id="suggestions-tab"
                tabIndex={0}
              >
                Suggestions
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {activeTab === 'feedback' && (
                <div 
                  id="feedback-panel" 
                  role="tabpanel" 
                  aria-labelledby="feedback-tab" 
                  className='h-96 overflow-y-auto p-6'
                >
                  <ReactMarkdown className="prose prose-sm max-w-none text-dark leading-relaxed">
                    {critique}
                  </ReactMarkdown>
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div 
                  id="suggestions-panel" 
                  role="tabpanel" 
                  aria-labelledby="suggestions-tab" 
                  className='h-96 overflow-y-auto p-6'
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : error ? (
                    <ErrorDisplay error={error}/>
                  ) : suggestions ? (
                    <ReactMarkdown className="prose prose-sm max-w-none text-dark leading-relaxed">
                      {suggestions}
                    </ReactMarkdown>
                  ) : (
                    <SkeletonLoader />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-4 justify-center mt-8'>
            <button
              onClick={() => setShowResources(!showResources)}
              className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 shadow-md hover:shadow-lg"
              aria-pressed={showResources}
              aria-label={showResources ? "Hide Resources" : "Show Resources"}
            >
              {showResources ? 'Hide Resources' : 'Search Resources'}
            </button>
            
            <button
              onClick={handleNewPhoto}
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 shadow-md hover:shadow-lg"
              aria-label="Submit Another Photo"
            >
              Submit Another Photo
            </button>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      {showResources && (
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <Resources critique={critique} suggestions={suggestions} />
          </div>
        </div>
      )}
    </div>
  );
});

Feedback.displayName = 'Feedback';

export default Feedback;