
const Hero = () => {
  return (
    <section className="text-white mx-4 md:mx-8 lg:mx-20 my-8" aria-labelledby="hero-heading">
      <div className="rounded-3xl py-24 md:py-36 lg:py-56 px-8 md:px-24 lg:px-48 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h1 
            id="hero-heading"
            className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
          >
            Get constructive feedback on your photos and helpful resources
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl my-5 md:my-8 lg:my-10 leading-relaxed opacity-90">
            Level up your photography skills with AI-powered insights
          </p>
          <button 
            onClick={() => window.location.href = '/upload'}
            className="bg-white text-primary py-4 px-8 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 shadow-lg hover:shadow-xl"
            aria-describedby="hero-description"
          >
            Submit for review
          </button>
          <p id="hero-description" className="sr-only">
            Click to upload your photo and receive AI-powered feedback
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
