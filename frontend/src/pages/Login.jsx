import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HeartPulse, ArrowRight, ShieldCheck, 
  Clock, Database, CheckCircle2 
} from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setLoading, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    // Mock login, redirect to dashboard/passport
    setTimeout(() => {
      setUser({ name: 'Priya Sharma', email, role: 'patient' }, 'mock-token', 'patient')
      setLoading(false)
      navigate('/dashboard')
    }, 1000)
  }

  const benefits = [
    { icon: <ShieldCheck className="text-emerald-500" />, text: 'Secure, encrypted health vault' },
    { icon: <Clock className="text-blue-500" />, text: 'Access lifelong records in seconds' },
    { icon: <Database className="text-purple-500" />, text: 'AI-powered lab report insights' },
  ]

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-white dark:bg-[#0b1120] flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Branding / Info */}
      <div className="md:w-[45%] bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-8 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] opacity-40 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] opacity-30 -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 font-black text-2xl mb-16 group">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            oneHealth
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-4xl md:text-5xl font-black leading-[1.1] mb-8">
              Your entire health history, <br /> 
              <span className="text-blue-200">perfectly organized.</span>
            </h1>
            
            <div className="space-y-6 max-w-sm">
              {benefits.map((b, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    {b.icon}
                  </div>
                  <span className="font-medium text-blue-50">{b.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 flex items-center gap-6 text-sm text-blue-200">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} /> GDPR Compliant</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} /> ISO Certified</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-slate-50 dark:bg-[#0b1120]">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400">Enter your credentials to access your Health Passport.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="email">
                Email or Mobile Number
              </label>
              <Input 
                id="email" 
                placeholder="john@example.com" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="password">
                  Password
                </label>
                <Link to="#" className="text-sm font-bold text-blue-600 hover:text-blue-500">
                  Forgot?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-blue-500/20" isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>
              Sign In
            </Button>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="px-4 bg-slate-50 dark:bg-[#0b1120] text-slate-400">Or continue with</span>
              </div>
            </div>

            <button type="button" className="w-full h-12 flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Account
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-black text-blue-600 hover:text-blue-500">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

