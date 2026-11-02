import Navbar from '../components/Navbar';
import Uploading from '../components/Uploading';
import HowItWorksSection from '../components/HowItWorksSection';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Upload = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <SEO
        title="Upload Photograph"
        description="Upload your JPEG, PNG, or WebP photograph for instant multimodal AI critique, OpenCV exposure histogram analysis, and personalized practice exercises."
        canonical="https://artisight.netlify.app/upload"
      />
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Uploading />
        <div className="bg-slate-50 border-t border-slate-200/80">
          <HowItWorksSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upload;
