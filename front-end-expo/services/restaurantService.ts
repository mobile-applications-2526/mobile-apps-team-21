import { Restaurant } from '@/types';
import { buildApiUrl } from '@/utils/apiConfig';

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) throw new Error('Empty response body');
  try { return JSON.parse(text) as T; } catch { throw new Error(text || 'Unexpected response'); }
}

async function request(path: string, init?: RequestInit, token?: string): Promise<Response> {
  const url = buildApiUrl(path);
  const headers = new Headers(init?.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return res;
}

export async function fetchRestaurants(userEmail: string, token?: string): Promise<Restaurant[]> {
    if (!userEmail) throw new Error('No user specified');
    const res = await request(`/restaurants`, undefined, token);
    const restaurants = await handleJson<Restaurant[]>(res);
    return restaurants
}