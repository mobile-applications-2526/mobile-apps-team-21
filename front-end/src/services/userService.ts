import { LoginResponse } from '../types/auth';
import { buildApiUrl } from '../utils/apiConfig';
import { API_BASE_URL } from '../utils/apiConfig';


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
    // testing
    console.log('API Base URL:', API_BASE_URL);
    const res = await fetch(buildApiUrl('/auth/login'), {
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

