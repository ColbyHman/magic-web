import React, { createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  signup: () => void;
  logout: () => void;
  loading: boolean;
  error: any;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user
  } = useAuth0();

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  const value: AuthContextType = {
    isLoggedIn: isAuthenticated,
    login,
    signup,
    logout,
    loading: isLoading,
    error,
    user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};