import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { initializeCardVault, getVaultStats, type VaultCard } from '../utils/cardVault';

export const CardVault: React.FC = () => {
  const [cards, setCards] = useState<VaultCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<VaultCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Initialize vault on mount
  useEffect(() => {
    const loadVault = async () => {
      try {
        setLoading(true);
        const vaultCards = await initializeCardVault();
        setCards(vaultCards);
        setFilteredCards(vaultCards);
        setStats(getVaultStats(vaultCards));
      } catch (error) {
        console.error('Failed to load card vault:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVault();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    if (cards.length > 0) {
      // Simple test: just return all cards for now
      let filtered = cards;
      
      // Apply search term
      if (searchTerm) {
        filtered = filtered.filter(card => 
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply color filter
      if (selectedColor && selectedColor !== 'All') {
        filtered = filtered.filter(card => 
          card.colorIdentity.includes(selectedColor)
        );
      }
      
      // Apply rarity filter
      if (selectedRarity && selectedRarity !== 'All') {
        filtered = filtered.filter(card => card.rarity === selectedRarity);
      }
      
      // Apply type filter
      if (selectedType && selectedType !== 'All') {
        filtered = filtered.filter(card => 
          card.type.toLowerCase().includes(selectedType.toLowerCase())
        );
      }
      
      // Apply favorite filter
      if (showFavoritesOnly) {
        filtered = filtered.filter(card => card.favorite);
      }
      
      setFilteredCards(filtered);
    }
  }, [cards, searchTerm, selectedColor, selectedRarity, selectedType, showFavoritesOnly]);

  

  const toggleFavorite = (cardId: string) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, favorite: !card.favorite } : card
      )
    );
  };

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

  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Mythic Rare', 'Special'];
  const rarityClasses = {
    'Common': 'bg-gray-400',
    'Uncommon': 'bg-green-500',
    'Rare': 'bg-blue-500',
    'Mythic Rare': 'bg-orange-500',
    'Special': 'bg-purple-500'
  };

  const mainTypes = ['All', 'Creature', 'Sorcery', 'Instant', 'Enchantment', 'Artifact', 'Land', 'Planeswalker'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-yellow-400 text-2xl font-bold mb-4">Loading Card Vault...</div>
          <div className="text-white text-sm">Fetching your collection from the archives</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <StarIcon className="h-8 w-8 text-yellow-400" />
            Card Vault
          </h1>
          <p className="text-gray-300">Your comprehensive Magic: The Gathering collection</p>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-600 border-opacity-30">
              <div className="text-2xl font-bold text-white">{stats.totalCards}</div>
              <div className="text-gray-400 text-sm">Unique Cards</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-600 border-opacity-30">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalQuantity}</div>
              <div className="text-gray-400 text-sm">Total Quantity</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-600 border-opacity-30">
              <div className="text-2xl font-bold text-red-400">{stats.favorites}</div>
              <div className="text-gray-400 text-sm">Favorites</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-600 border-opacity-30">
              <div className="text-2xl font-bold text-green-400">{stats.byRarity['Mythic Rare'] || 0}</div>
              <div className="text-gray-400 text-sm">Mythics</div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-600 border-opacity-30">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards by name, type, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                showFavoritesOnly 
                  ? 'border-red-400 bg-red-400 bg-opacity-20' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              {showFavoritesOnly ? (
                <HeartSolidIcon className="h-5 w-5 text-red-400" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-white text-sm">Favorites</span>
            </button>
          </div>

          {/* Filter Rows */}
          <div className="mt-4 space-y-3">
            {/* Color Filter */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Color Identity</label>
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

            {/* Rarity Filter */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Rarity</label>
              <div className="flex gap-2 flex-wrap">
                {rarities.map(rarity => (
                  <button
                    key={rarity}
                    onClick={() => setSelectedRarity(rarity)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                      selectedRarity === rarity
                        ? 'border-yellow-400 shadow-lg'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${rarity === 'All' ? 'bg-gray-500' : (rarityClasses[rarity as keyof typeof rarityClasses] || 'bg-gray-400')}`}></div>
                      <span className="text-white text-sm">{rarity}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Card Type</label>
              <div className="flex gap-2 flex-wrap">
                {mainTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                      selectedType === type
                        ? 'border-yellow-400 shadow-lg'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-white text-sm">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCards.map(card => (
            <div
              key={card.id}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-600 border-opacity-30 hover:border-yellow-400 hover:border-opacity-50 transition-all duration-300 hover:transform hover:scale-105 relative"
            >
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(card.id)}
                className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200"
              >
                {card.favorite ? (
                  <HeartSolidIcon className="h-4 w-4 text-red-400" />
                ) : (
                  <HeartIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {/* Card Image */}
              <div className="aspect-[2.8/4] bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                {card.imageUrl && !imageErrors.has(card.id) ? (
                  <img 
                    src={card.imageUrl} 
                    alt={card.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(card.id));
                    }}
                    onLoad={() => {
                      setImageErrors(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(card.id);
                        return newSet;
                      });
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className={`w-16 h-20 rounded-lg ${colorClasses[card.colorIdentity[0] as keyof typeof colorClasses] || 'bg-gray-500'} mb-2 flex items-center justify-center`}>
                      <span className="text-white text-lg font-bold">
                        {card.manaCost ? card.manaCost.replace(/[{}]/g, '') : '🎴'}
                      </span>
                    </div>
                    <span className="text-white text-xs text-center px-2">{card.name}</span>
                  </div>
                )}
                
                {/* Quantity Badge */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  x{card.quantity}
                </div>
              </div>

              {/* Card Info */}
              <h3 className="font-semibold text-white mb-1 truncate text-sm">{card.name}</h3>
              <p className="text-gray-400 text-xs mb-2 truncate">{card.type}</p>
              
              {/* Mana Cost and Rarity */}
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold text-xs">{card.manaCost || '—'}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${rarityClasses[card.rarity as keyof typeof rarityClasses] || 'bg-gray-400'}`}></div>
                  <span className="text-gray-300 text-xs">{card.rarity}</span>
                </div>
              </div>

              {/* Keywords */}
              {card.keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {card.keywords.slice(0, 2).map(keyword => (
                    <span key={keyword} className="text-xs bg-gray-700 text-gray-300 px-1 py-0.5 rounded">
                      {keyword}
                    </span>
                  ))}
                  {card.keywords.length > 2 && (
                    <span className="text-xs text-gray-400">+{card.keywords.length - 2}</span>
                  )}
                </div>
              )}

              {/* Condition */}
              <div className="mt-2 text-xs text-gray-400">
                Condition: <span className="text-gray-300">{card.condition}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cards found matching your search criteria.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-600 border-opacity-30">
          <div className="flex justify-between items-center">
            <p className="text-gray-300">
              Showing <span className="text-white font-semibold">{filteredCards.length}</span> of{' '}
              <span className="text-white font-semibold">{cards.length}</span> cards
            </p>
            <p className="text-gray-400 text-sm">
              Vault last updated: Just now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};