import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authFetch, UserService } from '@/services/userService';
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '@/services/pushNotificationService';

export type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  userEmail: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const EMAIL_KEY = 'auth_email';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedEmail] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(EMAIL_KEY),
        ]);
        
        // Only restore auth state if BOTH token and email exist
        if (storedToken && storedEmail) {
          // Validate the token by making a simple API call
          try {
            await UserService.getSelf(storedEmail, storedToken);
            // Token is valid, restore the session
            setToken(storedToken);
            setUserEmail(storedEmail);
          } catch (e) {
            // Token is invalid or expired, clear stored data
            console.log('Stored token is invalid, clearing auth state');
            await AsyncStorage.multiRemove([TOKEN_KEY, EMAIL_KEY]);
          }
        } else {
          // Clear any partial data
          await AsyncStorage.multiRemove([TOKEN_KEY, EMAIL_KEY]);
        }
      } catch (e) {
        console.error('Error restoring auth state:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
    AsyncStorage.multiRemove([TOKEN_KEY, EMAIL_KEY]);
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

export { authFetch };
