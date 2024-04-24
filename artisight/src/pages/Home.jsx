import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorksSection from  '../components/HowItWorksSection';
import JoinCommunitySection from '../components/JoinCommunitySection';
import Footer from '../components/Footer';
import Example from '../components/Example';


const Home = () => {
    return (
        <div className="">
            <Navbar />
            <Hero />
            <HowItWorksSection />
            <Example/>
            <JoinCommunitySection />
            <Footer/>
        </div>
    );
};

export default Home;