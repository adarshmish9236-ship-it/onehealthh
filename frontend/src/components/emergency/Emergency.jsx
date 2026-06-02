import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, AlertTriangle, Heart, Pill, Droplet,
  Share2, QrCode, Copy, Check, Mic, X, ChevronDown,
  Shield, Clock, Siren
} from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Alert } from '../ui/index'
import { cn } from '../../utils/formatters'

function DataSection({ icon: Icon, title, children, iconColor = 'text-[var(--color-primary)]', bgColor = 'bg-blue-50' }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
        <div className={cn('p-2 rounded-lg', bgColor)}>
          <Icon size={18} className={iconColor} />
        </div>
        <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{title}</h3>
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
      className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-2)] hover:bg-green-50 hover:border-green-200 border border-transparent transition-all duration-200 group"
    >
      <div className="flex-1">
        <p className="font-bold text-lg text-[var(--color-text-primary)]">{contact.name}</p>
        <p className="text-sm text-[var(--color-text-muted)] font-medium uppercase tracking-wide">{contact.relationship}</p>
        <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-0.5">{contact.phone}</p>
      </div>
      <div className="w-12 h-12 rounded-lg bg-green-100 group-hover:bg-green-600 flex items-center justify-center transition-all duration-200">
        <Phone size={20} className="text-green-600 group-hover:text-white" />
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
    <div className="rounded-2xl border-2 border-[var(--color-danger)] bg-[var(--color-surface)] overflow-hidden">
      <div className="bg-red-600 px-5 py-4 flex items-center gap-3">
        <Siren size={20} className="text-white" />
        <h3 className="font-bold text-white text-lg">AI Emergency Guidance</h3>
      </div>
      <div className="p-5 space-y-4">
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-[var(--color-text-secondary)]">Describe the emergency symptoms to get immediate AI guidance.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g., severe chest pain, left arm numbness..."
                className="flex-1 h-11 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              />
              <button type="button" className="h-11 w-11 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <Mic size={18} />
              </button>
            </div>
            <Button
              type="submit"
              variant="destructive"
              className="w-full"
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
                className="bg-red-600 text-white p-4 rounded-xl font-bold text-center text-lg flex items-center justify-center gap-3"
              >
                <Phone size={24} />
                CALL 112 IMMEDIATELY
              </motion.div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Possible Condition</p>
              <p className="text-xl font-bold text-[var(--color-danger)]">{result.possible_emergency}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Immediate Steps</p>
              <ol className="space-y-3">
                {result.immediate_instructions.map((inst, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium text-[var(--color-text-primary)]">
                    <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      {i + 1}
                    </span>
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setResult(null); setQuery('') }}>
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

  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://onehealth.in/emergency/${profile?.uid || 'demo-user'}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-[var(--color-background)]">
      {/* Red Emergency Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white">
        <div className="page-container py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center"
              >
                <AlertTriangle size={32} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">EMERGENCY CARD</h1>
                <p className="text-red-200 font-medium">Medical Information for First Responders</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShareOpen(true)}
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white border"
                leftIcon={<Share2 size={16} />}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-6 space-y-5">
        {/* Patient Identity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-[var(--color-danger)] bg-[var(--color-surface)] overflow-hidden shadow-lg"
        >
          <div className="bg-red-50 px-6 py-5 flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center text-3xl font-black text-red-800 flex-shrink-0">
              {profile?.name?.split(' ').map(n => n[0]).join('') || 'PS'}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-[var(--color-text-primary)]">{profile?.name}</h2>
              <div className="flex flex-wrap gap-3 mt-1">
                {p?.dob && <span className="text-sm font-semibold text-[var(--color-text-secondary)]">{new Date().getFullYear() - new Date(p.dob).getFullYear()} years old</span>}
                {p?.gender && <span className="text-sm text-[var(--color-text-muted)]">· {p.gender}</span>}
              </div>
            </div>
            {/* HUGE Blood Group */}
            <div className="flex-shrink-0 text-center">
              <div className="bg-[var(--color-danger)] text-white w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg">
                <div>
                  <p className="text-4xl font-black leading-none">{p?.blood_group || 'O+'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">Blood</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2-column grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Allergies */}
          <DataSection icon={AlertTriangle} title="Known Allergies" iconColor="text-red-600" bgColor="bg-red-50">
            {p?.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {p.allergies.map(a => (
                  <span key={a} className="px-4 py-2 bg-red-100 text-red-900 rounded-lg font-bold text-sm border-2 border-red-200">
                    ⚠ {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-text-muted)] font-medium">No known allergies</p>
            )}
          </DataSection>

          {/* Chronic Diseases */}
          <DataSection icon={Heart} title="Chronic Conditions" iconColor="text-orange-600" bgColor="bg-orange-50">
            {p?.chronic_diseases?.length > 0 ? (
              <ul className="space-y-2">
                {p.chronic_diseases.map(d => (
                  <li key={d} className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
                    <span className="w-2 h-2 rounded-lg bg-orange-500 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--color-text-muted)] font-medium">No chronic conditions</p>
            )}
          </DataSection>

          {/* Current Medications */}
          <DataSection icon={Pill} title="Current Medications" iconColor="text-blue-600" bgColor="bg-blue-50">
            <div className="space-y-2">
              {[
                { name: 'Salbutamol 100mcg', dosage: '2 puffs as needed' },
                { name: 'Amlodipine 5mg', dosage: '1 tablet daily (morning)' },
              ].map((med, i) => (
                <div key={i} className="p-3 bg-[var(--color-surface-2)] rounded-xl">
                  <p className="font-bold text-[var(--color-text-primary)]">{med.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{med.dosage}</p>
                </div>
              ))}
            </div>
          </DataSection>

          {/* Emergency Contacts */}
          <DataSection icon={Phone} title="Emergency Contacts" iconColor="text-green-600" bgColor="bg-green-50">
            <div className="space-y-3">
              {p?.emergency_contacts?.map((c, i) => (
                <ContactButton key={i} contact={c} index={i} />
              ))}
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
              className="flex-1 h-10 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-text-primary)] focus:outline-none"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              leftIcon={copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="flex flex-col items-center gap-3 py-4 bg-[var(--color-surface-2)] rounded-xl">
            <QrCode size={80} className="text-[var(--color-text-secondary)]" />
            <p className="text-xs text-[var(--color-text-muted)]">Scan QR code to view emergency card</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
