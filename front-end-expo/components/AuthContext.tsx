import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authFetch, UserService } from '@/services/userService';
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '@/services/pushNotificationService';
import { UserProfile, ProfileStats } from '@/types';

export type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  userEmail: string | null;
  userProfile: UserProfile | null;
  profileStats: ProfileStats | null;
  refreshUserProfile: () => Promise<void>;
  refreshProfileStats: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const EMAIL_KEY = 'user_email';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored token and email on mount
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedEmail = await AsyncStorage.getItem(EMAIL_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
        if (storedEmail) {
          setUserEmail(storedEmail);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch user profile when token and email are available
  const refreshUserProfile = useCallback(async () => {
    if (!userEmail || !token) return;
    try {
      const profile = await UserService.getProfile(userEmail, token);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, [userEmail, token]);

  // Fetch profile stats
  const refreshProfileStats = useCallback(async () => {
    if (!token) return;
    try {
      const stats = await UserService.getProfileStats(token);
      setProfileStats(stats);
    } catch (error) {
      console.error('Failed to fetch profile stats:', error);
    }
  }, [token]);

  // Fetch profile data when authenticated
  useEffect(() => {
    if (userEmail && token) {
      refreshUserProfile();
      refreshProfileStats();
    }
  }, [userEmail, token, refreshUserProfile, refreshProfileStats]);

  // push notification useffect, registreet push notification token
  // registreert die vervolgens op backend
  useEffect(() => {
  if (userEmail && token) {
    registerForPushNotificationsAsync().then(pushToken => {
      console.log(pushToken)
      if (pushToken) {
        sendPushTokenToBackend(pushToken, token);
      }
    });
  }
  }, [userEmail, token]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await UserService.login(email, password);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(EMAIL_KEY, email);
    setToken(data.token);
    setUserEmail(email);
  }, []);

  const logout = useCallback(() => {
    AsyncStorage.removeItem(TOKEN_KEY);
    AsyncStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setUserEmail(null);
    setUserProfile(null);
    setProfileStats(null);
  }, []);

  const value = useMemo(
    () => ({ 
      token, 
      isAuthenticated: !!token, 
      loading, 
      login, 
      logout, 
      userEmail,
      userProfile,
      profileStats,
      refreshUserProfile,
      refreshProfileStats,
    }),
    [token, loading, login, logout, userEmail, userProfile, profileStats, refreshUserProfile, refreshProfileStats]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { authFetch };
