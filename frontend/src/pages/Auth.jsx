import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeartPulse, Mail, Phone, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { useUserStore } from '../store/userStore'
import { authService } from '../services/authService'

function AuthLayout({ children, title, subtitle, accent }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)' }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl">
              <img src="/logo.png" alt="oneHealth logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">oneHealth</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
          {/* Accent bar */}
          <div className="h-1 rounded-full mb-6 -mx-8 -mt-8" style={{
            background: 'linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)'
          }} />

          <h1 className="text-2xl font-black text-white mb-1">{title}</h1>
          {subtitle && <p className="text-blue-200/70 text-sm mb-6">{subtitle}</p>}
          {children}
        </div>

        {/* Footer note */}
        <p className="text-center text-blue-300/50 text-xs mt-6">
          🔒 Your data is encrypted and HIPAA-compliant
        </p>
      </motion.div>
    </div>
  )
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
    >
      <AlertCircle size={16} className="flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  )
}

// Dark-mode styled input wrapper for auth forms
function AuthInput({ label, id, type = 'text', value, onChange, placeholder, leftIcon, hint, required }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-blue-100/80">{label}</label>
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/60">{leftIcon}</div>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-blue-300/30 outline-none transition-all duration-200"
          style={{
            paddingLeft: leftIcon ? '2.25rem' : '0.75rem',
            paddingRight: isPassword ? '2.5rem' : '0.75rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
          onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/60 hover:text-blue-200 transition-colors cursor-pointer">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-blue-300/50">{hint}</p>}
    </div>
  )
}

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setUser = useAuthStore(s => s.setUser)
  const fetchProfile = useUserStore(s => s.fetchProfile)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fbUser = await authService.loginUser(form.email, form.password)
      const token = await fbUser.getIdToken()
      const profile = await authService.getUserProfile(fbUser.uid)

      setUser(
        { uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName || profile?.displayName || 'User' },
        token,
        profile?.role || 'patient'
      )
      await fetchProfile(fbUser.uid)

      const role = profile?.role || 'patient'
      navigate(role === 'doctor' ? '/doctor/dashboard' : '/dashboard')
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password. Please try again.'
        : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.code === 'auth/too-many-requests'
            ? 'Too many failed attempts. Please try again later.'
            : err.message || 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Sign in to access your Health Passport.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner message={error} />
        <AuthInput
          id="login-email" label="Email Address" type="email" required
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
        <AuthInput
          id="login-password" label="Password" type="password" required
          placeholder="Your password"
          leftIcon={<Lock size={16} />}
          value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        />
        <div className="flex justify-end">
          <Link to="#" className="text-sm text-indigo-300 hover:text-indigo-200 font-medium transition-colors">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
          onMouseEnter={e => !loading && (e.target.style.opacity = '0.9')}
          onMouseLeave={e => (e.target.style.opacity = '1')}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <>Sign In <ArrowRight size={16} /></>
          )}
        </button>
        <p className="text-center text-sm text-blue-200/60">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-300 font-semibold hover:text-indigo-200 transition-colors">
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setUser = useAuthStore(s => s.setUser)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const fbUser = await authService.registerUser(form.email, form.password, form.name, 'patient', {
        phone: form.phone,
        profile: {
          dob: null,
          gender: null,
          blood_group: null,
          height_cm: null,
          weight_kg: null,
          allergies: [],
          chronic_diseases: [],
          emergency_contacts: [],
        }
      })
      const token = await fbUser.getIdToken()
      setUser({ uid: fbUser.uid, email: fbUser.email, name: form.name }, token, 'patient')
      navigate('/onboarding')
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.code === 'auth/weak-password'
          ? 'Password is too weak. Use at least 8 characters.'
          : err.message || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start your lifelong health journey — free forever.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner message={error} />
        <AuthInput id="reg-name" label="Full Name" required placeholder="Your full name"
          leftIcon={<User size={16} />} value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <AuthInput id="reg-email" label="Email Address" type="email" required placeholder="you@example.com"
          leftIcon={<Mail size={16} />} value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <AuthInput id="reg-phone" label="Mobile Number" type="tel" required placeholder="+91 98765 43210"
          leftIcon={<Phone size={16} />} value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        <AuthInput id="reg-password" label="Password" type="password" required placeholder="Min 8 characters"
          leftIcon={<Lock size={16} />} value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          hint="At least 8 characters" />

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" required className="mt-1" style={{ accentColor: '#6366f1' }} />
          <span className="text-xs text-blue-200/60">
            I agree to the <a href="#" className="text-indigo-300 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-indigo-300 hover:underline">Privacy Policy</a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <>Create Account <ArrowRight size={16} /></>
          )}
        </button>
        <p className="text-center text-sm text-blue-200/60">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-300 font-semibold hover:text-indigo-200 transition-colors">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export function OTP() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[idx] = val
    setCode(next)
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    navigate('/onboarding')
  }

  return (
    <AuthLayout title="Verify your number" subtitle="We sent a 6-digit code to your mobile. Enter it below.">
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex gap-2 justify-center">
          {code.map((c, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={c}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              className="w-12 h-14 text-center text-2xl font-black rounded-xl outline-none transition-all text-white"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '2px solid rgba(255,255,255,0.12)',
              }}
              onFocus={e => { e.target.style.border = '2px solid #6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.25)' }}
              onBlur={e => { e.target.style.border = '2px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || code.join('').length < 6}
          className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>
        <p className="text-center text-sm text-blue-200/60">
          Didn't receive a code?{' '}
          <button type="button" className="text-indigo-300 font-semibold hover:text-indigo-200 transition-colors cursor-pointer">
            Resend
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}
