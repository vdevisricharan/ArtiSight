import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className="text-light mx-4 md:mx-8 lg:mx-20">
            <div className="rounded-2xl py-24 md:py-36 lg:py-56 px-8 md:px-24 lg:px-48 bg-cover bg-center bg-hero">
                <p className="text-3xl md:text-4xl lg:text-6xl font-bold">Get constructive feedback on your photos and helpful resources</p>
                <p className="text-xl md:text-2xl lg:text-3xl my-5 md:my-8 lg:my-10 leading-tight">Level up your photography skills</p>
                <Link to='/upload'><button className="bg-primary py-4 px-8 text-white font-semibold rounded-full hover:bg-secondary transition duration-300">Submit for review</button></Link>
            </div>
        </div>
    );
}

export default Hero;
