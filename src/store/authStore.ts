import { create } from "zustand";

interface User {
  userId: number;
  email: string;
  fullName: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  token: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,

  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
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
}));
