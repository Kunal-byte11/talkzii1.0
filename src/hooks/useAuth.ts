"use client";

import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'talkzi_auth_status';

interface AuthHook {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

export function useAuth(): AuthHook {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const storedAuthStatus = localStorage.getItem(AUTH_KEY);
      if (storedAuthStatus) {
        setIsLoggedIn(JSON.parse(storedAuthStatus));
      }
    } catch (error) {
      console.error("Error reading auth status from localStorage", error);
      // Fallback to false if localStorage is not available or error occurs
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(true));
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error setting auth status in localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error removing auth status from localStorage", error);
    }
  }, []);
  
  return { isLoggedIn, login, logout, isLoading };
}
