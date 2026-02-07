import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  BookOpenIcon, 
  UsersIcon, 
  PlayIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { useAccentColors } from '../utils/useAccentColors';

export const Landing: React.FC = () => {
  const accentColors = useAccentColors();

  const features = [
    {
      icon: UsersIcon,
      title: 'Play with Friends',
      description: 'Start games with your friends anytime, anywhere.',
      highlights: ['No waiting in queues', 'Play with people you know', 'Have multiple games at once']
    },
    {
      icon: BookOpenIcon,
      title: 'Digital Collection',
      description: 'Keep track of all your cards and build new decks with our tools.',
      highlights: ['Search your collection', 'Test deck builds', 'Track card values']
    },
    {
      icon: CpuChipIcon,
      title: 'Game History',
      description: 'Remember those epic moments and see how your decks do over time.',
      highlights: ['No rankings or pressure', 'Just good memories', 'Private to you and friends']
    },
    {
      icon: SparklesIcon,
      title: 'Easy to Use',
      description: 'Clean interface that gets out of the way so you can focus on the game.',
      highlights: ['Mobile friendly', 'Fast loading', 'Intuitive controls']
    }
  ];

  const whatYouCanDo = [
    {
      icon: UsersIcon,
      title: 'Play with Friends',
      description: 'Start a game with your Magic buddies anytime, anywhere.',
      vibe: 'Games with people you know'
    },
    {
      icon: BookOpenIcon,
      title: 'Manage Your Collection',
      description: 'Keep track of all your cards and build new decks.',
      vibe: 'Your digital binder and deck builder'
    },
    {
      icon: CpuChipIcon,
      title: 'Track Your Games',
      description: 'See how your decks perform and remember those epic moments.',
      vibe: 'Maintain bragging rights'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Simple Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg`}>
                <SparklesIcon className={`h-6 w-6 ${accentColors.textPrimary}`} />
              </div>
              <span className="text-xl font-bold text-white">ManaForge</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Member Sign In
              </Link>
              <Link
                to="/signup"
                className={`px-4 py-2 ${accentColors.bgPrimary} text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors font-medium`}
              >
                Join Us
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <PlayIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Your Online Game Room</span>
            </div>
            
            <h1 className={`text-5xl font-bold text-white mb-4 ${accentColors.gradientLight} bg-clip-text text-transparent`}>
              Welcome to ManaForge
            </h1>
            
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              The place to play Magic with your friends online.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/signup"
                className={`inline-flex items-center gap-2 px-6 py-3 ${accentColors.bgPrimary} text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors font-medium`}
              >
                Start Playing with Friends
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                I'm Already a Member
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">What Makes This Different</h2>
          <p className="text-gray-400">Built for Magic players who want a seamless experience</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900 bg-opacity-50 rounded-lg p-8 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className={`inline-flex p-4 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg mb-6`}>
                <feature.icon className={`h-8 w-8 ${accentColors.textPrimary}`} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
              <div className="space-y-2">
                {feature.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${accentColors.bgPrimary} rounded-full`}></div>
                    <span className="text-sm text-gray-400">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What You Can Do */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">What You Can Do Here</h2>
          <p className="text-gray-400">Everything for your Magic The Gathering experience</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {whatYouCanDo.map((item, index) => (
            <div
              key={index}
              className="bg-gray-900 bg-opacity-50 rounded-lg p-6 border border-gray-800"
            >
              <div className={`inline-flex p-3 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg mb-4`}>
                <item.icon className={`h-6 w-6 ${accentColors.textPrimary}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 mb-3">{item.description}</p>
              <p className="text-sm text-gray-500 italic">{item.vibe}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Come Play */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className={`bg-gradient-to-r ${accentColors.gradient} rounded-2xl p-8 text-center`}>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Play Some Magic?</h2>
          <p className="text-lg text-white mb-6 opacity-90">
            Join your friends for games anytime you want.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Join the Community
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors font-medium border border-gray-600"
            >
              Sign In to Play
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-8 py-12 border-t border-gray-800">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`p-2 ${accentColors.bgPrimary} bg-opacity-20 rounded-lg`}>
              <SparklesIcon className={`h-5 w-5 ${accentColors.textPrimary}`} />
            </div>
            <span className="text-white font-semibold">ManaForge</span>
          </div>
          <div className="text-gray-400 text-sm mb-4">
            Always open • Play with friends anytime
          </div>
        </div>
      </div>
    </div>
  );
};