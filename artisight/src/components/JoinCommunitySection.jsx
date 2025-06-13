
import { Camera, Users } from 'lucide-react';

const JoinCommunitySection = () => {
  return (
    <section 
      id="community"
      className="py-20 mx-4 rounded-3xl my-12"
      aria-labelledby="community-heading"
    >
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 px-8">
        <div className="flex justify-center items-center max-w-md lg:max-w-lg">
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-xl">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i}
                    className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center"
                  >
                    <Camera className="w-6 h-6 text-gray-500" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">10,000+ photographers</span>
                </div>
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center lg:text-left flex flex-col p-6 max-w-lg">
          <h2 
            id="community-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight"
          >
            Join thousands of shutterbugs
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            who have improved their photography skills with our AI personalized feedback and curated resources
          </p>
          <div className="flex justify-center lg:justify-start">
            <button 
              onClick={() => window.location.href = '/upload'}
              className="bg-primary py-4 px-8 text-white font-bold rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 shadow-lg hover:shadow-xl"
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunitySection;
