'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';
import { tokenStorage } from '@/lib/auth/token';

// ─── Auth Store ───────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser:       (user: User)    => void;
  setLoading:    (v: boolean)    => void;
  login:         (user: User, accessToken: string, refreshToken: string) => void;
  logout:        ()              => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,
      isLoading:       false,

      setUser:    (user)    => set({ user, isAuthenticated: true }),
      setLoading: (v)       => set({ isLoading: v }),

      login: (user, accessToken, refreshToken) => {
        tokenStorage.set(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'jari-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
