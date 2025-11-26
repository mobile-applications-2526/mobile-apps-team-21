import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserService } from '../services/userService';

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) setToken(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await UserService.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, loading, login, logout }),
    [token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const authFetch = async (input: RequestInfo, init: RequestInit = {}) => {
  const stored = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init.headers || {});
  if (stored) headers.set('Authorization', `Bearer ${stored}`);
  return fetch(input, { ...init, headers });
};
