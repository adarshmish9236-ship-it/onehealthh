import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, ArrowRight, ArrowLeft, Check, Plus, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { ProgressBar } from '../components/ui/index'
import { useAuthStore } from '../store/authStore'
import { useUserStore } from '../store/userStore'
import {
  BLOOD_GROUPS, GENDERS, COMMON_ALLERGIES, COMMON_CONDITIONS, COMMON_VACCINES
} from '../utils/constants'
import { cn } from '../utils/formatters'

const STEPS = [
  { id: 1, title: 'Basic Information', desc: 'Vital details that power your Emergency Card' },
  { id: 2, title: 'Medical Background', desc: 'Allergies, conditions, and medical history' },
  { id: 3, title: 'Emergency Contacts', desc: 'Who to call in a medical emergency' },
  { id: 4, title: 'Vaccination Records', desc: 'Your immunization history' },
]

function StepBasicInfo({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input id="ob-dob" label="Date of Birth" type="date" required value={data.dob} onChange={e => onChange('dob', e.target.value)} />
        <Select id="ob-gender" label="Gender" required value={data.gender} onChange={e => onChange('gender', e.target.value)}>
          <option value="">Select gender</option>
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </Select>
      </div>
      <Select id="ob-blood" label="Blood Group" required value={data.blood_group} onChange={e => onChange('blood_group', e.target.value)}>
        <option value="">Select blood group</option>
        {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input id="ob-height" label="Height (cm)" type="number" placeholder="163" value={data.height_cm} onChange={e => onChange('height_cm', e.target.value)} />
        <Input id="ob-weight" label="Weight (kg)" type="number" placeholder="58" value={data.weight_kg} onChange={e => onChange('weight_kg', e.target.value)} />
      </div>
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-xs font-semibold text-blue-700">These fields populate your Emergency Card — they cannot be skipped.</p>
      </div>
    </div>
  )
}

function ChipSelector({ label, options, selected, onToggle, onAdd, addPlaceholder }) {
  const [custom, setCustom] = useState('')
  const handleAdd = (e) => {
    e.preventDefault()
    if (custom.trim()) { onAdd(custom.trim()); setCustom('') }
  }
  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
              selected.includes(o)
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
            )}
          >
            {o}
          </button>
        ))}
      </div>
      {onAdd && (
        <form onSubmit={handleAdd} className="flex gap-2 mt-2">
          <input
            type="text"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder={addPlaceholder}
            className="flex-1 h-9 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
          />
          <Button type="submit" size="sm" variant="outline" leftIcon={<Plus size={12} />}>Add</Button>
        </form>
      )}
    </div>
  )
}

function StepMedical({ data, onChange }) {
  const toggleAllergy = (a) => onChange('allergies', data.allergies.includes(a) ? data.allergies.filter(x => x !== a) : [...data.allergies, a])
  const addAllergy = (a) => onChange('allergies', [...data.allergies, a])
  const toggleCondition = (c) => onChange('chronic_diseases', data.chronic_diseases.includes(c) ? data.chronic_diseases.filter(x => x !== c) : [...data.chronic_diseases, c])
  const addCondition = (c) => onChange('chronic_diseases', [...data.chronic_diseases, c])
  return (
    <div className="space-y-6">
      <ChipSelector label="Known Allergies" options={COMMON_ALLERGIES} selected={data.allergies} onToggle={toggleAllergy} onAdd={addAllergy} addPlaceholder="Add custom allergy..." />
      <div className="h-px bg-[var(--color-border)]" />
      <ChipSelector label="Chronic Diseases" options={COMMON_CONDITIONS} selected={data.chronic_diseases} onToggle={toggleCondition} onAdd={addCondition} addPlaceholder="Add custom condition..." />
      <Input id="ob-notes" label="Other Medical Notes (Optional)" placeholder="Any additional information for your doctor..." value={data.medical_notes} onChange={e => onChange('medical_notes', e.target.value)} />
    </div>
  )
}

