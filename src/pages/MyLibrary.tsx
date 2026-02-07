import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Sample card data - in a real app this would come from an API or store
const sampleCards = [
  { id: '1', name: 'Lightning Bolt', type: 'Instant', cost: '{R}', color: 'Red' },
  { id: '2', name: 'Counterspell', type: 'Instant', cost: '{U}{U}', color: 'Blue' },
  { id: '3', name: 'Dark Ritual', type: 'Instant', cost: '{B}', color: 'Black' },
  { id: '4', name: 'Giant Growth', type: 'Instant', cost: '{G}', color: 'Green' },
  { id: '5', name: 'Swords to Plowshares', type: 'Instant', cost: '{W}', color: 'White' },
  { id: '6', name: 'Sol Ring', type: 'Artifact', cost: '{1}', color: 'Colorless' },
  { id: '7', name: 'Ancestral Recall', type: 'Instant', cost: '{U}', color: 'Blue' },
  { id: '8', name: 'Black Lotus', type: 'Artifact', cost: '{0}', color: 'Colorless' },
];

export const MyLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('All');

  const filteredCards = sampleCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = selectedColor === 'All' || card.color === selectedColor;
    return matchesSearch && matchesColor;
  });

  const colors = ['All', 'White', 'Blue', 'Black', 'Red', 'Green', 'Colorless'];
  const colorClasses = {
    'All': 'bg-gray-500',
    'White': 'bg-white',
    'Blue': 'bg-blue-500',
    'Black': 'bg-black',
    'Red': 'bg-red-500',
    'Green': 'bg-green-500',
    'Colorless': 'bg-gray-400'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Library</h1>
              <p className="text-gray-300">Browse and manage your card collection</p>
            </div>
            <button
              onClick={() => navigate('/library/decks')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🃏 Manage Decks
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-600 border-opacity-30">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              />
            </div>

            {/* Color Filter */}
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                    selectedColor === color
                      ? 'border-yellow-400 shadow-lg'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${colorClasses[color as keyof typeof colorClasses]} ${color === 'White' ? 'border border-gray-300' : ''}`}></div>
                    <span className="text-white text-sm">{color}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCards.map(card => (
            <div
              key={card.id}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-600 border-opacity-30 hover:border-yellow-400 hover:border-opacity-50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="aspect-[2.8/4] bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg mb-3 flex items-center justify-center">
                <div className={`w-8 h-8 rounded ${colorClasses[card.color as keyof typeof colorClasses]} ${card.color === 'White' ? 'border border-gray-300' : ''}`}></div>
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{card.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{card.type}</p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold text-sm">{card.cost}</span>
                <span className={`text-xs px-2 py-1 rounded ${colorClasses[card.color as keyof typeof colorClasses]} ${card.color === 'White' ? 'text-black' : 'text-white'}`}>
                  {card.color}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cards found matching your search criteria.</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-600 border-opacity-30">
          <div className="flex justify-between items-center">
            <p className="text-gray-300">
              Showing <span className="text-white font-semibold">{filteredCards.length}</span> of{' '}
              <span className="text-white font-semibold">{sampleCards.length}</span> cards
            </p>
            <p className="text-gray-400 text-sm">
              Library last updated: Today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};