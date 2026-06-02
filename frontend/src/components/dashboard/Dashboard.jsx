import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  FileText, Pill, Stethoscope, Syringe, Activity,
  AlertTriangle, Upload, TrendingUp, TrendingDown,
  ChevronRight, X, ArrowRight, Clock,
  BarChart3, Sparkles, Star, Check, RefreshCw, Heart
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useUserStore } from '../../store/userStore'
import { useRecordsStore } from '../../store/recordsStore'
import { useAuthStore } from '../../store/authStore'
import { StatCard, Avatar, EmptyState } from '../ui/index'
import { Button } from '../ui/Button'
import { RecordTypeBadge } from '../ui/Badge'
import { formatDate, getRecordTypeLabel, getHealthScoreConfig } from '../../utils/formatters'
import { medicationService } from '../../services/medicationService'
import api from '../../services/api'

/* ─── Animated Count-Up ─── */
function CountUp({ value, duration = 900 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!value) { setCount(0); return }
    let start = 0
    const step = value / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setCount(value); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value, duration])
  return <span>{count}</span>
}

/* ─── Health Score Ring ─── */
function HealthScoreRing({ score }) {
  const cfg = getHealthScoreConfig(score || 0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ((score || 0) / 100) * circumference
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="12" stroke="var(--color-surface-2)" />
        <motion.circle
          cx="70" cy="70" r={radius} fill="none" strokeWidth="12"
          stroke={cfg.color} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-3xl font-bold text-[var(--color-text-primary)] font-data"
        >
          {score || '—'}
        </motion.span>
        <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
    </div>
  )
}

