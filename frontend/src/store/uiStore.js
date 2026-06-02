import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set, get) => ({
      theme: 'system',       // 'light' | 'dark' | 'system'
      sidebarCollapsed: false,
      activeModal: null,     // string id of open modal
      toasts: [],
      notificationCount: 3,

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const current = get().theme
        const next = current === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),

      addToast: (toast) => {
        const id = Date.now().toString()
        set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }))
        setTimeout(() => get().removeToast(id), toast.duration || 4000)
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
      setNotificationCount: (n) => set({ notificationCount: n }),
    }),
    { name: 'onehealth-ui', partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }) }
  )
)

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else if (theme === 'light') {
    root.setAttribute('data-theme', 'light')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }
}
