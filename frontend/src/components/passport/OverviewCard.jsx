import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Activity, FileText, Pill, Syringe, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function OverviewCard({ profile, healthMetrics }) {
  const [copied, setCopied] = useState(false)
  const name = profile?.name || 'User'
  const initials = name.split(' ').map(n => n[0]).join('').substring(0,2) || 'U'
  const p = profile?.profile || {}
  
  const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : '--'
  const gender = p.gender || '--'
  const bloodGroup = p.blood_group || '--'
  const passportId = profile?.passport_id || 'Not Assigned'

  const copyId = () => {
    navigator.clipboard.writeText(passportId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden border-4 border-white shadow-sm flex items-center justify-center">
              {p.photo_url ? (
                <img src={p.photo_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-blue-600 uppercase">{initials}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{name}</h2>
              <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>{age} yrs</span>
                <span>•</span>
                <span>{gender}</span>
                <span>•</span>
                <span className="font-semibold text-danger">{bloodGroup} Blood Group</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 min-w-[200px]">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Health Passport ID</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-widest">{passportId}</span>
              {passportId !== 'Not Assigned' && (
                <button onClick={copyId} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-subtle border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-xl font-bold dark:text-white">{healthMetrics?.reports_count || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Reports</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-subtle border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
              <Pill size={20} />
            </div>
            <div>
              <div className="text-xl font-bold dark:text-white">{healthMetrics?.prescriptions_count || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Prescriptions</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-subtle border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-xl font-bold dark:text-white">{healthMetrics?.consultations_count || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Consultations</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-subtle border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
              <Syringe size={20} />
            </div>
            <div>
              <div className="text-xl font-bold dark:text-white">{healthMetrics?.vaccinations_count || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Vaccinations</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
