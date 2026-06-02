import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope, Search, Plus, X, Check, ChevronRight,
  AlertTriangle, Sparkles, Save, RotateCcw, Clock,
  TrendingUp, Pill, Info
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Alert, EmptyState, Spinner } from '../ui/index'
import { SeverityBadge } from '../ui/Badge'
import { useUserStore } from '../../store/userStore'
import { useRecordsStore } from '../../store/recordsStore'
import { useToast } from '../ui/Toast'
import { SYMPTOM_CATEGORIES, DURATION_OPTIONS } from '../../utils/constants'
import { cn } from '../../utils/formatters'

const MOCK_AI_RESULT = {
  severity: 'medium',
  severity_explanation: 'Your symptoms suggest a common respiratory infection. Monitor closely and seek care if symptoms worsen.',
  possible_conditions: [
    { name: 'Viral URI (Common Cold)', explanation: 'A viral infection affecting your nose and throat. Usually resolves in 7–10 days.', confidence: 'high' },
    { name: 'Influenza (Flu)', explanation: 'A more severe viral infection. Characterized by sudden onset and body aches.', confidence: 'medium' },
    { name: 'Allergic Rhinitis', explanation: 'Nasal inflammation caused by allergens like pollen or dust.', confidence: 'low' },
  ],
  recommendations: [
    'Rest as much as possible and stay well-hydrated.',
    'Monitor your temperature every 4–6 hours.',
    'Use steam inhalation or a humidifier to relieve congestion.',
    'Avoid close contact with others to prevent spread.',
  ],
  otc_suggestions: [
    { medicine: 'Paracetamol 500mg', dosage_note: '1 tablet every 6 hours for fever/pain' },
    { medicine: 'Saline Nasal Spray', dosage_note: '2–3 sprays per nostril, 3–4 times daily' },
    { medicine: 'Cetirizine 10mg', dosage_note: '1 tablet at night for runny nose' },
  ],
  warning_signs: [
    'Fever exceeds 103°F (39.4°C)',
    'Difficulty breathing or chest pain develops',
    'Symptoms worsen significantly after 3 days',
  ],
  seek_emergency: false,
  disclaimer: 'This is AI guidance only. Consult a qualified doctor for an accurate diagnosis and treatment.',
}

function SymptomChip({ symptom, selected, onToggle }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={() => onToggle(symptom)}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
        selected
          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
          : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
      )}
    >
      {selected && <span className="mr-1">✓</span>}
      {symptom}
    </motion.button>
  )
}

