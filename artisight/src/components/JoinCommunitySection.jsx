import React from 'react';
import { community } from '../assets';
import { Link } from 'react-router-dom';
const JoinCommunitySection = () => {
    return (
        <div className="bg-light py-20 flex flex-col md:flex-row items-center justify-center gap-x-10 gap-y-5">
            <div className="flex justify-center items-center max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl pl-2">
                <img src={community} alt="Community" className='w-full h-auto rounded-2xl shadow-lg' />
            </div>
            <div className="text-center flex flex-col p-6 w-full md:w-3/4 lg:w-1/2">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-8 leading-loose">Join the thousands of shutterbugs</h2>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8">who have improved their photography skills with our AI Personalized Feedback and Photography Resources</p>
                <div className="flex justify-center">
                    <Link to='/upload'><button className="bg-primary py-4 px-8 text-white font-bold rounded-full hover:bg-secondary transition duration-300">Get started</button></Link>
                </div>
            </div>
        </div>
    ); 
}
export default JoinCommunitySection;
