import { Capacitor } from '@capacitor/core';

const DEFAULT_WEB_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const DEFAULT_ANDROID_API_URL = import.meta.env.VITE_ANDROID_API_URL || 'http://10.0.2.2:8080';

const API_URL: string = Capacitor.isNativePlatform() ? DEFAULT_ANDROID_API_URL : DEFAULT_WEB_API_URL;

// const API_URL: string = 'http://10.0.2.2:8080';

console.log(API_URL)

export type LoginResponse = {
  token: string;
};

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    // Non-JSON (error pages, empty, etc.)
    throw new Error(text || `Unexpected response (${res.status})`);
  }
}

export const UserService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      let message = `Login failed (${res.status})`;
      try {
        const data = await handleJson<{ message?: string }>(res.clone());
        if (data?.message) message = data.message;
      } catch (_) {
        // ignore JSON parse errors; fall back to generic message
      }
      throw new Error(message);
    }

    return handleJson<LoginResponse>(res);
  }
};

export default UserService;
