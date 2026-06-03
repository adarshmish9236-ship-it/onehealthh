import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ShieldCheck, Zap, Brain, ArrowRight, Check,
  Stethoscope, FileSearch, AlertTriangle, BarChart3,
  BookHeart, Star, ChevronRight, User, HeartPulse,
  Plus, Activity, Lock, Globe, Clock
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { cn } from '../utils/formatters'

/* ─── Python RNG Simulation (GPT-Taste Skill) ───
   seed = len("When seconds matter your health history speaks") % 10 = 45 % 10 = 5
   Selection:
   - Hero: Cinematic Center (Layout 1)
   - Typography: Geist/Satoshi (Sans-Serif High-Weight)
   - Component Arsenal: Asymmetrical Bento + Double-Bezel
   - Motion: Framer Motion Staggered Waterfall
*/

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }
})

const FEATURES = [
  { 
    icon: BookHeart, 
    title: 'Health Passport', 
    desc: 'Your entire medical history — reports, prescriptions, and vaccinations — unified in one secure timeline.', 
    color: 'from-blue-500 to-indigo-600',
    colSpan: 'md:col-span-2'
  },
  { 
    icon: Brain, 
    title: 'AI Symptom Check', 
    desc: 'Describe symptoms. Get instant clinical assessments and severity triage.', 
    color: 'from-purple-500 to-pink-600',
    colSpan: 'md:col-span-1'
  },
  { 
    icon: AlertTriangle, 
    title: 'Emergency Card', 
    desc: 'Instant access to life-saving info via QR, even without login.', 
    color: 'from-red-500 to-rose-600',
    colSpan: 'md:col-span-1'
  },
  { 
    icon: FileSearch, 
    title: 'Report Intelligence', 
    desc: 'Upload any lab report. Our AI decodes complex medical jargon into plain English.', 
    color: 'from-emerald-500 to-teal-600',
    colSpan: 'md:col-span-2'
  },
]

/* ─── Double-Bezel Card Component ─── */
function BentoCard({ feature, index }) {
  const Icon = feature.icon
  return (
    <motion.div
      {...fadeUp(index * 0.1)}
      className={cn(
        "group relative p-1.5 rounded-[2.5rem] bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1",
        feature.colSpan
      )}
    >
      <div className="h-full bg-white dark:bg-slate-900 rounded-[calc(2.5rem-0.375rem)] p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className={cn(
          "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500",
          feature.color
        )}>
          <Icon size={24} className="text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          {feature.title}
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
          {feature.desc}
        </p>

        <div className="mt-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
          Learn more <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  )
}

