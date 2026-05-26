import { create } from "zustand";

interface User {
  userId: number;
  email: string;
  fullName: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  token: string;
  refreshToken: string;
  profileImage?: string;
  bio?: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  initAuth: () => void;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,

  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", user.token);
      localStorage.setItem("refreshToken", user.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user });
  },

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updated));
      if (partial.token) localStorage.setItem("token", partial.token);
      if (partial.refreshToken) localStorage.setItem("refreshToken", partial.refreshToken);
    }
    set({ user: updated });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    set({ user: null });
  },

  isAuthenticated: () => !!get().user,

  initAuth: () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) set({ user: JSON.parse(stored) });
    } catch { /* ignore */ }
  },

  getToken: () => {
    if (typeof window === "undefined") return null;
    return get().user?.token ?? localStorage.getItem("token");
  },

  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return get().user?.refreshToken ?? localStorage.getItem("refreshToken");
  },
}));
