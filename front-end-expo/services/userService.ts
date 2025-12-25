import { buildApiUrl, API_BASE_URL } from '@/utils/apiConfig';
import { RawUser, RestRelResponse, RestaurantStatus } from '@/types';

export type LoginResponse = { token: string };
export type RegisterResponse = { id: string; token: string };

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
  },

  async register(payload: {
    email: string;
    password: string;
    name: string;
    firstName: string;
    phoneNumber: string;
  }): Promise<RegisterResponse> {
    const res = await fetch(buildApiUrl('/users/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let message = `Register failed (${res.status})`;
      try {
        const data = await handleJson<{ message?: string }>(res.clone());
        if (data?.message) message = data.message;
      } catch (_) {}
      throw new Error(message);
    }
    return handleJson<RegisterResponse>(res);
  },

  async getSelf(email: string, token: string): Promise<RawUser> {
    const res = await fetch(buildApiUrl(`/users?email=${encodeURIComponent(email)}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return handleJson<RawUser>(res);
  },

  async getVisitedRestaurants(email: string, token: string): Promise<RestRelResponse[]> {
    const res = await fetch(buildApiUrl(`/users/visited?email=${encodeURIComponent(email)}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch visited restaurants');
    return handleJson<RestRelResponse[]>(res);
  },

  async getFavoriteRestaurants(email: string, token: string): Promise<RestRelResponse[]> {
    const res = await fetch(buildApiUrl(`/users/favorites?email=${encodeURIComponent(email)}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch favorite restaurants');
    return handleJson<RestRelResponse[]>(res);
  },

  async toggleFavorite(restaurantId: string, token: string): Promise<{ isFavorite: boolean }> {
    const res = await fetch(buildApiUrl(`/users/restaurants/${restaurantId}/favorite`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return handleJson<{ isFavorite: boolean }>(res);
  },

  async toggleVisited(restaurantId: string, token: string): Promise<{ visitDate: string }> {
    const res = await fetch(buildApiUrl(`/users/restaurants/${restaurantId}/visited`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to toggle visited');
    return handleJson<{ visitDate: string }>(res);
  },

  async getRestaurantStatus(restaurantId: string, token: string): Promise<RestaurantStatus> {
    const res = await fetch(buildApiUrl(`/users/restaurants/${restaurantId}/status`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to get restaurant status');
    return handleJson<RestaurantStatus>(res);
  },

  async setRating(restaurantId: string, rating: number, token: string): Promise<{ rating: number }> {
    const res = await fetch(buildApiUrl(`/users/restaurants/${restaurantId}/rating`), {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating })
    });
    if (!res.ok) throw new Error('Failed to set rating');
    return handleJson<{ rating: number }>(res);
  },

  async updateProfile(
    email: string,
    token: string,
    data: {
      name?: string;
      firstName?: string;
      phoneNumber?: string;
      password?: string;
    }
  ): Promise<RawUser> {
    const res = await fetch(buildApiUrl(`/users?email=${encodeURIComponent(email)}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...data,
        email
      })
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return handleJson<RawUser>(res);
  },
};
