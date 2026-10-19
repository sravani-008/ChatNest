import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => authService.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify user on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // Check if token was passed in URL (e.g. from Google OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        authService.setToken(urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const storedToken = authService.getToken();
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await authService.getMe();
        if (isMounted) {
          setUser(data.user);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        if (isMounted) {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authService.loginWithGoogle(credential);
      setUser(data.user);
      setToken(data.token);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Google authentication failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithDev = useCallback(async (devProfile) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authService.devLogin(devProfile);
      setUser(data.user);
      setToken(data.token);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Dev login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    authError,
    setAuthError,
    loginWithGoogle,
    loginWithDev,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
