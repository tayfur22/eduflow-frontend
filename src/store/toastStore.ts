import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
  remove: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  success: (message) => {
    const id = `toast-${++counter}`;
    set(s => ({ toasts: [...s.toasts, { id, message, type: "success" }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },

  error: (message) => {
    const id = `toast-${++counter}`;
    set(s => ({ toasts: [...s.toasts, { id, message, type: "error" }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4500);
  },

  info: (message) => {
    const id = `toast-${++counter}`;
    set(s => ({ toasts: [...s.toasts, { id, message, type: "info" }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3000);
  },

  warning: (message) => {
    const id = `toast-${++counter}`;
    set(s => ({ toasts: [...s.toasts, { id, message, type: "warning" }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },

  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
