import Navbar from '../components/Navbar';
import Feedback from '../components/Feedback';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Critique = () => {
  return (
    <div>
      <SEO
        title="Photo Critique & Analysis Dashboard"
        description="Review your structured AI photo critique report, 6-dimension rubric scores, OpenCV histogram analysis, and targeted practice assignments."
        canonical="https://artisight.netlify.app/feedback"
        robots="noindex, follow"
      />
      <Navbar />
      <Feedback />
      <Footer />
    </div>
  );
};

export default Critique;
