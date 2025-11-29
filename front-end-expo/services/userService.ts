import { buildApiUrl, API_BASE_URL } from '@/utils/apiConfig';

export type LoginResponse = { token: string };

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || `Unexpected response (${res.status})`);
  }
}

export const authFetch = async (input: RequestInfo, init: RequestInit = {}) => {
  const res = await fetch(input, init);
  return res;
};

export const UserService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // debugging
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
      } catch (_) {}
      throw new Error(message);
    }

    return handleJson<LoginResponse>(res);
  }
};
