import { Upload, Brain, BookOpen } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Upload className="w-12 h-12" />,
      title: "Get feedback in minutes",
      description: "Choose a photo, upload it and receive personalized feedback within minutes.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: "AI-powered feedback",
      description: "Our AI analyzes your work for composition, lighting, color, subject matter, and more.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Learning resources",
      description: "Search for resources like YouTube tutorials, blogs, articles to level up your photography skills.",
      color: "from-pink-500 to-red-600"
    }
  ];

  return (
    <section 
      id="how-it-works" 
      className="container mx-auto px-8 py-20 lg:px-16"
      aria-labelledby="how-it-works-heading"
    >
      <h2 
        id="how-it-works-heading"
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-8 text-center"
      >
        How it works
      </h2>
      <p className="text-lg md:text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
        Upload a photo, receive constructive, personalized feedback and get resources to improve your photography skills from our AI in three simple steps.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="text-center group hover:transform hover:scale-105 transition-all duration-300"
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
              {step.icon}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default HowItWorksSection;
