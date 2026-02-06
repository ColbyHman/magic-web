import React from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, BookOpenIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { useAccentColors } from '../utils/useAccentColors';

export const Home: React.FC = () => {
  const accentColors = useAccentColors();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className={`text-6xl font-bold text-white mb-4 ${accentColors.gradientLight} bg-clip-text text-transparent`}>
            Magic Web
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your digital Magic: The Gathering battlefield
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Home Section */}
          <div className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-600 border-opacity-30 hover:${accentColors.borderPrimary} hover:border-opacity-50 transition-all duration-300`}>
            <div className={`flex items-center justify-center w-12 h-12 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg mb-4 mx-auto`}>
              <PlayIcon className={`h-6 w-6 ${accentColors.textPrimary}`} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 text-center">Home</h2>
            <p className="text-gray-300 text-center mb-4">
              Welcome to your command center. Start a new game or continue where you left off.
            </p>
            <div className="text-center">
              <Link
                to="/"
                className={`inline-block px-4 py-2 ${accentColors.bgPrimary} text-gray-900 rounded-lg ${accentColors.bgPrimaryHover} transition-colors duration-200 font-semibold`}
              >
                You're Here
              </Link>
            </div>
          </div>

          {/* My Library Section */}
          <div className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-600 border-opacity-30 hover:${accentColors.borderPrimary} hover:border-opacity-50 transition-all duration-300`}>
            <div className={`flex items-center justify-center w-12 h-12 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg mb-4 mx-auto`}>
              <BookOpenIcon className={`h-6 w-6 ${accentColors.textPrimary}`} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 text-center">Card Vault</h2>
            <p className="text-gray-300 text-center mb-4">
              Browse and manage your comprehensive card collection. Track your valuable assets.
            </p>
            <div className="text-center">
              <Link
                to="/library"
                className={`inline-block px-4 py-2 ${accentColors.bgPrimary} text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors duration-200 font-semibold`}
              >
                Browse Vault
              </Link>
            </div>
          </div>

          {/* My Games Section */}
          <div className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-600 border-opacity-30 hover:${accentColors.borderPrimary} hover:border-opacity-50 transition-all duration-300`}>
            <div className={`flex items-center justify-center w-12 h-12 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg mb-4 mx-auto`}>
              <CpuChipIcon className={`h-6 w-6 ${accentColors.textPrimary}`} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 text-center">My Games</h2>
            <p className="text-gray-300 text-center mb-4">
              Jump into the action. Access your games and start playing immediately.
            </p>
            <div className="text-center">
              <Link
                to="/games/battlefield"
                className={`inline-block px-4 py-2 ${accentColors.bgPrimary} text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors duration-200 font-semibold`}
              >
                Play Battlefield
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Use the hamburger menu in the top-left corner to navigate between sections.
          </p>
        </div>
      </div>
    </div>
  );
};