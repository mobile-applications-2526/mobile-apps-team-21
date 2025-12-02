import { Platform } from 'react-native';

const WEB_API_URL = process.env.EXPO_PUBLIC_API_URL;
const ANDROID_API_URL = process.env.EXPO_PUBLIC_ANDROID_API_URL;

if (!WEB_API_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL. Please set it in your environment.');
}

const resolvedAndroidUrl = ANDROID_API_URL || WEB_API_URL;

// In Expo, use the same URL on web; on native you may need a different host for Android emulator/device
export const API_BASE_URL = Platform.OS === 'android' ? resolvedAndroidUrl! : WEB_API_URL!;

export const buildApiUrl = (path: string = ''): string => {
  const base = API_BASE_URL.replace(/\/$/, '');
  if (!path) return base;
  if (path.startsWith('http')) return path;
  const normalizedPath = path.replace(/^\//, '');
  return normalizedPath ? `${base}/${normalizedPath}` : base;
};

// --- NEW: WebSocket URL Helper ---
export const getWebSocketUrl = (): string => {
  // Replace http/https with ws/wss and append /ws (your backend endpoint)
  const base = API_BASE_URL.replace(/\/$/, '');
  const wsBase = base.replace(/^http/, 'ws');
  return `${wsBase}/ws`;
};