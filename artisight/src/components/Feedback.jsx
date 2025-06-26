import { useState, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSuggestions,
  setResources,
  selectUploadedImage,
  selectCritique,
  selectSuggestions,
  resetImageState
} from '../redux/imageSlice';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Resources from './Resources';
import axios from 'axios';
import PropTypes from 'prop-types';

// Enhanced Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-300 rounded-full animate-spin animation-delay-150"></div>
    </div>
    <div className="text-center">
      <p className="text-xl font-semibold text-gray-800 mb-2">Analyzing your photo...</p>
      <p className="text-gray-600">Our AI is crafting personalized suggestions</p>
    </div>
  </div>
);

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="p-8 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/50 rounded-2xl backdrop-blur-sm">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-800 mb-1">Oops! Something went wrong</h3>
        <p className="text-red-600" role="alert">{error}</p>
      </div>
    </div>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Try Again
    </button>
  </div>
);

ErrorDisplay.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

const Feedback = memo(() => {
  const dispatch = useDispatch();
  const uploadedImage = useSelector(selectUploadedImage);
  const critique = useSelector(selectCritique);
  const suggestions = useSelector(selectSuggestions);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');
  const [showResources, setShowResources] = useState(false);
  const [hasRequestedSuggestions, setHasRequestedSuggestions] = useState(false);

  const navigate = useNavigate();

  // Fetch suggestions and then resources
  const fetchSuggestions = useCallback(async () => {
    if (!critique) return;

    setLoading(true);
    setError('');

    try {
      // 1. Fetch suggestions
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/suggest`,
        { critique },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const { suggestions: newSuggestions } = response.data;
      if (!newSuggestions) {
        throw new Error('No suggestions received from server');
      }

      dispatch(setSuggestions(newSuggestions));
      setHasRequestedSuggestions(true);

      // 2. Fetch resources immediately after suggestions
      const resourcesResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/resources`,
        {
          critique,
          suggestions: newSuggestions,
          maxResults: 2
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      const { webResults } = resourcesResponse.data;
      if (!webResults || !Array.isArray(webResults)) {
        throw new Error('Invalid response format from server');
      }

      dispatch(setResources({
        critique,
        suggestions: newSuggestions,
        webResults
      }));

    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        error.message ||
        'Failed to fetch suggestions/resources. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, critique]);

  // Handle suggestions button click
  const handleGetSuggestions = useCallback(() => {
    if (!suggestions) {
      fetchSuggestions();
    } else {
      setActiveTab('suggestions');
    }
  }, [suggestions, fetchSuggestions]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8 mx-auto">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Photo Uploaded</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">Upload your photography masterpiece to get AI-powered feedback and personalized suggestions</p>
          <Link to="/upload">
            <button className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Start Uploading
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className='flex flex-col lg:flex-row items-start justify-center p-8 lg:px-20 max-w-7xl mx-auto gap-12'>
        {/* Image Section */}
        <div className='flex flex-col items-center lg:items-start justify-start w-full lg:w-1/2'>
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent">
              Your Masterpiece
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto lg:mx-0"></div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
            <div className="relative bg-white p-4 rounded-3xl shadow-2xl">
              <img 
                src={uploadedImage} 
                alt="Uploaded preview" 
                className="rounded-2xl max-w-full h-auto shadow-lg transition-transform duration-500 group-hover:scale-[1.02]" 
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className='flex flex-col items-center lg:items-start justify-start w-full lg:w-1/2'>
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent">
              AI Analysis
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto lg:mx-0"></div>
          </div>
          
          {/* Enhanced Tab Navigation */}
          <div className="w-full">
            <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50 shadow-lg mb-6" role="tablist" aria-label="Feedback and Suggestions Tabs">
              <button
                onClick={() => handleTabChange('feedback')}
                onKeyDown={(e) => handleKeyDown(e, 'feedback')}
                className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 flex-1 justify-center ${
                  activeTab === 'feedback' 
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
                role="tab"
                aria-selected={activeTab === 'feedback'}
                aria-controls="feedback-panel"
                id="feedback-tab"
                tabIndex={0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Feedback
              </button>
              <button
                onClick={() => handleTabChange('suggestions')}
                onKeyDown={(e) => handleKeyDown(e, 'suggestions')}
                className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 flex-1 justify-center ${
                  activeTab === 'suggestions' 
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
                role="tab"
                aria-selected={activeTab === 'suggestions'}
                aria-controls="suggestions-panel"
                id="suggestions-tab"
                tabIndex={0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Suggestions
              </button>
            </div>

            {/* Enhanced Tab Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              {activeTab === 'feedback' && (
                <div 
                  id="feedback-panel" 
                  role="tabpanel" 
                  aria-labelledby="feedback-tab" 
                  className='h-96 overflow-y-auto'
                >
                  <div className="p-8">
                    <ReactMarkdown className="prose prose-lg max-w-none text-gray-800 leading-relaxed prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700">
                      {critique}
                    </ReactMarkdown>
                    {!suggestions && !loading && !hasRequestedSuggestions && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready for the next level?</h3>
                        <p className="text-gray-600 mb-6">Get personalized improvement suggestions tailored to your photo</p>
                        <button
                          onClick={handleGetSuggestions}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                          aria-label="Get Improvement Suggestions"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Get AI Suggestions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div 
                  id="suggestions-panel" 
                  role="tabpanel" 
                  aria-labelledby="suggestions-tab" 
                  className='h-96 overflow-y-auto'
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : error ? (
                    <div className="p-8">
                      <ErrorDisplay 
                        error={error} 
                        onRetry={fetchSuggestions}
                      />
                    </div>
                  ) : suggestions ? (
                    <div className="p-8">
                      <ReactMarkdown className="prose prose-lg max-w-none text-gray-800 leading-relaxed prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700">
                        {suggestions}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">No suggestions yet</h3>
                      <p className="text-gray-600 mb-8">Click below to get personalized improvement recommendations</p>
                      <button
                        onClick={handleGetSuggestions}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                        aria-label="Get Improvement Suggestions"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Suggestions
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className='flex flex-wrap gap-4 justify-center lg:justify-start mt-12'>
            <button
              onClick={() => setShowResources(!showResources)}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                showResources 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              }`}
              aria-pressed={showResources}
              aria-label={showResources ? "Hide Resources" : "Show Resources"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {showResources ? 'Hide Resources' : 'Explore Resources'}
            </button>
            
            <button
              onClick={handleNewPhoto}
              className="inline-flex items-center gap-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 bg-white/80 backdrop-blur-sm"
              aria-label="Submit Another Photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit Another Photo
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Resources Section */}
      {showResources && (
        <div className="border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
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