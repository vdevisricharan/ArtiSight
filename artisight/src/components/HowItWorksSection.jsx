import React from 'react';
import { howItWorks, howItWorks1, howItWorks2 } from '../assets';

const HowItWorksSection = () => {
    return (
        <div className="container mx-auto px-8 py-20 lg:px-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-8 text-left font-sans">How it works</h2>
            <p className="text-md md:text-lg lg:text-xl text-left text-dark mb-6 font-sans">Upload a photo, receive constructive, personalized feedback and get resources to improve your photography skills from our AI in three simple steps.</p>
            <div className="flex flex-col sm:flex-row gap-8 items-center justify-start">
                <div className="w-full sm:w-1/3 text-left py-4">
                    <img src={howItWorks} alt="Step 1" className="mx-auto rounded-2xl bg-contain" />
                    <p className="text-dark mt-4 font-bold text-lg md:text-xl lg:text-2xl">Get feedback in minutes</p>
                    <p className='text-md md:text-lg lg:text-xl mt-4 text-gray-600'>Choose a photo, Upload it and receive personalized feedback within minutes.</p>
                </div>
                <div className="w-full sm:w-1/3 text-left py-4">
                    <img src={howItWorks1} alt="Step 2" className="mx-auto rounded-2xl" />
                    <p className="text-dark mt-4 font-bold text-lg md:text-xl lg:text-2xl">AI-powered feedback</p>
                    <p className='text-md md:text-lg lg:text-xl mt-4 text-gray-600'>Our AI analyzes your work for composition, lighting, color, subject matter, and more.</p>
                </div>
                <div className="w-full sm:w-1/3 text-left py-4">
                    <img src={howItWorks2} alt="Step 3" className="mx-auto rounded-2xl" />
                    <p className="text-dark mt-4 font-bold text-lg md:text-xl lg:text-2xl">Resources</p>
                    <p className='text-md md:text-lg lg:text-xl mt-4 text-gray-600'>Search for resources like YouTube Tutorials, Blogs, Articles to level up your photography skills.</p>
                </div>
            </div>
        </div>
    );
}

export default HowItWorksSection;
