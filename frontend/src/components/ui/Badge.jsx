import React from 'react'
import { cn } from '../../utils/formatters'

const badgeVariants = {
  default:     'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-blue-500/20 dark:text-blue-300',
  primary:     'bg-[var(--color-primary)] text-white',
  success:     'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  warning:     'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  danger:      'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  outline:     'border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] bg-transparent',
  blue:        'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  purple:      'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300',
  orange:      'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  teal:        'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300',
  slate:       'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
}

export const Badge = ({ className, variant = 'default', size = 'sm', dot = false, children, ...props }) => {
  const sizes = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2.5 py-0.5 text-xs', md: 'px-3 py-1 text-sm' }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium',
        badgeVariants[variant] || badgeVariants.default,
        sizes[size] || sizes.sm,
        className
      )}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-sm bg-current flex-shrink-0" />}
      {children}
    </span>
  )
}

// Status badge for record types
export const RecordTypeBadge = ({ type }) => {
  const configs = {
    report:        { variant: 'blue',    label: 'Lab Report' },
    prescription:  { variant: 'success', label: 'Prescription' },
    diagnosis:     { variant: 'purple',  label: 'Diagnosis' },
    vaccination:   { variant: 'orange',  label: 'Vaccination' },
    symptom_check: { variant: 'warning', label: 'Symptom Check' },
    treatment:     { variant: 'teal',    label: 'Treatment' },
    followup:      { variant: 'slate',   label: 'Follow-Up' },
  }
  const config = configs[type] || { variant: 'slate', label: type }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Severity badge
export const SeverityBadge = ({ severity }) => {
  const configs = {
    low:      { variant: 'success', label: 'Low Risk' },
    medium:   { variant: 'warning', label: 'Medium Risk' },
    high:     { variant: 'danger',  label: 'High Risk' },
    critical: { variant: 'danger',  label: 'Critical' },
  }
  const config = configs[severity] || { variant: 'slate', label: severity }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
