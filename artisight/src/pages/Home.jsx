import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorksSection from  '../components/HowItWorksSection';
import JoinCommunitySection from '../components/JoinCommunitySection';
import Footer from '../components/Footer';
import Example from '../components/Example';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Camera } from 'lucide-react';

// Lazy load heavy components
const LazyExample = lazy(() => Promise.resolve({ default: Example }));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Image component with lazy loading
const LazyImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          const img = imgRef.current;
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <img
        ref={imgRef}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        loading="lazy"
        {...props}
      />
      {isError && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

// Home component
const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <HowItWorksSection />
        <Suspense fallback={<LoadingSpinner />}>
          <LazyExample />
        </Suspense>
        <JoinCommunitySection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;