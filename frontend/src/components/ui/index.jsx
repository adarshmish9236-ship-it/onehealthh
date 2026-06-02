import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/formatters'

// Animated counter with Framer Motion
export function StatCard({ icon, label, value, trend, trendLabel, color = 'primary', className, onClick }) {
  const colorMap = {
    primary: { bg: 'bg-blue-50', icon: 'text-[var(--color-primary)]', text: 'text-[var(--color-primary)]' },
    success: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-600' },
    warning: { bg: 'bg-amber-50',  icon: 'text-amber-600',  text: 'text-amber-600' },
    danger:  { bg: 'bg-red-50',    icon: 'text-red-600',    text: 'text-red-600' },
    purple:  { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' },
    orange:  { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-600' },
  }
  const c = colorMap[color] || colorMap.primary

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 cursor-pointer transition-shadow duration-200 hover:shadow-[var(--shadow-md)]',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
        <div className={cn('p-2 rounded-lg', c.bg)}>
          <span className={c.icon}>{icon}</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[var(--color-text-primary)] font-data"
      >
        {value}
      </motion.div>
      {trendLabel && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1">{trendLabel}</p>
      )}
    </motion.div>
  )
}

// Progress bar
export function ProgressBar({ value = 0, max = 100, color = 'primary', size = 'md', label, showPercent = false, className }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const colorMap = {
    primary: 'bg-[var(--color-primary)]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
  }
  const sizeMap = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>}
          {showPercent && <span className="text-xs font-medium text-[var(--color-text-primary)]">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-[var(--color-surface-2)] rounded-lg overflow-hidden', sizeMap[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-lg', colorMap[color] || colorMap.primary)}
        />
      </div>
    </div>
  )
}

// Empty State
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center mb-4 text-[var(--color-text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// Avatar
export function Avatar({ src, name = '', size = 'md', className }) {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-2xl' }
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={cn('rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center font-semibold text-white flex-shrink-0 overflow-hidden', sizeMap[size], className)}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{initials}</span>}
    </div>
  )
}

// Spinner
export function Spinner({ size = 'md', color = 'primary', className }) {
  const sizeMap = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }
  const colorMap = { primary: 'border-[var(--color-primary)]', white: 'border-white', muted: 'border-[var(--color-text-muted)]' }
  return (
    <div className={cn('rounded-xl border-2 border-transparent animate-spin', sizeMap[size], colorMap[color], className)}
      style={{ borderTopColor: 'currentColor' }}
    />
  )
}

// Alert
export function Alert({ type = 'info', title, children, className }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger:  'bg-red-50 border-red-200 text-red-900',
  }
  return (
    <div className={cn('rounded-xl border p-4', styles[type] || styles.info, className)}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  )
}

// Divider
export function Divider({ className, label }) {
  if (label) return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      <span className="text-xs text-[var(--color-text-muted)] font-medium">{label}</span>
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  )
  return <div className={cn('h-px bg-[var(--color-border)] my-4', className)} />
}

// Tab Bar
export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-xl bg-[var(--color-surface-2)]', className)}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150',
            active === tab.value
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export * from './Button';
export * from './Input';
export * from './Card';
export * from './Badge';
