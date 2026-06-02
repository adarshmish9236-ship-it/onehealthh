import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { Button, Input } from '../../../components/ui'

export function DoctorLogin() {
  const navigate = useNavigate()
  const { setUser, setLoading, isLoading } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setUser({ name: 'Sarah Smith', email, role: 'doctor' }, 'mock-token', 'doctor')
      setLoading(false)
      navigate('/doctor/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-slate-50 dark:bg-[#0b1120] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-200 dark:border-slate-800">
        
        {/* Left Side: Branding / Info */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-700 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 font-black text-2xl mb-16">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              oneHealth Pro
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-black leading-tight mb-10"
            >
              The advanced portal <br />
              <span className="text-blue-200">for clinical excellence.</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {[
                'AI-powered consultation summaries',
                'Comprehensive patient health passports',
                'Real-time sentiment & feedback analytics'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-bold text-blue-50">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
          
          <div className="relative z-10 text-xs font-bold text-blue-200 uppercase tracking-widest">
            © 2026 oneHealth Inc · Enterprise Grade
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-[#111827] relative z-10">
          
          {/* Mobile Header */}
          <div className="flex items-center gap-2 font-black text-xl text-blue-600 mb-10 md:hidden">
            <Stethoscope className="w-7 h-7" />
            oneHealth Pro
          </div>

          <div className="max-w-md w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Doctor Login</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-10">Sign in to your professional clinical dashboard.</p>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Professional Email</label>
                  <Input 
                    type="email" 
                    placeholder="doctor@hospital.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Secure Password</label>
                    <a href="#" className="text-xs font-black text-blue-600 hover:text-blue-500 uppercase tracking-wider">Forgot?</a>
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white focus:ring-blue-500"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-black bg-blue-600 hover:bg-blue-700 text-white group"
                  isLoading={isLoading}
                >
                  Enter Portal
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-tighter">
                    <span className="px-4 bg-white dark:bg-[#111827] text-slate-400">Institutional Access</span>
                  </div>
                </div>
                
                <button type="button" className="w-full h-12 flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google Workspace
                </button>
              </form>
              
              <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                New to oneHealth?{' '}
                <Link to="/doctor/register" className="font-black text-blue-600 hover:text-blue-500">
                  Register Practice
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
