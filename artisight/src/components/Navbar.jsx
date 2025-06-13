import { useState, useEffect, useRef } from 'react';
import { List, X, Camera } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', closeMenu);
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-4 w-full flex items-center justify-between sm:justify-around">
      <div className="text-xl font-bold p-4">
        <a 
          href="/" 
          className="text-primary hover:text-secondary transition-all duration-300 flex items-center gap-2 rounded-lg px-2 py-1"
          aria-label="ArtiSight Home"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          ArtiSight
        </a>
      </div>
      
      <div className="sm:hidden px-2">
        <button 
          onClick={toggleMenu} 
          className="text-primary rounded-lg p-2 transition-colors duration-200"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isMenuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      <nav 
        ref={menuRef}
        id="mobile-menu"
        className={`${
          isMenuOpen ? 'flex' : 'hidden'
        } absolute top-16 right-4 min-w-[180px] bg-white shadow-xl rounded-xl border border-gray-100 flex-col items-center sm:flex sm:flex-row sm:static sm:shadow-none sm:p-0 sm:bg-transparent sm:min-w-0 sm:border-0 z-50`}
        aria-label="Main navigation"
      >
        <button 
          onClick={() => scrollToSection('how-it-works')}
          className="text-gray-700 hover:text-primary hover:bg-gray-50 transition-all duration-200 p-3 sm:p-4 w-full sm:w-auto text-left sm:text-center rounded-lg"
        >
          How it works
        </button>
        <button 
          onClick={() => scrollToSection('examples')}
          className="text-gray-700 hover:text-primary hover:bg-gray-50 transition-all duration-200 p-3 sm:p-4 w-full sm:w-auto text-left sm:text-center rounded-lg"
        >
          Examples
        </button>
        <button 
          onClick={() => scrollToSection('community')}
          className="text-gray-700 hover:text-primary hover:bg-gray-50 transition-all duration-200 p-3 sm:p-4 w-full sm:w-auto text-left sm:text-center rounded-lg"
        >
          Community
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
