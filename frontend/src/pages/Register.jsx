import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HeartPulse, ArrowRight, ShieldCheck, 
  Sparkles, Globe, CheckCircle2, UserPlus
} from 'lucide-react'
import { Button, Input } from '../components/ui'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/otp')
    }, 1000)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value })

  const highlights = [
    { icon: <Sparkles className="text-amber-400" />, title: 'Smart Insights', desc: 'Understand your lab reports instantly' },
    { icon: <Globe className="text-emerald-400" />, title: 'Universal Access', desc: 'Your records, anywhere in the world' },
    { icon: <ShieldCheck className="text-blue-400" />, title: 'Bank-Grade Security', desc: 'Private and encrypted data vault' },
  ]

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-white dark:bg-[#0b1120] flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Branding / Benefits */}
      <div className="md:w-[45%] bg-[#0f172a] p-8 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 font-black text-2xl mb-12 group">
            <div className="p-2.5 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            oneHealth
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-10">
              Start your <span className="text-blue-500">lifelong</span> <br />health journey today.
            </h1>
            
            <div className="space-y-8">
              {highlights.map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {h.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{h.title}</h3>
                    <p className="text-slate-400 text-sm">{h.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <p className="text-sm text-slate-300 italic">"oneHealth has completely changed how I manage my family's medical history. It's simple, secure, and incredibly smart."</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-white">Sarah Jenkins, Early Adopter</span>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-slate-50 dark:bg-[#0b1120]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
              <UserPlus size={12} /> Join 10k+ Users
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Join oneHealth to secure your medical records forever.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="name">Full Name</label>
                <Input id="name" placeholder="Priya Sharma" required value={formData.name} onChange={handleChange} className="bg-white dark:bg-slate-900/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="mobile">Mobile</label>
                <Input id="mobile" placeholder="+91..." required value={formData.mobile} onChange={handleChange} className="bg-white dark:bg-slate-900/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="email">Email Address</label>
              <Input id="email" type="email" placeholder="priya@example.com" required value={formData.email} onChange={handleChange} className="bg-white dark:bg-slate-900/50" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="password">Create Password</label>
              <Input id="password" type="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} className="bg-white dark:bg-slate-900/50" />
            </div>

            <div className="flex items-start gap-3 p-1">
              <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" required />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-normal">
                I agree to the <Link to="#" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link to="#" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold mt-4" isLoading={loading} rightIcon={<ArrowRight size={18} />}>
              Create My Passport
            </Button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-blue-600 hover:text-blue-500">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

