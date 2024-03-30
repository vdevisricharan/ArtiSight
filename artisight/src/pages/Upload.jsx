import React from 'react';
import Navbar from '../components/Navbar';
import Uploading from '../components/Uploading';
import HowItWorksSection from  '../components/HowItWorksSection';
import Footer from '../components/Footer';

const Upload = () => {
  return (
    <div className=''>
      <Navbar />
      <Uploading />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Upload;