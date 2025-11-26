import { Capacitor } from '@capacitor/core';

const WEB_API_URL = import.meta.env.VITE_API_URL;
const ANDROID_API_URL = import.meta.env.VITE_ANDROID_API_URL;

if (!WEB_API_URL) {
  throw new Error('Missing VITE_API_URL. Please set it in your environment.');
}

const resolvedAndroidUrl = ANDROID_API_URL || WEB_API_URL;

export const API_BASE_URL = Capacitor.isNativePlatform() ? resolvedAndroidUrl : WEB_API_URL;

export const buildApiUrl = (path: string = ''): string => {
  const base = API_BASE_URL.replace(/\/$/, '');
  if (!path) return base;
  if (path.startsWith('http')) return path;
  const normalizedPath = path.replace(/^\//, '');
  return normalizedPath ? `${base}/${normalizedPath}` : base;
};
