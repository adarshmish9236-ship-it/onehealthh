import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return isValid(d) ? format(d, fmt) : '—'
  } catch { return '—' }
}

export const formatRelative = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
  } catch { return '—' }
}

export const getAge = (dob) => {
  if (!dob) return '—'
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export const getRecordTypeLabel = (type) => ({
  report: 'Lab Report',
  prescription: 'Prescription',
  diagnosis: 'Diagnosis',
  vaccination: 'Vaccination',
  symptom_check: 'Symptom Check',
  treatment: 'Treatment',
  followup: 'Follow-Up',
}[type] || type)

export const getRecordTypeColor = (type) => ({
  report:        { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  prescription:  { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  diagnosis:     { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  vaccination:   { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  symptom_check: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  treatment:     { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500' },
  followup:      { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' },
}[type] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' })

export const getSeverityConfig = (severity) => ({
  low:      { label: 'Low Risk', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '✓' },
  medium:   { label: 'Medium Risk', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠' },
  high:     { label: 'High Risk', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: '✕' },
  critical: { label: 'Critical', color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-400', icon: '🚨' },
}[severity] || { label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: '?' })

export const getHealthScoreConfig = (score) => {
  if (score >= 70) return { label: 'Good', color: '#0E9F6E', ring: '#0E9F6E', bg: 'from-emerald-50 to-green-50' }
  if (score >= 40) return { label: 'Fair', color: '#d97706', ring: '#d97706', bg: 'from-amber-50 to-yellow-50' }
  return { label: 'Needs Attention', color: '#E02424', ring: '#E02424', bg: 'from-red-50 to-rose-50' }
}

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

export const cn = (...classes) => twMerge(clsx(classes))
