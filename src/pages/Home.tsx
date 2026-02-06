import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  UserIcon,
  SparklesIcon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
  EyeIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAccentColors } from '../utils/useAccentColors';

export const Home: React.FC = () => {
  const accentColors = useAccentColors();

  // Mock data for the dashboard
  const collectionStats = {
    totalCards: 1247,
    uniqueCards: 892,
    totalDecks: 8,
    recentGames: 5
  };

  const recentDecks = [
    { name: 'Mono Red Aggro', colors: ['R'], wins: 3, losses: 2, lastPlayed: '2 hours ago' },
    { name: 'Azorius Control', colors: ['W', 'U'], wins: 2, losses: 3, lastPlayed: '1 day ago' },
    { name: 'Golgari Midrange', colors: ['G', 'B'], wins: 4, losses: 1, lastPlayed: '3 days ago' }
  ];

  const friends = [
    { name: 'Alex Chen', status: 'online', lastGame: '2 hours ago' },
    { name: 'Sarah Miller', status: 'offline', lastGame: '1 day ago' },
    { name: 'Mike Johnson', status: 'online', lastGame: '5 hours ago' }
  ];

  const quickActions = [
    { 
      icon: PlusIcon, 
      label: 'New Deck', 
      description: 'Build a new deck from your collection',
      link: '/decks/new'
    },
    { 
      icon: UsersIcon, 
      label: 'Play with Friends', 
      description: 'Start a game with your friends',
      link: '/games/new'
    },
    { 
      icon: EyeIcon, 
      label: 'Browse Collection', 
      description: 'View and manage your cards',
      link: '/library'
    }
  ];

  const recentActivity = [
    { type: 'deck_created', details: 'Created new "Dimir Control" deck', time: '1 hour ago' },
    { type: 'game_played', details: 'Played against Alex - Won 2-1', time: '2 hours ago' },
    { type: 'card_added', details: 'Added 4 Thoughtseize to collection', time: '5 hours ago' },
    { type: 'deck_updated', details: 'Modified "Mono Red Aggro" deck', time: '1 day ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'deck_created': return PlusIcon;
      case 'game_played': return UsersIcon;
      case 'card_added': return BookOpenIcon;
      case 'deck_updated': return SparklesIcon;
      default: return ClockIcon;
    }
  };

  const getManaColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'W': 'bg-yellow-400 border-yellow-500',
      'U': 'bg-blue-400 border-blue-500', 
      'B': 'bg-gray-800 border-gray-600',
      'R': 'bg-red-400 border-red-500',
      'G': 'bg-green-400 border-green-500'
    };
    return colorMap[color] || 'bg-gray-400 border-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto pl-24 pr-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-4">
                <div className={`p-3 ${accentColors.bgPrimary} bg-opacity-20 rounded-xl`}>
                  <SparklesIcon className={`h-7 w-7 ${accentColors.textPrimary}`} />
                </div>
                Magic Hub
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Build decks, play with friends, track your games</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/library"
                className={`px-4 py-2 ${accentColors.bgPrimary} text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors font-medium`}
              >
                Collection
              </Link>
              <Link
                to="/games/new"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Play Game
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Total Cards</span>
            </div>
            <p className="text-2xl font-bold text-white">{collectionStats.totalCards.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Decks</span>
            </div>
            <p className="text-2xl font-bold text-white">{collectionStats.totalDecks}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Friends</span>
            </div>
            <p className="text-2xl font-bold text-white">{friends.length}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <FireIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Recent Games</span>
            </div>
            <p className="text-2xl font-bold text-white">{collectionStats.recentGames}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Get Started</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all group"
                  >
                    <div className={`inline-flex p-3 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg mb-4 group-hover:bg-opacity-30 transition-colors`}>
                      <action.icon className={`h-6 w-6 ${accentColors.textPrimary}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.label}</h3>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Decks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Your Decks</h2>
                <Link to="/decks" className="text-sm text-gray-400 hover:text-white transition-colors">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentDecks.map((deck, index) => (
                  <Link
                    key={index}
                    to={`/decks/${deck.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-all block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {deck.colors.map((color, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-full border-2 ${getManaColor(color)}`}
                            />
                          ))}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{deck.name}</h3>
                          <p className="text-sm text-gray-400">
                            {deck.wins}W - {deck.losses}L • {deck.lastPlayed}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-400">
                          {deck.wins + deck.losses} games
                        </p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Friends Online */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Friends</h2>
                <Link to="/friends" className="text-sm text-gray-400 hover:text-white transition-colors">
                  View All →
                </Link>
              </div>
              <div className="bg-gray-900 rounded-lg border border-gray-800">
                <div className="space-y-1">
                  {friends.map((friend, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                              friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{friend.name}</p>
                            <p className="text-xs text-gray-500">Last game {friend.lastGame}</p>
                          </div>
                        </div>
                        <Link
                          to={`/games/new?friend=${friend.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`px-3 py-1 text-xs ${accentColors.bgPrimary} text-white rounded ${accentColors.bgPrimaryHover} transition-colors`}
                        >
                          Invite
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="bg-gray-900 rounded-lg border border-gray-800">
                <div className="space-y-1">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg mt-0.5`}>
                          {React.createElement(getActivityIcon(activity.type), {
                            className: `h-4 w-4 ${accentColors.textPrimary}`
                          })}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{activity.details}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};