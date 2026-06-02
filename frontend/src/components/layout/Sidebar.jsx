import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookHeart, Stethoscope, FileSearch,
  Pill, Activity, BarChart3, FileText, Settings,
  UserCog, ShieldCheck, ChevronLeft, ChevronRight,
  AlertTriangle, HeartPulse
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../utils/formatters'

const PATIENT_NAV = [
  { path: '/dashboard',          label: 'Dashboard',        icon: LayoutDashboard },
  { path: '/passport',           label: 'Health Passport',  icon: BookHeart },
  { path: '/symptoms',           label: 'Symptom Check',    icon: Stethoscope },
  { path: '/reports',            label: 'Report Analyzer',  icon: FileSearch },
  { path: '/medications',        label: 'Medications',      icon: Pill },
  { path: '/risk',               label: 'Risk Prediction',  icon: Activity },
  { path: '/feedback-analytics', label: 'Feedback AI',      icon: BarChart3 },
  { path: '/health-report',      label: 'AI Health Report', icon: FileText },
]

const BOTTOM_NAV = [
  { path: '/dashboard',  label: 'Home',      icon: LayoutDashboard },
  { path: '/passport',   label: 'Passport',  icon: BookHeart },
  { path: '/symptoms',   label: 'Symptoms',  icon: Stethoscope },
  { path: '/medications',label: 'Meds',      icon: Pill },
  { path: '/emergency',  label: 'Emergency', icon: AlertTriangle, danger: true },
]

function NavItem({ item, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard'}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative cursor-pointer',
        isActive
          ? 'bg-[var(--color-primary)] text-white shadow-sm'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]',
        collapsed && 'justify-center px-0'
      )}
    >
      <Icon size={18} className="flex-shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip on collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-[var(--color-slate-900)] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {item.label}
        </div>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const collapsed = useUIStore(s => s.sidebarCollapsed)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen sticky top-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden flex-shrink-0 z-30"
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-[var(--color-border)] h-16', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
          <img src="/logo.png" alt="oneHealth logo" className="w-full h-full object-cover" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-lg text-[var(--color-text-primary)] tracking-tight"
            >
              oneHealth
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {PATIENT_NAV.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}

        <div className="my-3 h-px bg-[var(--color-border)]" />

        {/* Emergency Button */}
        <NavLink
          to="/emergency"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
            'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
            collapsed && 'justify-center px-0'
          )}
        >
          <AlertTriangle size={18} className="flex-shrink-0" />
          {!collapsed && <span>Emergency</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
            isActive
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]',
            collapsed && 'justify-center px-0'
          )}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="m-3 p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center justify-center cursor-pointer hover:bg-[var(--color-border)]"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  )
}

// Mobile bottom navigation
export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {BOTTOM_NAV.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 text-xs font-medium min-w-0',
                item.danger
                  ? isActive ? 'text-red-600' : 'text-red-400 hover:text-red-600'
                  : isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
