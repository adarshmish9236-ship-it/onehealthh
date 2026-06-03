import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, AlertTriangle, Heart, Pill, Droplet,
  Share2, QrCode, Copy, Check, Mic, X, ChevronDown,
  Shield, Clock, Siren, ChevronLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Alert } from '../ui/index'
import { cn } from '../../utils/formatters'

function DataSection({ icon: Icon, title, children, iconColor = 'text-blue-600 dark:text-blue-400', bgColor = 'bg-blue-50 dark:bg-blue-900/20' }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className={cn('p-2 rounded-lg', bgColor)}>
          <Icon size={18} className={iconColor} />
        </div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ContactButton({ contact, index }) {
  return (
    <motion.a
      href={`tel:${contact.phone}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 group"
    >
      <div className="flex-1">
        <p className="font-bold text-lg text-slate-900 dark:text-white">{contact.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{contact.relationship}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-0.5">{contact.phone}</p>
      </div>
      <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-600 flex items-center justify-center transition-all duration-200">
        <Phone size={20} className="text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
      </div>
    </motion.a>
  )
}

function AIGuidancePanel() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const MOCK_RESULT = {
    risk_level: 'critical',
    possible_emergency: 'Possible Cardiac Event (Acute MI)',
    immediate_instructions: [
      'Have the patient sit or lie down in a comfortable position immediately.',
      'Loosen any tight clothing around the chest and neck.',
      'If the patient takes prescribed nitroglycerin, help them take it now.',
      'Keep the patient calm and still — avoid any physical exertion.',
      'Begin CPR if the patient becomes unresponsive and stops breathing.',
    ],
    call_emergency_services: true,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setResult(MOCK_RESULT)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border-2 border-red-500 dark:border-red-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="bg-red-600 dark:bg-red-700 px-5 py-4 flex items-center gap-3">
        <Siren size={20} className="text-white" />
        <h3 className="font-bold text-white text-lg">AI Emergency Guidance</h3>
      </div>
      <div className="p-5 space-y-4">
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">Describe the emergency symptoms to get immediate AI guidance.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g., severe chest pain, left arm numbness..."
                className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button type="button" className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Mic size={18} />
              </button>
            </div>
            <Button
              type="submit"
              variant="destructive"
              className="w-full text-white font-bold shadow-md"
              isLoading={loading}
            >
              {loading ? 'Analyzing...' : 'Get AI Emergency Guidance'}
            </Button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {result.call_emergency_services && (
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-red-600 dark:bg-red-700 text-white p-4 rounded-xl font-bold text-center text-lg flex items-center justify-center gap-3 shadow-lg"
              >
                <Phone size={24} />
                CALL 112 IMMEDIATELY
              </motion.div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Possible Condition</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{result.possible_emergency}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Immediate Steps</p>
              <ol className="space-y-3">
                {result.immediate_instructions.map((inst, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 flex items-center justify-center flex-shrink-0 font-bold text-xs border border-red-200 dark:border-red-800">
                      {i + 1}
                    </span>
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
            <Button variant="outline" className="w-full text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => { setResult(null); setQuery('') }}>
              New Situation
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function Emergency() {
  const profile = useUserStore(s => s.profile)
  const p = profile?.profile
  const navigate = useNavigate()

  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://onehealth.in/emergency/${profile?.uid || 'demo-user'}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Red Emergency Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-2 rounded-xl"
                onClick={() => navigate(-1)}
                title="Go Back"
              >
                <ChevronLeft size={28} />
              </Button>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0"
              >
                <AlertTriangle size={32} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">EMERGENCY CARD</h1>
                <p className="text-red-100 font-medium text-sm sm:text-base">Medical Information for First Responders</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShareOpen(true)}
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white font-bold border rounded-xl"
                leftIcon={<Share2 size={16} />}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Patient Identity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 overflow-hidden shadow-md"
        >
          <div className="bg-red-50 dark:bg-red-900/10 px-4 sm:px-6 py-5 flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 border border-red-200 dark:border-red-800/50 flex items-center justify-center text-2xl sm:text-3xl font-black text-red-700 dark:text-red-400 flex-shrink-0">
              {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'UN'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">{profile?.name || 'Unknown Patient'}</h2>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-1.5">
                {p?.dob ? (
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                    {new Date().getFullYear() - new Date(p.dob).getFullYear()} years old
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                    Age unknown
                  </span>
                )}
                {p?.gender && (
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                    {p.gender}
                  </span>
                )}
              </div>
            </div>
            {/* HUGE Blood Group */}
            <div className="flex-shrink-0 text-center ml-2 sm:ml-0">
              <div className="bg-red-600 dark:bg-red-700 text-white w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-lg border-2 border-red-500 dark:border-red-600">
                <div>
                  <p className="text-3xl sm:text-4xl font-black leading-none">{p?.blood_group || '--'}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-90 mt-1">Blood</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2-column grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Allergies */}
          <DataSection icon={AlertTriangle} title="Known Allergies" iconColor="text-red-600 dark:text-red-400" bgColor="bg-red-50 dark:bg-red-900/20">
            {p?.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {p.allergies.map(a => (
                  <span key={a} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg font-bold text-xs sm:text-sm border border-red-200 dark:border-red-800/50 shadow-sm">
                    ⚠ {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No known allergies</p>
            )}
          </DataSection>

          {/* Chronic Diseases */}
          <DataSection icon={Heart} title="Chronic Conditions" iconColor="text-amber-600 dark:text-amber-500" bgColor="bg-amber-50 dark:bg-amber-900/20">
            {p?.chronic_diseases?.length > 0 ? (
              <ul className="space-y-2.5">
                {p.chronic_diseases.map(d => (
                  <li key={d} className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No chronic conditions</p>
            )}
          </DataSection>

          {/* Current Medications */}
          <DataSection icon={Pill} title="Current Medications" iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-900/20">
            <div className="space-y-3">
              {p?.current_medications?.length > 0 ? p.current_medications.map((med, i) => (
                <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">{med.dosage}</p>
                </div>
              )) : (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No active medications</p>
              )}
            </div>
          </DataSection>

          {/* Emergency Contacts */}
          <DataSection icon={Phone} title="Emergency Contacts" iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-900/20">
            <div className="space-y-3">
              {p?.emergency_contacts?.length > 0 ? p.emergency_contacts.map((c, i) => (
                <ContactButton key={i} contact={c} index={i} />
              )) : (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No emergency contacts listed</p>
              )}
            </div>
          </DataSection>
        </div>

        {/* AI Emergency Guidance */}
        <AIGuidancePanel />
      </div>

      {/* Share Modal */}
      <Modal isOpen={shareOpen} onClose={() => setShareOpen(false)} title="Share Emergency Card" description="Generate a shareable link for first responders." size="sm">
        <div className="p-6 space-y-4">
          <Alert type="warning" title="Valid for 24 hours">
            Anyone with this link can view your emergency card without logging in.
          </Alert>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              className="text-slate-700 dark:text-slate-300 font-semibold"
              leftIcon={copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="flex flex-col items-center gap-3 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <QrCode size={80} className="text-slate-400 dark:text-slate-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scan QR code to view emergency card</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
