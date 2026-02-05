import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface HamburgerMenuProps {
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  

  return (
    <div className={`fixed top-4 left-4 z-50 ${className}`}>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="p-2 bg-black bg-opacity-50 hover:bg-opacity-60 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Pop-over menu */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-64 bg-black bg-opacity-80 backdrop-blur-md rounded-lg shadow-2xl border border-gray-600 border-opacity-30 overflow-hidden z-50">
          <div className="py-2">
            <Link
              to="/"
              className="block px-4 py-3 text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/library"
              className="block px-4 py-3 text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
            >
              Card Vault
            </Link>
            <div className="border-t border-gray-600 border-opacity-30 my-2"></div>
            <div className="px-4 py-2 text-gray-400 text-sm font-semibold">
              My Games
            </div>
            <Link
              to="/games/battlefield"
              className="block px-6 py-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200 ml-4"
            >
              Battlefield
            </Link>
          </div>
        </div>
      )}

      
    </div>
  );
};