function StepContacts({ contacts, onAdd, onRemove, onUpdate }) {
  return (
    <div className="space-y-4">
      {contacts.map((c, i) => (
        <div key={i} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">Contact {i + 1}</span>
            {i > 0 && <button type="button" onClick={() => onRemove(i)} className="text-[var(--color-danger)] text-xs hover:opacity-70">Remove</button>}
          </div>
          <Input id={`ec-name-${i}`} placeholder="Full name" value={c.name} onChange={e => onUpdate(i, 'name', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select id={`ec-rel-${i}`} value={c.relationship} onChange={e => onUpdate(i, 'relationship', e.target.value)}>
              <option value="">Relationship</option>
              {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Family Doctor', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Input id={`ec-phone-${i}`} type="tel" placeholder="+91 98765..." value={c.phone} onChange={e => onUpdate(i, 'phone', e.target.value)} />
          </div>
        </div>
      ))}
      {contacts.length < 3 && (
        <Button type="button" variant="outline" onClick={() => onAdd({ name: '', relationship: '', phone: '' })} leftIcon={<Plus size={14} />} className="w-full">
          Add Contact ({contacts.length}/3)
        </Button>
      )}
    </div>
  )
}

function StepVaccinations({ vaccines, onToggle }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-text-muted)]">Select all vaccines you have received.</p>
      <div className="grid grid-cols-2 gap-2">
        {COMMON_VACCINES.map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onToggle(v)}
            className={cn(
              'flex items-center gap-2 p-3 rounded-xl border text-sm font-medium text-left transition-all',
              vaccines.includes(v)
                ? 'border-[var(--color-accent)] bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
            )}
          >
            <span className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              vaccines.includes(v) ? 'border-emerald-600 bg-emerald-600' : 'border-[var(--color-border)]')}>
              {vaccines.includes(v) && <Check size={10} className="text-white" />}
            </span>
            <span className="truncate text-xs">{v}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const saveProfile = useUserStore(s => s.saveProfile)
  const setProfile = useUserStore(s => s.setProfile)

  const [basicInfo, setBasicInfo] = useState({ dob: '', gender: '', blood_group: '', height_cm: '', weight_kg: '' })
  const [medInfo, setMedInfo] = useState({ allergies: [], chronic_diseases: [], medical_notes: '' })
  const [contacts, setContacts] = useState([{ name: '', relationship: '', phone: '' }])
  const [vaccines, setVaccines] = useState([])

  const updateBasic = (k, v) => setBasicInfo(f => ({ ...f, [k]: v }))
  const updateMed = (k, v) => setMedInfo(f => ({ ...f, [k]: v }))

  const handleComplete = async () => {
    setLoading(true)
    try {
      const uid = user?.uid
      if (!uid) throw new Error('Not authenticated')

      const profileData = {
        profile: {
          dob: basicInfo.dob,
          gender: basicInfo.gender,
          blood_group: basicInfo.blood_group,
          height_cm: basicInfo.height_cm ? Number(basicInfo.height_cm) : null,
          weight_kg: basicInfo.weight_kg ? Number(basicInfo.weight_kg) : null,
          allergies: medInfo.allergies,
          chronic_diseases: medInfo.chronic_diseases,
          medical_notes: medInfo.medical_notes,
          emergency_contacts: contacts.filter(c => c.name),
          vaccinations: vaccines,
        },
        onboarding_complete: true,
        updatedAt: new Date().toISOString(),
      }

      await saveProfile(uid, profileData)
      setProfile(profileData.profile)
      navigate('/dashboard')
    } catch (err) {
      console.error('[Onboarding] save error:', err)
      // Navigate anyway — user can update later
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const step = STEPS[currentStep - 1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary)] via-purple-500 to-[var(--color-accent)]" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center">
              <HeartPulse size={18} className="text-white" />
            </div>
            <span className="text-xl font-black text-[var(--color-text-primary)]">oneHealth</span>
          </div>
          <span className="text-sm text-[var(--color-text-muted)] font-medium">Step {currentStep} of 4</span>
        </div>
        <ProgressBar value={(currentStep / 4) * 100} color="primary" className="mb-6" />

        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden">
          <div className="p-6 pb-4 border-b border-[var(--color-border)] bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-sm font-black flex items-center justify-center">{currentStep}</div>
              <h1 className="text-xl font-black text-[var(--color-text-primary)]">{step.title}</h1>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] ml-10">{step.desc}</p>
          </div>
          <div className="p-6 max-h-[55vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                {currentStep === 1 && <StepBasicInfo data={basicInfo} onChange={updateBasic} />}
                {currentStep === 2 && <StepMedical data={medInfo} onChange={updateMed} />}
                {currentStep === 3 && <StepContacts contacts={contacts} onAdd={(c) => setContacts(p => [...p, c])} onRemove={(i) => setContacts(p => p.filter((_, idx) => idx !== i))} onUpdate={(i, k, v) => setContacts(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c))} />}
                {currentStep === 4 && <StepVaccinations vaccines={vaccines} onToggle={(v) => setVaccines(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])} />}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="p-6 pt-4 border-t border-[var(--color-border)] flex gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} leftIcon={<ArrowLeft size={16} />} className="flex-1">Back</Button>
            )}
            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(s => s + 1)} className="flex-1" rightIcon={<ArrowRight size={16} />}>Continue</Button>
            ) : (
              <Button onClick={handleComplete} isLoading={loading} className="flex-1" rightIcon={<Check size={16} />}>Complete Setup</Button>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-5">
          {[1,2,3,4].map(s => (
            <div key={s} className={cn('h-1.5 rounded-full transition-all duration-300', s === currentStep ? 'w-8 bg-[var(--color-primary)]' : s < currentStep ? 'w-4 bg-[var(--color-primary)]/50' : 'w-4 bg-[var(--color-surface-2)]')} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Onboarding

