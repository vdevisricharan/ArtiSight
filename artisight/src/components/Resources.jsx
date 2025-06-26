import LinkCard from './LinkCard';
import { useSelector } from 'react-redux';
import { selectResources } from '../redux/imageSlice';

const Resources = () => {
    const cachedResources = useSelector(selectResources);
    const critique = useSelector((state) => state.image.critique);
    const suggestions = useSelector((state) => state.image.suggestions);

    // Fallback for missing data
    if (!critique || !suggestions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-8 lg:px-20">
                <div className='px-5 lg:px-10'>
                    {/* Enhanced header with gradient text */}
                    <div className="text-center mb-12">
                        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent">
                            Resources
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </div>
                    
                    {/* Enhanced empty state */}
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8">
                            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Resources Available</h3>
                        <p className="text-lg text-gray-600 max-w-md text-center leading-relaxed">
                            We need your critique and suggestions to fetch personalized resources for you.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const resources = (cachedResources &&
        cachedResources.critique === critique &&
        cachedResources.suggestions === suggestions)
        ? cachedResources.webResults
        : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-8 lg:px-20">
            <div className='px-5 lg:px-10'>
                {/* Enhanced header section */}
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent">
                        Curated Resources
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Discover handpicked resources tailored to enhance your photography skills
                    </p>
                </div>
                
                {resources.length > 0 ? (
                    <div>
                        {/* Resource count indicator */}
                        <div className="flex items-center justify-center mb-12">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-gray-700 font-medium">
                                    {resources.length} resource{resources.length !== 1 ? 's' : ''} found
                                </span>
                            </div>
                        </div>
                        
                        {/* Enhanced grid with staggered animations */}
                        <div 
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" 
                            role="list"
                        >
                            {resources.map((resource, index) => (
                                <div 
                                    key={index}
                                    className="animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <LinkCard
                                        title={resource.title}
                                        thumbnail={resource.thumbnail}
                                        link={resource.link}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Enhanced loading/empty state */
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-8"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-300 rounded-full animate-spin animation-delay-150"></div>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Bob is Working His Magic ✨</h3>
                        <p className="text-lg text-gray-600 max-w-md text-center leading-relaxed mb-8">
                            Our photography expert Bob is busy curating resources for other photographers. 
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>Please try again in a few moments</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Resources;