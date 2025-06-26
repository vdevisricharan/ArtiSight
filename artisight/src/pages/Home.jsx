import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorksSection from  '../components/HowItWorksSection';
import JoinCommunitySection from '../components/JoinCommunitySection';
import Footer from '../components/Footer';
import Example from '../components/Example';
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const LazyExample = lazy(() => Promise.resolve({ default: Example }));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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