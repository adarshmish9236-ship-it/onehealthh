import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Sun, Moon, Monitor, AlertTriangle, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useUIStore, applyTheme } from '../../store/uiStore'
import { useUserStore } from '../../store/userStore'
import { useAuthStore } from '../../store/authStore'
import { useRecordsStore } from '../../store/recordsStore'
import { Avatar } from '../ui/index'
import { Button } from '../ui/Button'
import { cn } from '../../utils/formatters'
import { authService } from '../../services/authService'

function ThemeToggle() {
  const theme = useUIStore(s => s.theme)
  const setTheme = useUIStore(s => s.setTheme)
  const themes = [
    { id: 'light',  icon: <Sun size={14} />,     label: 'Light' },
    { id: 'dark',   icon: <Moon size={14} />,    label: 'Dark' },
    { id: 'system', icon: <Monitor size={14} />, label: 'System' },
  ]
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className={cn(
            'p-1.5 rounded-md transition-all cursor-pointer',
            theme === t.id
              ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          )}
        >
          {t.icon}
        </button>
      ))}
    </div>
  )
}

function UserMenu({ profile, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const displayName = profile?.displayName || profile?.name || 'User'

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-[var(--color-surface-2)] transition-all cursor-pointer group"
      >
        <Avatar name={displayName} src={profile?.profile?.photo_url || profile?.photoURL} size="sm" />
        <ChevronDown size={14} className={cn('text-[var(--color-text-muted)] transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{displayName}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{profile?.email || ''}</p>
          </div>

          {/* Menu items */}
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => { navigate('/settings'); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
            >
              <Settings size={15} /> Settings
            </button>
            <button
              onClick={() => { onLogout(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Header({ title, subtitle }) {
  const profile = useUserStore(s => s.profile)
  const healthMetrics = useUserStore(s => s.healthMetrics)
  const notificationCount = useUIStore(s => s.notificationCount)
  const logout = useAuthStore(s => s.logout)
  const clearProfile = useUserStore(s => s.clearProfile)
  const clearRecords = useRecordsStore(s => s.clearRecords)
  const navigate = useNavigate()

  const score = healthMetrics?.health_score || 0
  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'
  const scoreBg   = score >= 70 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                  : score >= 40 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'

  const handleLogout = async () => {
    await authService.logout()
    logout()
    clearProfile?.()
    clearRecords?.()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm flex items-center px-4 sm:px-6 gap-4">
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <div>
            <h1 className="text-base font-semibold text-[var(--color-text-primary)] truncate">{title}</h1>
            {subtitle && <p className="text-xs text-[var(--color-text-muted)] truncate">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Health Score Pill — only shown when data exists */}
        {score > 0 && (
          <div className={cn('hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold', scoreBg, scoreColor)}>
            <div className="w-2 h-2 rounded-full bg-current" />
            {score} / 100
          </div>
        )}

        {/* Emergency button */}
        <Link to="/emergency" className="hidden sm:flex">
          <Button variant="destructive" size="sm" className="gap-1.5">
            <AlertTriangle size={14} />
            Emergency
          </Button>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-danger)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Menu with Logout */}
        <UserMenu profile={profile} onLogout={handleLogout} />
      </div>
    </header>
  )
}
