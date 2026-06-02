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

function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const count = useUIStore(s => s.notificationCount)
  const setCount = useUIStore(s => s.setNotificationCount)

  const sampleNotifications = [
    { id: '1', title: 'Welcome to oneHealth!', message: 'Your health passport is active. You can now upload reports and check symptoms.', time: 'Just now', unread: true },
    { id: '2', title: 'Gemini AI Ready', message: 'Report parsing and symptom analysis models have been initialized.', time: '1 hour ago', unread: true },
    { id: '3', title: 'Profile Configured', message: 'Your patient context has been securely synchronized with the database.', time: '2 hours ago', unread: true }
  ]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClear = () => {
    setCount(0)
  }

  return (
    <div className="relative flex items-center" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-danger)] text-white text-[10px] font-bold rounded-lg flex items-center justify-center animate-pulse">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-2)]">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">Notifications</span>
            {count > 0 && (
              <button onClick={handleClear} className="text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer">
                Mark all as read
              </button>
            )}
          </div>

          <div className="divide-y divide-[var(--color-border)] max-h-72 overflow-y-auto">
            {count > 0 ? (
              sampleNotifications.map(n => (
                <div key={n.id} className="p-4 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer flex gap-3">
                  <div className="w-2 h-2 rounded-lg bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{n.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-semibold uppercase">{n.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function Header({ title, subtitle }) {
  const profile = useUserStore(s => s.profile)
  const healthMetrics = useUserStore(s => s.healthMetrics)
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
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4 sm:px-6 gap-4">
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
        {/* Health Score Badge — only shown when data exists */}
        {score > 0 && (
          <div className={cn('hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold', scoreBg, scoreColor)}>
            <div className="w-2 h-2 rounded-sm bg-current" />
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

        {/* Notifications Dropdown */}
        <NotificationsMenu />

        {/* User Menu with Logout */}
        <UserMenu profile={profile} onLogout={handleLogout} />
      </div>
    </header>
  )
}
