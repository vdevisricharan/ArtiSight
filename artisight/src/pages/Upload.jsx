import Navbar from '../components/Navbar';
import Uploading from '../components/Uploading';
import HowItWorksSection from '../components/HowItWorksSection';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Upload = () => {
  return (
    <div className="">
      <SEO
        title="Upload Photograph"
        description="Upload your JPEG, PNG, or WebP photograph for instant multimodal AI critique, OpenCV exposure histogram analysis, and personalized practice exercises."
        canonical="https://artisight.netlify.app/upload"
      />
      <Navbar />
      <Uploading />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Upload;
