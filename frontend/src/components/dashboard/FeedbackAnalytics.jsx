import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Sparkles, ThumbsUp, ThumbsDown,
  Minus, TrendingUp, TrendingDown, Star, BarChart3,
  Hash, Tag, RefreshCw
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  RadialBarChart, RadialBar, Legend
} from 'recharts'
import { Button } from '../ui/Button'
import { Alert, Spinner } from '../ui/index'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/formatters'

const MOCK_SENTIMENT_RESULT = {
  sentiment: 'positive',
  confidence: 87,
  positive_themes: ['Clear Explanation', 'Compassionate Care', 'Fast Response', 'Professional'],
  negative_themes: ['Wait Time', 'Prescription Clarity'],
  key_topics: ['Doctor Communication', 'Treatment Plan', 'Follow-Up', 'Diagnosis'],
  summary: 'The patient expressed high satisfaction with the quality of care and doctor communication. Minor concerns about waiting time and prescription clarity were noted.',
}

const OVERALL_STATS = {
  satisfaction: 82,
  positive: 68,
  negative: 12,
  neutral: 20,
}

const SENTIMENT_TREND = [
  { month: 'Jan', positive: 72, negative: 14, neutral: 14 },
  { month: 'Feb', positive: 68, negative: 18, neutral: 14 },
  { month: 'Mar', positive: 75, negative: 10, neutral: 15 },
  { month: 'Apr', positive: 80, negative: 8,  neutral: 12 },
  { month: 'May', positive: 65, negative: 20, neutral: 15 },
  { month: 'Jun', positive: 82, negative: 7,  neutral: 11 },
]

const TOP_COMPLAINTS = [
  { topic: 'Long wait times',       count: 34, pct: 41 },
  { topic: 'Prescription clarity',  count: 22, pct: 26 },
  { topic: 'Follow-up scheduling',  count: 18, pct: 22 },
  { topic: 'Billing transparency',  count: 9,  pct: 11 },
]

const TOP_APPRECIATIONS = [
  { topic: 'Doctor attentiveness',   count: 58, pct: 35 },
  { topic: 'Clear explanations',     count: 47, pct: 28 },
  { topic: 'Fast AI analysis',       count: 39, pct: 24 },
  { topic: 'Easy-to-use interface',  count: 21, pct: 13 },
]

const PIE_DATA = [
  { name: 'Positive', value: OVERALL_STATS.positive, color: '#0E9F6E' },
  { name: 'Neutral',  value: OVERALL_STATS.neutral,  color: '#64748b' },
  { name: 'Negative', value: OVERALL_STATS.negative, color: '#E02424' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-[var(--color-text-primary)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}%</p>
      ))}
    </div>
  )
}

function SentimentCard({ result }) {
  const cfg = {
    positive: { color: 'text-emerald-700', bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', icon: <ThumbsUp size={20} className="text-emerald-600" />, label: 'Positive' },
    negative: { color: 'text-red-700', bg: 'from-red-50 to-rose-50', border: 'border-red-200', icon: <ThumbsDown size={20} className="text-red-600" />, label: 'Negative' },
    neutral:  { color: 'text-slate-700', bg: 'from-slate-50 to-gray-50', border: 'border-slate-200', icon: <Minus size={20} className="text-slate-500" />, label: 'Neutral' },
  }[result.sentiment]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('rounded-2xl border p-5 bg-gradient-to-br space-y-4', cfg.bg, cfg.border)}
    >
      {/* Sentiment Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/80 shadow-sm">{cfg.icon}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Sentiment Analysis</p>
          <p className={cn('text-2xl font-black', cfg.color)}>{cfg.label} Feedback</p>
        </div>
        <div className="ml-auto">
          <div className="text-right">
            <p className={cn('text-3xl font-black font-data', cfg.color)}>{result.confidence}%</p>
            <p className="text-xs text-[var(--color-text-muted)]">confidence</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text-primary)] bg-white/50 p-3 rounded-xl">{result.summary}</p>

      {/* Themes */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1"><TrendingUp size={10} /> Positive Themes</p>
          <div className="flex flex-wrap gap-1.5">
            {result.positive_themes.map(t => (
              <span key={t} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1"><TrendingDown size={10} /> Negative Themes</p>
          <div className="flex flex-wrap gap-1.5">
            {result.negative_themes.map(t => (
              <span key={t} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Key Topics */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 flex items-center gap-1"><Hash size={10} /> Key Topics</p>
        <div className="flex flex-wrap gap-1.5">
          {result.key_topics.map(t => (
            <span key={t} className="text-xs px-2.5 py-1 bg-white/80 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-full font-medium">{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

import { aiService } from '../../services/aiService'

export default function FeedbackAnalytics() {
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('consultation')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    if (!feedback.trim()) return
    try {
      setLoading(true)
      const analysis = await aiService.analyzeFeedback(feedback)
      setResult(analysis)
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Patient Feedback Analytics</h1>
        <p className="text-[var(--color-text-secondary)] mt-0.5">AI-powered sentiment analysis for healthcare interactions</p>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Satisfaction */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Overall Satisfaction</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="54" fill="none" strokeWidth="14" stroke="var(--color-surface-2)" />
                <motion.circle
                  cx="70" cy="70" r="54" fill="none" strokeWidth="14"
                  stroke="#0E9F6E" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 54}
                  initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - OVERALL_STATS.satisfaction / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[var(--color-text-primary)] font-data">{OVERALL_STATS.satisfaction}</span>
                <span className="text-xs font-semibold text-emerald-600">out of 100</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full mt-4">
              {PIE_DATA.map(d => (
                <div key={d.name} className="text-center">
                  <p className="text-xl font-black font-data" style={{ color: d.color }}>{d.value}%</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{d.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Trend */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Sentiment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={SENTIMENT_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="positive" name="Positive" stroke="#0E9F6E" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="negative" name="Negative" stroke="#E02424" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Complaints / Appreciations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Complaints */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-red-500" /> Top Complaints
          </h3>
          <div className="space-y-3">
            {TOP_COMPLAINTS.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-[var(--color-text-primary)] font-medium">{c.topic}</span>
                  <span className="text-[var(--color-text-muted)] font-data">{c.count} mentions</span>
                </div>
                <div className="h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Appreciations */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" /> Top Appreciations
          </h3>
          <div className="space-y-3">
            {TOP_APPRECIATIONS.map((a, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-[var(--color-text-primary)] font-medium">{a.topic}</span>
                  <span className="text-[var(--color-text-muted)] font-data">{a.count} mentions</span>
                </div>
                <div className="h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${a.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Input */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
        <h3 className="font-bold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
          <MessageSquare size={18} className="text-[var(--color-primary)]" /> Analyze New Feedback
        </h3>

        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'consultation', label: 'Doctor Consultation' },
            { id: 'hospital',     label: 'Hospital Visit' },
            { id: 'ai',           label: 'AI Interaction' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFeedbackType(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                feedbackType === t.id
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Paste patient feedback here... e.g., 'The doctor was very attentive and explained my condition clearly. However, the wait time was quite long — about 45 minutes past my appointment.'"
          className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
        />

        <Button
          onClick={handleAnalyze}
          isLoading={loading}
          disabled={!feedback.trim()}
          leftIcon={<Sparkles size={16} />}
          className="w-full sm:w-auto"
        >
          Analyze Sentiment with AI
        </Button>

        {/* Result */}
        <AnimatePresence>
          {result && <SentimentCard result={result} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
