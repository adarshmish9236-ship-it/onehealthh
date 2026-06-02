import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill, Plus, Clock, Check, Edit, Trash2, AlertTriangle,
  Calendar, RefreshCw, ChevronRight, Loader2
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { ProgressBar, EmptyState, Alert } from '../ui/index'
import { Badge } from '../ui/Badge'
import { useToast } from '../ui/Toast'
import { cn } from '../../utils/formatters'
import api from '../../services/api'

const FREQ_LABELS = { once: 'Once daily', twice: 'Twice daily', thrice: 'Thrice daily', weekly: 'Weekly', as_needed: 'As needed' }

function MedCard({ med, onMarkTaken, onDelete }) {
  const isLow = med.remaining_days <= 7 && med.status === 'active'
  const progress = med.end_date && med.start_date
    ? Math.max(0, Math.min(100, (1 - med.remaining_days / Math.ceil((new Date(med.end_date) - new Date(med.start_date)) / 86400000)) * 100))
    : 50

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'rounded-2xl border bg-[var(--color-surface)] p-5 transition-all',
        isLow ? 'border-amber-300 shadow-[0_0_0_2px_rgba(217,119,6,0.1)]' : 'border-[var(--color-border)]'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[var(--color-text-primary)]">{med.name}</h3>
            {isLow && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                <AlertTriangle size={10} /> Low Supply
              </span>
            )}
            {med.taken_today && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                <Check size={10} /> Taken Today
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {med.dosage} · {FREQ_LABELS[med.frequency] || med.frequency}
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {!med.taken_today && med.status === 'active' && (
            <Button size="sm" variant="outline" onClick={() => onMarkTaken(med.id)} leftIcon={<Check size={12} />}>
              Mark Taken
            </Button>
          )}
          <button
            onClick={() => onDelete(med.id)}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-50 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)] mb-3">
        {med.timing?.length > 0 && <span className="flex items-center gap-1"><Clock size={10} /> {med.timing.join(', ')}</span>}
        {med.prescribed_by && <span className="flex items-center gap-1"><Calendar size={10} /> Rx: {med.prescribed_by}</span>}
        {med.remaining_days > 0 && <span className={cn(isLow ? 'text-amber-600 font-semibold' : '')}>{med.remaining_days} days remaining</span>}
      </div>

      {/* Progress */}
      {med.status === 'active' && med.end_date && (
        <ProgressBar value={progress} color={isLow ? 'warning' : 'primary'} size="sm" />
      )}

      {med.instructions && (
        <p className="text-xs text-[var(--color-text-muted)] mt-2 italic">📋 {med.instructions}</p>
      )}
    </motion.div>
  )
}

function AddMedModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'once', start_date: '', end_date: '', instructions: ''
  })
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, timing: [], refill_alert_days: 7 }
      const res = await api.post('/medications', payload)
      // add default fields for UI
      const newMed = { ...res.data, taken_today: false, remaining_days: 30 }
      onAdd(newMed)
      setForm({ name: '', dosage: '', frequency: 'once', start_date: '', end_date: '', instructions: '' })
      onClose()
    } catch (err) {
      toast.error('Error', err.response?.data?.error?.reason || 'Failed to add medication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Medication" description="Track a new medication with reminders." size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input id="med-name" label="Medication Name" placeholder="e.g., Metformin 500mg" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <div className="grid grid-cols-2 gap-4">
          <Input id="med-dosage" label="Dosage" placeholder="e.g., 1 tablet" required value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
          <Select id="med-freq" label="Frequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
            {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input id="med-start" label="Start Date" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          <Input id="med-end" label="End Date" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
        </div>
        <Input id="med-notes" label="Instructions (Optional)" placeholder="Take with food, avoid alcohol..." value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" isLoading={loading}>Save Medication</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Medications() {
  const [meds, setMeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  const toast = useToast()

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        setLoading(true)
        const res = await api.get('/medications')
        
        const mapped = res.data.map(m => {
          // Calculate remaining days roughly
          let rem = 30
          if (m.end_date) {
            const diff = new Date(m.end_date) - new Date()
            rem = Math.max(0, Math.ceil(diff / 86400000))
          }
          
          // Check if taken today (simplified)
          const todayStr = new Date().toISOString().split('T')[0]
          const taken = m.adherence_log?.some(l => l.date === todayStr && l.taken)
          
          return {
            ...m,
            remaining_days: rem,
            taken_today: taken
          }
        })
        setMeds(mapped)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMeds()
  }, [])

  const handleMarkTaken = async (id) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      await api.post(`/medications/${id}/dose`, { date: todayStr, taken: true })
      setMeds(prev => prev.map(m => m.id === id ? { ...m, taken_today: true } : m))
      toast.success('Dose Recorded', 'Medication marked as taken for today.')
    } catch(err) {
      toast.error('Error', 'Failed to mark dose')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medications/${id}`)
      setMeds(prev => prev.filter(m => m.id !== id))
      toast.info('Removed', 'Medication removed from your list.')
    } catch(err) {
      toast.error('Error', 'Failed to delete medication')
    }
  }

  const handleAdd = (med) => {
    setMeds(prev => [med, ...prev])
    toast.success('Medication Added', `${med.name} has been added to your tracker.`)
  }

  const filtered = meds.filter(m => m.status === activeTab)
  const lowSupply = meds.filter(m => m.remaining_days <= 7 && m.status === 'active')
  const takenToday = meds.filter(m => m.taken_today && m.status === 'active').length
  const totalActive = meds.filter(m => m.status === 'active').length

  return (
    <div className="page-container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Medications</h1>
          <p className="text-[var(--color-text-secondary)] mt-0.5">Track and manage your prescriptions</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>Add Medication</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',     value: totalActive,  color: 'text-[var(--color-primary)]' },
          { label: 'Taken Today', value: `${takenToday}/${totalActive}`, color: 'text-emerald-600' },
          { label: 'Low Supply', value: lowSupply.length, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
            <p className={cn('text-2xl font-black font-data', s.color)}>{s.value}</p>
            <p className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Low Supply Alert */}
      {lowSupply.length > 0 && (
        <Alert type="warning" title="⚠ Refill Soon">
          {lowSupply.map(m => m.name).join(', ')} {lowSupply.length === 1 ? 'is' : 'are'} running low. Refill within 7 days.
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {['active', 'completed'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all',
              activeTab === t
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Medication List */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Pill size={28} />}
            title={activeTab === 'active' ? 'No active medications' : 'No completed medications'}
            description={activeTab === 'active' ? 'Add your first medication to start tracking.' : 'Completed medications will appear here.'}
            action={activeTab === 'active' ? <Button leftIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>Add Medication</Button> : null}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(med => (
              <MedCard key={med.id} med={med} onMarkTaken={handleMarkTaken} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <AddMedModal isOpen={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  )
}
