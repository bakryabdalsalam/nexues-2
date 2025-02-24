import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  sessionExpiry: Date | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      sessionExpiry: null,
      setAuth: (user, token) => {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24); // 24 hour session
        set({ user, token, sessionExpiry: expiry });
      },
      logout: () => {
        set({ user: null, token: null, sessionExpiry: null });
        localStorage.removeItem('token');
      },
      checkSession: () => {
        const { sessionExpiry } = get();
        if (!sessionExpiry) return false;
        return new Date() < new Date(sessionExpiry);
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
