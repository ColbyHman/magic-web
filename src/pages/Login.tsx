import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useAccentColors } from '../utils/useAccentColors';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login, signup, loading, error } = useAuth();
  const accentColors = useAccentColors();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50"></div>
      
      {/* Login Container */}
      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className={`inline-flex p-4 ${accentColors.bgPrimary} bg-opacity-20 rounded-2xl mb-4`}>
            <SparklesIcon className={`h-8 w-8 ${accentColors.textPrimary}`} />
          </div>
          <h1 className={`text-3xl font-bold text-white mb-2 ${accentColors.gradientLight} bg-clip-text text-transparent`}>
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to ManaForge to continue
          </p>
        </div>

        {/* Auth0 Login Form */}
        <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 border border-gray-600 border-opacity-30">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg">
                <p className="text-red-400 text-sm">Authentication error: {error.message}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={login}
              disabled={loading}
              className={`w-full py-3 px-4 ${accentColors.bgPrimary} text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                'Sign In with Auth0'
              )}
            </button>

            {/* Sign Up Button */}
            <button
              onClick={signup}
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                'Sign Up with Auth0'
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              New to ManaForge?{' '}
              <button
                onClick={signup}
                className={`${accentColors.textSecondary} hover:${accentColors.textPrimary} transition-colors font-medium`}
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        {/* Go Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-4 py-2 ${accentColors.bgPrimary} bg-opacity-80 text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors font-medium`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
};
