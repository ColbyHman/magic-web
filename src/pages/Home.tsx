import React from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, BookOpenIcon, CpuChipIcon } from '@heroicons/react/24/outline';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Magic Web
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your digital Magic: The Gathering battlefield
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Home Section */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-600 border-opacity-30 hover:border-yellow-400 hover:border-opacity-50 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-lg mb-4 mx-auto">
              <PlayIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 text-center">Home</h2>
            <p className="text-gray-300 text-center mb-4">
              Welcome to your command center. Start a new game or continue where you left off.
            </p>
            <div className="text-center">
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors duration-200 font-semibold"
              >
                You're Here
              </Link>
            </div>
          </div>

          {/* My Library Section */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-600 border-opacity-30 hover:border-blue-400 hover:border-opacity-50 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg mb-4 mx-auto">
              <BookOpenIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 text-center">My Library</h2>
            <p className="text-gray-300 text-center mb-4">
              Browse and manage your card collection. Build decks and explore your library.
            </p>
            <div className="text-center">
              <Link
                to="/library"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors duration-200 font-semibold"
              >
                Browse Library
              </Link>
            </div>
          </div>

          {/* My Games Section */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-600 border-opacity-30 hover:border-green-400 hover:border-opacity-50 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg mb-4 mx-auto">
              <CpuChipIcon className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 text-center">My Games</h2>
            <p className="text-gray-300 text-center mb-4">
              Jump into the action. Access your games and start playing immediately.
            </p>
            <div className="text-center">
              <Link
                to="/games/battlefield"
                className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors duration-200 font-semibold"
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