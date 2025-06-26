import PropTypes from 'prop-types';

const LinkCard = ({ title, thumbnail, link }) => {
    // Ensure the link has a protocol for window.open
    const safeLink = link && !/^https?:\/\//i.test(link) ? `https://${link}` : link;

    const handleVisitLink = (e) => {
        e.preventDefault();
        if (safeLink) {
            window.open(safeLink, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="group relative w-full h-96 rounded-3xl overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl border border-gray-200/50 bg-white backdrop-blur-sm">
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            
            {/* Image container with enhanced styling */}
            <div className="relative w-full h-2/3 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                    src={thumbnail} 
                    alt={title}
                    loading="lazy"
                />
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </div>
            
            {/* Content section with improved spacing and typography */}
            <div className="relative px-6 py-5 h-1/3 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50/50">
                <div className="space-y-2">
                    <h3 className="font-bold text-xl leading-tight text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {title}
                    </h3>
                </div>
                
                {/* Enhanced CTA button */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        tabIndex={0}
                        aria-label={`Visit ${title}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm rounded-full hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl group/button"
                        onClick={handleVisitLink}
                        disabled={!safeLink}
                    >
                        <span>Visit Link</span>
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

LinkCard.propTypes = {
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
};

export default LinkCard;