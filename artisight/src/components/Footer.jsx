import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-8">
            <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
                <div>
                    <h2 className="font-bold text-lg mb-4">About Us</h2>
                    <p>Empowering photographers worldwide by providing tools, insights, and resources to elevate their craft.</p>
                </div>
                <div>
                    <h2 className="font-bold text-lg mb-4">Quick Links</h2>
                    <ul>
                        <li><a href="#how-it-works" className="hover:text-secondary transition duration-300">How it Works</a></li>
                        <li><a href="#pricing" className="hover:text-secondary transition duration-300">Pricing</a></li>
                        <li><a href="#examples" className="hover:text-secondary transition duration-300">Examples</a></li>
                        <li><a href="#help" className="hover:text-secondary transition duration-300">Help</a></li>
                    </ul>
                </div>
                <div>
                    <h2 className="font-bold text-lg mb-4">Follow Us</h2>
                    <div className="flex justify-center sm:justify-start">
                        <a href="https://instagram.com" className="text-light hover:text-primary mr-2"><FaInstagram size={32}/></a>
                        <a href="https://twitter.com" className="text-light hover:text-primary mx-2"><FaTwitter size={32}/></a>
                        <a href="https://facebook.com" className="text-light hover:text-primary mx-2"><FaFacebookF size={32}/></a>
                        <a href="https://linkedin.com" className="text-light hover:text-primary ml-2"><FaLinkedinIn size={32}/></a>
                    </div>
                </div>
                <div>
                    <h2 className="font-bold text-lg mb-4">Contact Us</h2>
                    <p>Feel free to reach out via email or social media for any inquiries.</p>
                </div>
            </div>
            <div className="text-center text-gray-600 mt-8">
                © {new Date().getFullYear()} ArtiSight. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
