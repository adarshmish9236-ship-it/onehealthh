import React, { useMemo } from 'react'
import { Pill, Clock, AlertCircle, CheckCircle2, Info, Zap } from 'lucide-react'

const FREQ_LABEL = {
  once: 'Once daily',
  twice: 'Twice daily',
  three_times: '3× daily',
  four_times: '4× daily',
  as_needed: 'As needed',
}

const DEFAULT_COLORS = [
  '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#f97316', '#14b8a6', '#ec4899'
]

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function isActiveToday(med) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = med.start_date ? new Date(med.start_date) : null
  const end = med.end_date ? new Date(med.end_date) : null
  if (start && today < start) return false
  if (end && today > end) return false
  return med.status === 'active'
}

export function TodaysMedications({ timeline }) {
  const meds = useMemo(() => {
    if (!timeline?.length) return []
    return timeline
      .filter(t => t.type === 'medication')
      .map(t => t.data)
      .filter(isActiveToday)
      .sort((a, b) => {
        const aT = a.timing?.[0] || '99:99'
        const bT = b.timing?.[0] || '99:99'
        return aT.localeCompare(bT)
      })
  }, [timeline])

  if (meds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
        <p className="font-semibold text-slate-600 dark:text-slate-400">No medications today</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No active prescriptions for today.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Summary pill */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-500/20">
          <Pill className="w-3 h-3" />
          {meds.length} medication{meds.length !== 1 ? 's' : ''} today
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-100 dark:border-emerald-500/20">
          <Zap className="w-3 h-3" />
          {meds.reduce((acc, m) => acc + (m.timing?.length || 0), 0)} doses scheduled
        </span>
      </div>

      {/* Med cards */}
      {meds.map((med, i) => {
        const color = med.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]
        return (
          <div
            key={med.id || i}
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            {/* Color dot + icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${color}18`, border: `1.5px solid ${color}40` }}
            >
              <Pill className="w-4 h-4" style={{ color }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {med.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {med.dosage} · {FREQ_LABEL[med.frequency] || med.frequency}
                  </p>
                </div>
                {/* Timing chips */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {med.timing?.length > 0
                    ? med.timing.map(t => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(t)}
                        </span>
                      ))
                    : <span className="text-[10px] text-slate-400">Flexible</span>
                  }
                </div>
              </div>

              {/* Condition + Category tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {med.condition && (
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold rounded-md">
                    {med.condition}
                  </span>
                )}
                {med.category && (
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold rounded-md">
                    {med.category}
                  </span>
                )}
              </div>

              {/* Instructions */}
              {med.instructions && (
                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                  <Info className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-snug">
                    {med.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
