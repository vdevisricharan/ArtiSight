import { useState, useEffect, useRef } from 'react';
import { List, X, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

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
        block: 'start',
      });
    }
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 py-3.5 w-full flex items-center justify-between px-6 sm:px-12 lg:px-20 shadow-sm transition-all duration-300">
      <div className="text-xl font-bold">
        <Link
          to="/"
          className="text-gray-900 hover:text-blue-600 transition-all duration-300 flex items-center gap-2 rounded-lg py-1"
          aria-label="ArtiSight Home"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold tracking-tight">ArtiSight</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
            2.0
          </span>
        </Link>
      </div>

      <div className="sm:hidden px-2">
        <button
          onClick={toggleMenu}
          className="text-gray-700 rounded-lg p-2 transition-colors duration-200"
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
        } absolute top-16 right-4 min-w-[200px] bg-white shadow-xl rounded-2xl border border-gray-100 flex-col items-center sm:flex sm:flex-row sm:static sm:shadow-none sm:p-0 sm:bg-transparent sm:min-w-0 sm:border-0 z-50 gap-1 sm:gap-2`}
        aria-label="Main navigation"
      >
        <button
          onClick={() => scrollToSection('how-it-works')}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all p-2.5 sm:px-3 text-xs font-semibold rounded-lg w-full sm:w-auto text-left sm:text-center"
        >
          How it Works
        </button>
        <button
          onClick={() => scrollToSection('capabilities')}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all p-2.5 sm:px-3 text-xs font-semibold rounded-lg w-full sm:w-auto text-left sm:text-center"
        >
          Capabilities
        </button>
        <button
          onClick={() => scrollToSection('examples')}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all p-2.5 sm:px-3 text-xs font-semibold rounded-lg w-full sm:w-auto text-left sm:text-center"
        >
          Workflow
        </button>
        <button
          onClick={() => navigate('/upload')}
          className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full shadow-sm transition-all"
        >
          Analyze Photo
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