function ResultsView({ result, onReset, onSave }) {
  const cfg = {
    low:    { gradient: 'from-emerald-500 to-green-600', bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: '✓' },
    medium: { gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', text: 'text-amber-900', icon: '⚠' },
    high:   { gradient: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-900', icon: '🚨' },
  }[result.severity] || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Severity Banner */}
      <div className={cn('rounded-2xl overflow-hidden border', cfg.border)}>
        <div className={cn('bg-gradient-to-r p-5 text-white', cfg.gradient)}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{cfg.icon}</span>
            <div>
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Risk Assessment</p>
              <h2 className="text-2xl font-black">{result.severity === 'low' ? 'Low Risk' : result.severity === 'medium' ? 'Medium Risk' : 'High Risk'}</h2>
            </div>
          </div>
          <p className="mt-3 text-sm opacity-90">{result.severity_explanation}</p>
        </div>
        {result.seek_emergency && (
          <div className="bg-red-700 p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-white flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-bold">Seek Immediate Medical Attention</p>
            </div>
            <Button variant="outline" size="sm" className="text-white border-white/50 hover:bg-white/20">
              Call Emergency
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Possible Conditions */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Possible Conditions</h3>
          <div className="space-y-3">
            {result.possible_conditions.map((cond, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-[var(--color-text-primary)]">{cond.name}</h4>
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                    cond.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                    cond.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  )}>
                    {cond.confidence} confidence
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{cond.explanation}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] italic">{result.disclaimer}</p>
        </div>

        <div className="space-y-5">
          {/* Recommendations */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-3">What to Do Now</h3>
            <ol className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--color-text-primary)]">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ol>
          </div>

          {/* OTC Suggestions */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
              <Pill size={18} className="text-[var(--color-primary)]" /> OTC Suggestions
            </h3>
            <div className="space-y-2">
              {result.otc_suggestions.map((m, i) => (
                <div key={i} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-900">{m.medicine}</p>
                  <p className="text-xs text-blue-700">{m.dosage_note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Signs */}
          {result.warning_signs?.length > 0 && (
            <Alert type="warning" title="⚠ Warning Signs — Seek Care If:">
              <ul className="list-disc pl-4 space-y-1 mt-1">
                {result.warning_signs.map((w, i) => (
                  <li key={i} className="text-sm">{w}</li>
                ))}
              </ul>
            </Alert>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1" leftIcon={<Save size={16} />} onClick={onSave}>
          Save to Passport
        </Button>
        <Button variant="outline" className="flex-1" leftIcon={<RotateCcw size={16} />} onClick={onReset}>
          Start Over
        </Button>
      </div>
    </motion.div>
  )
}

import { aiService } from '../../services/aiService'

...

export default function SymptomAnalyzer() {
  const [state, setState] = useState('input') // input | loading | results
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [customInput, setCustomInput] = useState('')
  const [duration, setDuration] = useState('')
  const [result, setResult] = useState(null)
  const [activeCategory, setActiveCategory] = useState('General')
  const profile = useUserStore(s => s.profile)
  const addRecord = useRecordsStore(s => s.addRecord)
  const toast = useToast()

  const toggleSymptom = (s) => {
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const addCustom = (e) => {
    e.preventDefault()
    if (customInput.trim() && !selectedSymptoms.includes(customInput.trim())) {
      setSelectedSymptoms(prev => [...prev, customInput.trim()])
      setCustomInput('')
    }
  }

  const handleAnalyze = async () => {
    try {
      setState('loading')
      
      const patient_context = {
        age: profile?.age,
        gender: profile?.gender,
        blood_group: profile?.blood_group,
        allergies: profile?.allergies || [],
        chronic_diseases: profile?.chronic_diseases || [],
        current_medications: profile?.current_medications || []
      }

      const res = await aiService.analyzeSymptoms({
        symptoms: selectedSymptoms,
        duration,
        patient_context
      })

      setResult(res)
      setState('results')
    } catch (err) {
      console.error('Analysis failed:', err)
      toast.error('Analysis Failed', 'Could not reach the AI service. Please try again.')
      setState('input')
    }
  }

  const handleSave = () => {
    addRecord({
      id: `rec-${Date.now()}`,
      type: 'symptom_check',
      date: new Date().toISOString().split('T')[0],
      title: `Symptom Check: ${selectedSymptoms.slice(0, 2).join(', ')}${selectedSymptoms.length > 2 ? '...' : ''}`,
      metadata: { doctor_name: 'oneHealth AI', hospital: '', notes: `Duration: ${duration}. Severity: ${result?.severity}` },
      ai_analysis: { summary: result?.severity_explanation, suggested_actions: result?.recommendations || [] },
    })
    toast.success('Saved to Passport', 'Your symptom analysis has been recorded.')
    setState('input')
    setSelectedSymptoms([])
    setDuration('')
    setResult(null)
  }

  const categories = Object.keys(SYMPTOM_CATEGORIES)

  return (
    <div className="page-container py-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 mb-4">
          <Stethoscope size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-[var(--color-text-primary)]">AI Symptom Analyzer</h1>
        <p className="text-[var(--color-text-secondary)] mt-1 max-w-lg mx-auto">
          Tell us how you're feeling — our AI will assess your symptoms and provide personalized guidance.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {state === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-5"
          >
            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                  Selected Symptoms ({selectedSymptoms.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map(s => (
                    <span key={s} className="inline-flex items-center gap-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1.5 rounded-full text-sm font-medium">
                      {s}
                      <button onClick={() => toggleSymptom(s)} className="hover:text-[var(--color-danger)] transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Symptom Input */}
            <form onSubmit={addCustom} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="Type a symptom and press Enter..."
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <Button type="submit" variant="outline" leftIcon={<Plus size={14} />}>Add</Button>
            </form>

            {/* Category Tabs */}
            <div>
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                      activeCategory === cat
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {SYMPTOM_CATEGORIES[activeCategory]?.map(symptom => (
                  <SymptomChip
                    key={symptom}
                    symptom={symptom}
                    selected={selectedSymptoms.includes(symptom)}
                    onToggle={toggleSymptom}
                  />
                ))}
              </div>
            </div>

            {/* Duration Picker */}
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Clock size={14} className="text-[var(--color-primary)]" />
                How long have you had these symptoms?
              </p>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                      duration === d.value
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              className="w-full h-14 text-lg font-bold"
              disabled={selectedSymptoms.length === 0 || !duration}
              leftIcon={<Sparkles size={20} />}
            >
              Analyze Symptoms with AI
            </Button>

            {selectedSymptoms.length === 0 && (
              <p className="text-center text-xs text-[var(--color-text-muted)]">
                Select at least one symptom to continue
              </p>
            )}
          </motion.div>
        )}

        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-surface-2)]" />
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[var(--color-text-primary)]">Analyzing your symptoms...</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Comparing with medical database using Gemini AI
              </p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                />
              ))}
            </div>
          </motion.div>
        )}

        {state === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <ResultsView result={result} onReset={() => { setState('input'); setSelectedSymptoms([]); setDuration(''); setResult(null) }} onSave={handleSave} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
