import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Girishgangadharan,
  KKSenthil_Kumar,
  Pc_sreeram,
  PSVinod,
  Rathnavelu_dop,
  Ravi_k__chandran,
  Ravi_Varman,
  Sivan,
  sudeep
} from '../assets';

const photographerImages = [
  Girishgangadharan,
  KKSenthil_Kumar,
  Pc_sreeram,
  PSVinod,
  Rathnavelu_dop,
  Ravi_k__chandran,
  Ravi_Varman,
  Sivan,
  sudeep
];

const JoinCommunitySection = () => {
  const navigate = useNavigate();

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
                {photographerImages.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={img}
                      alt="Photographer"
                      className="object-cover w-full h-full rounded-lg"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-lg font-medium text-gray-700">26+ photographers</span>
                </div>
                <div className="flex -space-x-2">
                  {photographerImages.slice(0, 4).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Photographer"
                      className="w-8 h-8 object-cover rounded-full border-2 border-white"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center lg:text-left flex flex-col p-6 max-w-lg">
          <h2
            id="community-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 lg:leading-tight bg-gradient-to-r from-gray-800 via-gray-900 to-blue-800 bg-clip-text text-transparent"
          >
            Join thousands of shutterbugs
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
            who have improved their photography skills with our AI personalized feedback and curated resources
          </p>
          <div className="flex justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
              aria-describedby="join-community-description">
              Get started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunitySection;
