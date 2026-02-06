import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <>
      {/* Hamburger button */}
      <div className={`fixed top-4 left-4 z-50 ${className}`}>
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
      </div>

      {/* Sliding Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleMenu}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-gray-900 bg-opacity-95 backdrop-blur-md shadow-2xl border-r border-gray-600 border-opacity-30 z-50"
            >
              <div className="p-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button
                    onClick={toggleMenu}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close menu"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  <Link
                    to="/"
                    onClick={toggleMenu}
                    className="block px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
                  >
                    Home
                  </Link>
                  <Link
                    to="/profile"
                    onClick={toggleMenu}
                    className="block px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/library"
                    onClick={toggleMenu}
                    className="block px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
                  >
                    Card Vault
                  </Link>
                  
                  <div className="border-t border-gray-600 border-opacity-30 my-4"></div>
                  
                  <div className="px-4 py-2 text-gray-400 text-sm font-semibold mb-2">
                    My Games
                  </div>
                  <Link
                    to="/games/battlefield"
                    onClick={toggleMenu}
                    className="block px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 ml-4"
                  >
                    Battlefield
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};