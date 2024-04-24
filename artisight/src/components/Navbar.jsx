import React, { useState } from 'react';
import { List, X } from '@phosphor-icons/react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="py-4 w-full flex items-center justify-between sm:justify-around text-light">
      <div className="text-xl font-bold p-4">
        <a href="/" className="text-primary hover:text-secondary transition duration-300 flex items-center gap-2">
          <img src='/favicon-32x32.png'/>ArtiSight
        </a>
      </div>
      <div className="sm:hidden px-2">
        <button onClick={toggleMenu} className="text-primary">
          {isMenuOpen ? <X size={32} /> : <List size={32} />}
        </button>
      </div>
      {/* Conditional rendering for responsive menu */}
      <nav className={`${
          isMenuOpen ? 'flex' : 'hidden'
        } absolute top-16 right-4 min-w-[140px] bg-white shadow-lg rounded-lg flex-col items-center sm:flex sm:flex-row sm:static sm:shadow-none sm:p-0 sm:bg-transparent sm:min-w-0 z-10`}>
        <a href="#how-it-works" className="text-gray-600 hover:text-dark transition duration-300 p-2 sm:p-4">How it works</a>
        <a href="#examples" className="text-gray-600 hover:text-dark transition duration-300 p-2 sm:p-4">Examples</a>
        <a href="#help" className="text-gray-600 hover:text-dark transition duration-300 p-2 sm:p-4">Help</a>
        {/* <button className="bg-primary text-light px-3 py-2 rounded-2xl m-2 hover:bg-secondary transition duration-300">Sign up</button>
        <button className="text-dark bg-gray-200 px-3 py-2 rounded-2xl m-2 hover:bg-gray-300 transition duration-300">Login</button> */}
      </nav>
    </header>
  );
};

export default Navbar;
