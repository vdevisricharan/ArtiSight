import { Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: <Instagram size={24} />, href: "https://instagram.com", label: "Instagram" },
    { icon: <Twitter size={24} />, href: "https://twitter.com", label: "Twitter" },
    { icon: <Facebook size={24} />, href: "https://facebook.com", label: "Facebook" },
    { icon: <Linkedin size={24} />, href: "https://linkedin.com", label: "LinkedIn" }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16" role="contentinfo">
      <div className="container mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-xl mb-6 text-white">About ArtiSight</h3>
          <p className="text-gray-300 leading-relaxed">
            Empowering photographers worldwide by providing AI-powered tools, insights, and resources to elevate their craft.
          </p>
        </div>
        
        <div>
          <h3 className="font-bold text-xl mb-6 text-white">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-300 hover:text-primary transition-colors duration-200 focus:outline-none focus:text-primary"
              >
                How it Works
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('examples')}
                className="text-gray-300 hover:text-primary transition-colors duration-200 focus:outline-none focus:text-primary"
              >
                Examples
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('community')}
                className="text-gray-300 hover:text-primary transition-colors duration-200 focus:outline-none focus:text-primary"
              >
                Community
              </button>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-xl mb-6 text-white">Follow Us</h3>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-gray-300 hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg p-2"
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-xl mb-6 text-white">Contact Us</h3>
          <p className="text-gray-300 leading-relaxed">
            Feel free to reach out via email or social media for any inquiries about improving your photography.
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-12 pt-8 text-center">
        <p className="text-gray-400">
          © {new Date().getFullYear()} ArtiSight. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