/* ─── Quick Action Card ─── */
function QuickAction({ icon: Icon, label, desc, to, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600', hover: 'group-hover:bg-blue-600 group-hover:text-white' },
    success: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600', hover: 'group-hover:bg-emerald-600 group-hover:text-white' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600', hover: 'group-hover:bg-amber-600 group-hover:text-white' },
    danger:  { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600', hover: 'group-hover:bg-red-600 group-hover:text-white' },
  }
  const c = colorMap[color]
  return (
    <Link to={to} className="block">
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 cursor-pointer hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all duration-200 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-blue-50/30 dark:group-hover:from-blue-900/10 transition-all duration-300 pointer-events-none" />
        <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center transition-all duration-200 shadow-sm ${c.bg} ${c.text} ${c.hover}`}>
          <Icon size={20} />
        </div>
        <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{label}</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>
      </motion.div>
    </Link>
  )
}

/* ─── Activity Item ─── */
function ActivityItem({ record, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-2)] transition-all cursor-pointer group"
    >
      <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-200">
        <FileText size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">{record.title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {record.metadata?.doctor_name && `${record.metadata.doctor_name} · `}
          {formatDate(record.date)}
        </p>
      </div>
      <div className="flex-shrink-0">
        <RecordTypeBadge type={record.type} />
      </div>
    </motion.div>
  )
}

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-surface)]/90 backdrop-blur-md border border-[var(--color-border)] rounded-xl p-3 shadow-xl">
      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-xl inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: {p.value}{p.unit || ''}
        </p>
      ))}
    </div>
  )
}

/* ─── Feedback Section ─── */
function FeedbackSection() {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/feedback', { rating, comment })
    } catch (_) {}
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center mb-3">
          <Check size={24} className="text-emerald-600" />
        </div>
        <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Feedback Submitted!</h3>
        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">Thank you for your feedback.</p>
      </motion.div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--color-primary)]/5 to-transparent rounded-xl -mr-8 -mt-8" />
      <div className="flex items-center gap-2 mb-1">
        <Star size={15} className="text-amber-500" />
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Rate your experience</h3>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">Help us improve oneHealth for you</p>

      <div className="flex gap-1 mb-4 flex-wrap">
        {[1,2,3,4,5,6,7,8,9,10].map(star => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.85 }}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(star)}
            className="focus:outline-none cursor-pointer"
          >
            <Star size={18} className={`transition-all ${star <= (hoveredStar || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`} />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {rating > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
            <textarea
              className="w-full text-sm p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none resize-none text-[var(--color-text-primary)]"
              placeholder="Tell us what you think..."
              rows={2}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <Button onClick={handleSubmit} size="sm" className="w-full" isLoading={loading}>
              Submit Feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Onboarding Overlay ─── */
function OnboardingOverlay({ onDismiss }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-[var(--color-surface)] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to oneHealth! 🎉</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">Your health passport is ready. Here's what you can do:</p>
        <div className="space-y-3 text-left mb-8">
          {[
            { emoji: '📁', text: 'Store all your medical records securely' },
            { emoji: '⬆️', text: 'Upload reports — AI will analyze them instantly' },
            { emoji: '🚨', text: 'Your Emergency Card is ready with your critical info' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-2)]">
              <span className="text-xl">{item.emoji}</span>
              <p className="text-sm text-[var(--color-text-primary)]">{item.text}</p>
            </div>
          ))}
        </div>
        <Button onClick={onDismiss} className="w-full">
          Got it, let's go! <ArrowRight size={16} />
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ─── Skeleton Loader ─── */
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse">
      <div className="h-4 bg-[var(--color-surface-2)] rounded w-1/3 mb-3" />
      <div className="h-8 bg-[var(--color-surface-2)] rounded w-1/2 mb-2" />
      <div className="h-3 bg-[var(--color-surface-2)] rounded w-2/3" />
    </div>
  )
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const profile = useUserStore(s => s.profile)
  const healthMetrics = useUserStore(s => s.healthMetrics)
  const isProfileLoading = useUserStore(s => s.isProfileLoading)
  const fetchHealthMetrics = useUserStore(s => s.fetchHealthMetrics)
  const records = useRecordsStore(s => s.records)
  const trends = useRecordsStore(s => s.trends)
  const fetchRecords = useRecordsStore(s => s.fetchRecords)
  const isRecordsLoading = useRecordsStore(s => s.isLoading)
  const user = useAuthStore(s => s.user)

  const [trendType, setTrendType] = useState('haemoglobin')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [medications, setMedications] = useState([])
  const [medsLoading, setMedsLoading] = useState(false)
  const navigate = useNavigate()

  const name = profile?.displayName?.split(' ')[0] || profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Refresh data on mount
  useEffect(() => {
    if (user?.uid) {
      fetchRecords(user.uid)
      fetchHealthMetrics(user.uid)
    }
  }, [user?.uid])

  // Fetch today's medications from Firestore
  useEffect(() => {
    const fetchMeds = async () => {
      setMedsLoading(true)
      try {
        const meds = await medicationService.getMedications(user.uid)
        setMedications(meds.filter(m => m.active !== false).slice(0, 4))
      } catch (_) {
        setMedications([])
      } finally {
        setMedsLoading(false)
      }
    }
    if (user?.uid) fetchMeds()
  }, [user?.uid])

  // Show onboarding for new users with no records
  useEffect(() => {
    if (!isRecordsLoading && records.length === 0 && profile) {
      const seen = localStorage.getItem('onboarding-seen')
      if (!seen) {
        setShowOnboarding(true)
        localStorage.setItem('onboarding-seen', '1')
      }
    }
  }, [isRecordsLoading, records.length, profile])

  const statCards = [
    { label: 'Reports',        value: healthMetrics?.reports_count || 0,       color: 'primary', icon: <FileText size={20} />,   to: '/passport' },
    { label: 'Prescriptions',  value: healthMetrics?.prescriptions_count || 0,  color: 'success', icon: <Pill size={20} />,        to: '/medications' },
    { label: 'Consultations',  value: healthMetrics?.consultations_count || 0,  color: 'purple',  icon: <Stethoscope size={20} />, to: '/passport' },
    { label: 'Vaccinations',   value: healthMetrics?.vaccinations_count || 0,   color: 'orange',  icon: <Syringe size={20} />,    to: '/passport' },
  ]

  const trendChartData = trends[trendType] || []
  const trendConfig = {
    haemoglobin: { key: 'value',   name: 'Haemoglobin', color: '#ef4444', unit: ' g/dL' },
    bloodSugar:  { key: 'fasting', name: 'Glucose',   color: '#10b981', unit: '' },
    cholesterol: { key: 'total',   name: 'Cholesterol', color: '#f59e0b', unit: '' },
  }
  const tc = trendConfig[trendType] || trendConfig.haemoglobin
  const recentRecords = records.slice(0, 5)

  const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
  const itemVariant = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }

  const isLoading = isProfileLoading && !profile

  return (
    <>
      <AnimatePresence>
        {showOnboarding && <OnboardingOverlay onDismiss={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      <div className="page-container py-6 space-y-6">
        {/* ── Greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {greeting}, {name}! 👋
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-0.5">
              Here's your health overview for today.
            </p>
          </div>
          <Button leftIcon={<Upload size={16} />} onClick={() => navigate('/passport')}>
            Add Record
          </Button>
        </motion.div>

        {/* ── Health Score + Stat Cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        >
          {/* Health Score */}
          <motion.div variants={itemVariant} className="lg:col-span-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-blue-50/60 to-purple-50/60 dark:from-blue-900/20 dark:to-purple-900/20 p-5 h-full flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 pointer-events-none" />
              <HealthScoreRing score={healthMetrics?.health_score} />
              <div className="text-center">
                <p className="text-sm font-bold text-[var(--color-text-primary)]">Health Score</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {records.length > 0 ? `Based on ${records.length} records` : 'Upload records to calculate'}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Stat Cards */}
          {isLoading
            ? [0,1,2,3].map(i => <motion.div key={i} variants={itemVariant}><SkeletonCard /></motion.div>)
            : statCards.map(s => (
              <motion.div key={s.label} variants={itemVariant}>
                <StatCard
                  label={s.label}
                  value={<CountUp value={s.value} />}
                  icon={s.icon}
                  color={s.color}
                  className="h-full cursor-pointer"
                  onClick={() => navigate(s.to)}
                />
              </motion.div>
            ))
          }
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction icon={Stethoscope} label="Check Symptoms"  desc="Symptom triage"    to="/symptoms"   color="primary" />
            <QuickAction icon={Upload}      label="Upload Report"   desc="Add to passport"   to="/passport"   color="success" />
            <QuickAction icon={AlertTriangle} label="Emergency"     desc="Critical info"      to="/emergency"  color="danger" />
            <QuickAction icon={Pill}        label="Medications"     desc="Today's schedule"   to="/medications" color="warning" />
          </div>
        </motion.div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Health Trends</h2>
                <div className="flex gap-1 p-1 bg-[var(--color-surface-2)] rounded-lg">
                  {Object.keys(trendConfig).filter(k => (trends[k]?.length || 0) > 0 || k === 'haemoglobin').map(t => (
                    <button
                      key={t}
                      onClick={() => setTrendType(t)}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                        trendType === t
                          ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1).replace(/([A-Z])/g, ' $1')}
                    </button>
                  ))}
                </div>
              </div>

              {trendChartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={tc.color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={tc.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: tc.color, strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey={tc.key} name={tc.name} unit={tc.unit}
                      stroke={tc.color} strokeWidth={2.5} fill="url(#colorGrad)"
                      activeDot={{ r: 6, fill: tc.color, stroke: 'white', strokeWidth: 2 }}
                      dot={{ r: 3, fill: tc.color, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <BarChart3 size={32} className="text-[var(--color-text-muted)] mb-2" />
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Not enough data yet</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Upload lab reports to see your trends</p>
                  <button
                    onClick={() => navigate('/passport')}
                    className="mt-3 text-xs text-[var(--color-primary)] font-medium hover:underline cursor-pointer"
                  >
                    Upload your first report →
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33 }}
            className="space-y-4"
          >
            {/* Today's Medications */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[var(--color-primary)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Today's Medications</h3>
                </div>
                <Link to="/medications" className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer">
                  View all
                </Link>
              </div>

              {medsLoading ? (
                <div className="space-y-2">
                  {[0,1].map(i => <div key={i} className="h-12 bg-[var(--color-surface-2)] rounded-lg animate-pulse" />)}
                </div>
              ) : medications.length > 0 ? (
                <div className="space-y-2">
                  {medications.map((med, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-primary)]">{med.name} {med.dosage}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{med.frequency || 'As prescribed'}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <Pill size={24} className="text-[var(--color-text-muted)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--color-text-muted)]">No medications tracked yet</p>
                  <Link to="/medications" className="text-xs text-[var(--color-primary)] font-medium hover:underline mt-1 block cursor-pointer">
                    Add medications →
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Records Summary */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={14} className="text-rose-500" />
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Your Health at a Glance</h3>
              </div>
              {profile?.profile?.blood_group || profile?.blood_group ? (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Blood Group', value: profile.profile?.blood_group || profile.blood_group },
                    { label: 'Allergies', value: (profile.profile?.allergies || profile.allergies || []).length > 0
                      ? (profile.profile?.allergies || profile.allergies).join(', ')
                      : 'None listed'
                    },
                    { label: 'Height', value: (profile.profile?.height_cm || profile.height_cm) ? `${profile.profile?.height_cm || profile.height_cm} cm` : '—' },
                    { label: 'Weight', value: (profile.profile?.weight_kg || profile.weight_kg) ? `${profile.profile?.weight_kg || profile.weight_kg} kg` : '—' },
                  ].map(item => (
                    <div key={item.label} className="p-2 rounded-lg bg-[var(--color-surface-2)]">
                      <p className="text-[10px] text-[var(--color-text-muted)]">{item.label}</p>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 text-center">
                  <p className="text-xs text-[var(--color-text-muted)]">Complete your health profile</p>
                  <Link to="/onboarding" className="text-xs text-[var(--color-primary)] font-medium hover:underline mt-1 block cursor-pointer">
                    Update profile →
                  </Link>
                </div>
              )}
            </div>

            {/* Feedback */}
            <FeedbackSection />
          </motion.div>
        </div>

        {/* ── Recent Activity ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Recent Activity</h2>
            <Link to="/passport" className="flex items-center gap-1 text-sm text-[var(--color-primary)] font-medium hover:underline cursor-pointer">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {isRecordsLoading ? (
            <div className="space-y-2">
              {[0,1,2].map(i => <div key={i} className="h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl animate-pulse" />)}
            </div>
          ) : recentRecords.length > 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
              {recentRecords.map((record, i) => (
                <ActivityItem key={record.id} record={record} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
              <FileText size={32} className="text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">No records yet</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Upload your first medical record to get started</p>
              <Button onClick={() => navigate('/passport')} className="mt-4" leftIcon={<Upload size={14} />} size="sm">
                Upload Record
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
