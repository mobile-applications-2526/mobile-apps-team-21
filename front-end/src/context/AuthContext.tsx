import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserService } from '../services/UserService';
import { AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

const decodeEmailFromToken = (token: string | null): string | null => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const globalAtob = typeof globalThis !== 'undefined' && typeof (globalThis as any).atob === 'function'
      ? (globalThis as any).atob
      : null;
    if (!globalAtob) return null;
    const decoded = globalAtob(padded);
    const payload = JSON.parse(decoded);
    return payload?.sub ?? payload?.email ?? null;
  } catch (error) {
    console.warn('Failed to decode auth token', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      setUserEmail(decodeEmailFromToken(stored));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await UserService.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUserEmail(email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUserEmail(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, loading, login, logout, userEmail }),
    [token, loading, login, logout, userEmail]
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