export default function Landing() {
  const [authIntent, setAuthIntent] = useState(null)
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  const handleRoleSelect = (role) => {
    if (authIntent === 'login') {
      navigate(role === 'doctor' ? '/doctor/login' : '/login')
    } else {
      navigate(role === 'doctor' ? '/doctor/register' : '/register')
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] dark:bg-[#0b1120] overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Noise Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] contrast-150 brightness-150 mix-blend-multiply dark:mix-blend-screen"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      <AnimatePresence>
        {authIntent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4"
            onClick={() => setAuthIntent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-8"
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
                  {authIntent === 'login' ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-slate-700 dark:text-slate-300">Choose your account type to continue.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { role: 'patient', label: 'Patient', desc: 'Manage your health passport', icon: User, bg: 'bg-blue-50/50 dark:bg-blue-500/5', color: 'text-blue-600' },
                  { role: 'doctor', label: 'Doctor', desc: 'Manage your clinical portal', icon: Stethoscope, bg: 'bg-emerald-50/50 dark:bg-emerald-500/5', color: 'text-emerald-600' }
                ].map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => handleRoleSelect(opt.role)}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-white dark:hover:bg-slate-800 transition-all group text-left shadow-sm hover:shadow-md"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", opt.bg, opt.color)}>
                      <opt.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{opt.label}</h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{opt.desc}</p>
                    </div>
                    <ChevronRight size={18} className="ml-auto text-slate-300" />
                  </button>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button onClick={() => setAuthIntent(null)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">
                  Go back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation (Refined) */}
      <div className="relative py-6 flex justify-center px-4">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-7xl h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 flex items-center justify-between shadow-sm"
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm bg-white">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-xl text-slate-900 dark:text-white tracking-tighter">oneHealth</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <Link to="/register" className="hover:text-primary transition-colors">Doctors</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setAuthIntent('login')} className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white px-4 hover:opacity-70 transition-opacity">
              Log In
            </button>
            <Button size="sm" className="rounded-xl px-6 py-2 h-10 text-xs font-bold uppercase tracking-widest" onClick={() => setAuthIntent('register')}>
              Join
            </Button>
          </div>
        </motion.header>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[80dvh] flex flex-col items-center justify-center px-4 pt-20 pb-20 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-50">
          <div className="absolute top-[10%] left-[20%] w-[40rem] h-[40rem] bg-primary/10 rounded-3xl blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-purple-500/10 rounded-3xl blur-[120px]" />
          
          {/* DNA Helix Decoration */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] right-[-5%] opacity-20 dark:opacity-10 hidden lg:block"
          >
            <svg width="300" height="600" viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 0V600" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
              {[...Array(20)].map((_, i) => (
                <g key={i}>
                  <motion.circle 
                    cx={100 + Math.sin(i * 0.5) * 60} 
                    cy={i * 30 + 20} 
                    r="4" 
                    fill="var(--color-primary)" 
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                  />
                  <motion.circle 
                    cx={100 - Math.sin(i * 0.5) * 60} 
                    cy={i * 30 + 20} 
                    r="4" 
                    fill="#8B5CF6" 
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, delay: i * 0.2 + 1.5, repeat: Infinity }}
                  />
                  <line 
                    x1={100 + Math.sin(i * 0.5) * 60} 
                    y1={i * 30 + 20} 
                    x2={100 - Math.sin(i * 0.5) * 60} 
                    y2={i * 30 + 20} 
                    stroke="currentColor" 
                    strokeWidth="0.5" 
                    opacity="0.2" 
                  />
                </g>
              ))}
            </svg>
          </motion.div>
        </div>

        <div className="w-full max-w-6xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-[7rem] font-black text-slate-900 dark:text-white leading-[0.9] tracking-[-0.04em] mb-8 max-w-5xl mx-auto"
          >
            When seconds matter, your <span className="text-blue-600 dark:text-blue-400 italic">health history</span> speaks.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A unified, AI-powered health repository that ensures your critical medical information is available to first responders and doctors in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="xl" className="rounded-2xl px-12 h-16 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/25 group" onClick={() => setAuthIntent('register')}>
              Create Account 
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center ml-2 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </div>
            </Button>
            <Link to="/emergency/demo">
              <Button size="xl" variant="outline" className="rounded-2xl px-12 h-16 text-sm font-bold uppercase tracking-widest border-2">
                Emergency Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Section (Infinite Marquee) */}
      <section className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400 mb-12">Trusted by Clinical Ecosystems</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            {['HIPAA', 'ISO 27001', 'AES-256', 'SOC2'].map(trust => (
              <div key={trust} className="flex items-center gap-2">
                <ShieldCheck size={24} />
                <span className="text-xl font-black tracking-tighter">{trust}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 md:py-48 px-4 bg-slate-50 dark:bg-[#0b1120]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 px-4">
            <div className="max-w-xl">
              <motion.div {...fadeUp()} className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.3em] mb-4">The Engine</motion.div>
              <motion.h2 {...fadeUp(0.1)} className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                Intelligence built for <span className="text-blue-600 dark:text-blue-400">critical moments.</span>
              </motion.h2>
            </div>
            <motion.p {...fadeUp(0.2)} className="text-lg text-slate-700 dark:text-slate-300 max-w-xs leading-relaxed">
              We've engineered every feature to respond when time is the most precious resource.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 grid-flow-dense gap-6">
            {FEATURES.map((f, i) => (
              <BentoCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section / Editorial Split */}
      <section id="about" className="py-32 md:py-48 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div {...fadeUp()} className="relative">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
              <div className="rounded-[4rem] overflow-hidden shadow-2xl rotate-[-2deg]">
                <img src="/doctor_care.png" alt="Healthcare" className="w-full h-auto hover:scale-105 transition-all duration-1000" />
              </div>
              <div className="absolute bottom-12 right-[-2rem] bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-w-xs rotate-[3deg]">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm font-medium italic text-slate-700 dark:text-slate-300">
                  "OneHealth unified 15 years of my history in 10 minutes. It's medical freedom."
                </p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Arjun Nair · Patient</p>
              </div>
            </motion.div>

            <div className="space-y-12">
              <div className="space-y-6">
                <motion.h2 {...fadeUp()} className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Ownership is the <span className="text-blue-600 dark:text-blue-400">cure.</span>
                </motion.h2>
                <motion.p {...fadeUp(0.1)} className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                  For too long, medical records have been siloed in hospital databases. oneHealth returns the keys to the patient, ensuring your history travels with you, wherever you go.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: Lock, title: 'AES-256 Crypto', desc: 'Bank-grade encryption for your private data.' },
                  { icon: Globe, title: 'Universal Access', desc: 'Securely share with any doctor, globally.' },
                  { icon: Activity, title: 'Live Insights', desc: 'AI trend tracking for chronic conditions.' },
                  { icon: Clock, title: 'Instant Recall', desc: 'Zero-latency retrieval for emergencies.' },
                ].map((item, i) => (
                  <motion.div key={i} {...fadeUp(i * 0.1)} className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <item.icon size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">{item.title}</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div {...fadeUp(0.4)}>
                <Button size="lg" className="rounded-full px-8 uppercase tracking-widest font-bold text-xs" onClick={() => setAuthIntent('register')}>
                  Start My Passport
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section / Dark Chapter */}
      <section className="py-32 md:py-48 px-4 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[30%] w-[60rem] h-[60rem] bg-primary/20 rounded-full blur-[150px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...fadeUp()} className="w-24 h-24 rounded-[2rem] overflow-hidden flex items-center justify-center mx-auto mb-12 shadow-2xl">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </motion.div>
          <motion.h2 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8">
            Your health deserves a <span className="text-blue-400 italic">permanent</span> home.
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the decentralized health movement. Secure your lifetime passport today — free for patients, forever.
          </motion.p>
          <motion.div {...fadeUp(0.3)}>
            <Button size="xl" className="rounded-full px-12 h-16 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 group" onClick={() => setAuthIntent('register')}>
              Get Started Now
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ml-3 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </div>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white dark:bg-[#0b1120] py-16 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-xl text-slate-900 dark:text-white tracking-tighter">oneHealth</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              Empowering patients with decentralized medical records and AI-driven clinical intelligence.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">HIPAA Compliance</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>

          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
            © 2026 oneHealth · Built for Hackverse
          </p>
        </div>
      </footer>
    </main>
  )
}
