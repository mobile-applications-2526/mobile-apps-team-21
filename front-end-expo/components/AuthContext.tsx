import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authFetch, UserService } from '@/services/userService';

export type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  userEmail: string | null;
  userId: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          setToken(stored);
          // We need to decode the token to get the email, or store email in AsyncStorage too.
          // For now, let's assume we can't get email from token easily without a library.
          // Ideally, we should store user info in AsyncStorage on login.
          const storedEmail = await AsyncStorage.getItem('user_email');
          if (storedEmail) setUserEmail(storedEmail);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch user ID when token and email are available
  useEffect(() => {
    if (token && userEmail && !userId) {
      console.log('Fetching user profile for:', userEmail);
      UserService.getProfile(userEmail, token)
        .then(profile => {
            console.log('Fetched profile:', profile);
            setUserId(profile.id);
        })
        .catch(err => console.warn('Failed to fetch user profile', err));
    }
  }, [token, userEmail, userId]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await UserService.login(email, password);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem('user_email', email);
    setToken(data.token);
    setUserEmail(email);
    // userId will be fetched by the effect
  }, []);

  const logout = useCallback(() => {
    AsyncStorage.removeItem(TOKEN_KEY);
    AsyncStorage.removeItem('user_email');
    setToken(null);
    setUserEmail(null);
    setUserId(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, loading, login, logout, userEmail, userId }),
    [token, loading, login, logout, userEmail, userId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { authFetch };
