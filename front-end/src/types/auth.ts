export type LoginResponse = {
  token: string;
};

export type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
