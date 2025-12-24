import { buildApiUrl, API_BASE_URL } from '@/utils/apiConfig';
import { UserProfile, ProfileStats, RestaurantRelation } from '@/types';

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

  // Get user profile data
  async getProfile(email: string, token: string): Promise<UserProfile> {
    const res = await fetch(buildApiUrl(`/users?email=${encodeURIComponent(email)}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch profile (${res.status})`);
    }
    return handleJson<UserProfile>(res);
  },

  // Update user profile
  async updateProfile(
    email: string,
    token: string,
    updates: { name?: string; firstName?: string; phoneNumber?: string; password?: string }
  ): Promise<string[]> {
    const res = await fetch(buildApiUrl(`/users?email=${encodeURIComponent(email)}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error(`Failed to update profile (${res.status})`);
    }
    return handleJson<string[]>(res);
  },

  // Get profile statistics (visited and favorite restaurant counts)
  async getProfileStats(token: string): Promise<ProfileStats> {
    const res = await fetch(buildApiUrl('/users/profile/stats'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch profile stats (${res.status})`);
    }
    return handleJson<ProfileStats>(res);
  },

  // Get visited restaurants
  async getVisitedRestaurants(token: string): Promise<RestaurantRelation[]> {
    const res = await fetch(buildApiUrl('/users/restaurants/visited'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch visited restaurants (${res.status})`);
    }
    return handleJson<RestaurantRelation[]>(res);
  },

  // Get favorite restaurants
  async getFavoriteRestaurants(token: string): Promise<RestaurantRelation[]> {
    const res = await fetch(buildApiUrl('/users/restaurants/favorites'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch favorite restaurants (${res.status})`);
    }
    return handleJson<RestaurantRelation[]>(res);
  },

  // Toggle favorite status for a restaurant
  async toggleFavorite(restaurantId: string, token: string): Promise<RestaurantRelation> {
    const res = await fetch(buildApiUrl(`/users/restaurants/${restaurantId}/favorite`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to toggle favorite (${res.status})`);
    }
    return handleJson<RestaurantRelation>(res);
  },

  // Mark restaurant as visited
  async markAsVisited(restaurantId: string, token: string): Promise<RestaurantRelation> {
    const res = await fetch(buildApiUrl(`/users/restaurants/${restaurantId}/visited`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to mark as visited (${res.status})`);
    }
    return handleJson<RestaurantRelation>(res);
  },
};
