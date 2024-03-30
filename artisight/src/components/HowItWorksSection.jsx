import React from 'react';
import { howItWorks } from '../assets';

const HowItWorksSection = () => {
    return (
        <div className="container mx-auto px-8 py-20" id='how-it-works'>
            <h2 className="text-4xl font-bold text-primary mb-8 text-left font-sans">How it works</h2>
            <p className="text-lg text-left text-dark mb-6 font-sans">Upload a photo, receive constructive, personalized feedback and get resources to improve your photography skills from our AI in three simple steps.</p>
            <div className="flex flex-col sm:flex-row gap-8 items-center justify-start">
                <div className="w-full sm:w-1/3 text-left py-4">
                    <img src={howItWorks} alt="Step 1" className="mx-auto rounded-2xl bg-contain" />
                    <p className="text-dark mt-4 font-bold text-xl font-sans">Get feedback in minutes</p>
                    <p className='text-lg mt-4 text-gray-600 font-sans'>Choose a photo, Upload it and receive personalized feedback within minutes.</p>
                </div>
                <div className="w-full sm:w-1/3 text-left py-4">
                    <img src={howItWorks} alt="Step 2" className="mx-auto rounded-2xl" />
                    <p className="text-dark mt-4 font-bold text-xl font-sans">AI-powered feedback</p>
                    <p className='text-lg mt-4 text-gray-600 font-sans'>Our AI analyzes your work for composition, lighting, color, subject matter, and more.</p>
                </div>
                <div className="w-full sm:w-1/3 text-left py-4">
                    <img src={howItWorks} alt="Step 3" className="mx-auto rounded-2xl" />
                    <p className="text-dark mt-4 font-bold text-xl font-sans">Resources</p>
                    <p className='text-lg mt-4 text-gray-600 font-sans'>Search for resources like YouTube Tutorials, Blogs, Articles to level up your photography skills.</p>
                </div>
            </div>
        </div>
    );
}

export default HowItWorksSection;
