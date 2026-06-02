import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ShieldCheck, Activity, AlertTriangle, CheckCircle, ArrowRight, ActivitySquare } from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { useRecordsStore } from '../../store/recordsStore'
import { aiService } from '../../services/aiService'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/index'
import { cn } from '../../utils/formatters'

export default function RiskPrediction() {
  const profile = useUserStore(s => s.profile)
  const records = useRecordsStore(s => s.records)
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  
  const handlePredict = async () => {
    if (!profile) return
    setLoading(true)
    
    try {
      // Create a brief summary of records for context
      const recordsSummary = records.map(r => `${r.type}: ${r.title} (${r.date})`).join(', ')
      
      const res = await aiService.predictRisk({
        patient_id: profile.uid,
        patient_context: profile.profile || {},
        health_records_summary: recordsSummary
      })
      setResult(res)
    } catch (err) {
      console.error('Prediction failed', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskStyles = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-700 bg-red-100 border-red-300 shadow-red-200/50'
      case 'medium': return 'text-orange-700 bg-orange-100 border-orange-300 shadow-orange-200/50'
      default: return 'text-emerald-700 bg-emerald-100 border-emerald-300 shadow-emerald-200/50'
    }
  }

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return <ShieldAlert size={48} className="text-red-600" />
      case 'medium': return <AlertTriangle size={48} className="text-orange-600" />
      default: return <ShieldCheck size={48} className="text-emerald-600" />
    }
  }

  return (
    <div className="page-container py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">AI Health Risk Prediction</h1>
          <p className="text-[var(--color-text-secondary)] mt-0.5">Analyze your medical history to predict and prevent future health risks.</p>
        </div>
        <Button onClick={handlePredict} isLoading={loading} leftIcon={<ActivitySquare size={18} />}>
          Run Risk Assessment
        </Button>
      </div>

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[var(--color-border)] rounded-3xl bg-[var(--color-surface-2)]">
          <Activity className="w-16 h-16 text-[var(--color-primary)] opacity-50 mb-4" />
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">No Assessment Found</h2>
          <p className="text-[var(--color-text-secondary)] max-w-sm text-center mt-2 mb-6">
            Click the button above to run an AI-powered risk assessment based on your current health profile and medical records.
          </p>
          <Button onClick={handlePredict} leftIcon={<ActivitySquare size={18} />}>
            Run Assessment Now
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="xl" className="text-[var(--color-primary)] mb-4" />
          <p className="text-[var(--color-text-primary)] font-medium animate-pulse">Analyzing health records & profile...</p>
        </div>
      )}

      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Main Risk Score Card */}
            <div className={cn('p-8 rounded-3xl border-2 shadow-xl flex flex-col md:flex-row items-center gap-8', getRiskStyles(result.risk_level))}>
              <div className="bg-white/80 p-5 rounded-full shadow-inner">
                {getRiskIcon(result.risk_level)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">Overall Risk Level</p>
                <h2 className="text-4xl font-black capitalize">{result.risk_level} Risk</h2>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/80 w-32 h-32 rounded-3xl shadow-inner border border-white/50">
                <span className="text-5xl font-black font-data">{result.score}</span>
                <span className="text-xs font-bold uppercase mt-1 opacity-70">Risk Score</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contributing Factors */}
              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500" />
                    Contributing Factors
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {result.factors?.map((f, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className={cn("mt-0.5 w-2 h-2 rounded-full flex-shrink-0", 
                        f.impact === 'high' ? 'bg-red-500' : f.impact === 'medium' ? 'bg-orange-500' : 'bg-blue-500')} 
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[var(--color-text-primary)]">{f.name}</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{f.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preventive Measures */}
              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-500" />
                    Preventive Measures
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {result.preventive_measures?.map((m, i) => (
                    <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
                      <ArrowRight size={14} className="text-emerald-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">{m}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
