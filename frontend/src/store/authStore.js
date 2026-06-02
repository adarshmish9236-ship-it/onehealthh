import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: 'patient', // 'patient' | 'doctor' | 'admin'
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user, token, role) => set({
        user,
        token,
        role: role || 'patient',
        isAuthenticated: !!user,
      }),

      logout: () => set({
        user: null,
        token: null,
        role: 'patient',
        isAuthenticated: false,
      }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'onehealth-auth', partialize: (s) => ({ user: s.user, role: s.role, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)
