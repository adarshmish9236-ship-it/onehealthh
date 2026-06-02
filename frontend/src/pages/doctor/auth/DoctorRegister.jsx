import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Stethoscope, ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button, Input } from '../../../components/ui'

const STEPS = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Professional Details' },
  { id: 3, title: 'Verification' }
]

export function DoctorRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    medicalCouncilNumber: '',
    specialization: '',
    hospital: '',
    experience: '',
  })

  const handleNext = () => setStep(s => Math.min(s + 1, 3))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate('/doctor/login')
    }, 1500)
  }

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-slate-50 dark:bg-[#0b1120] py-12 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white dark:bg-[#111827] rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-slate-900 dark:bg-[#0b1120] px-10 py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 font-black text-xl mb-4 text-blue-400">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Stethoscope className="w-6 h-6 text-blue-400" />
                </div>
                oneHealth Pro
              </div>
              <h1 className="text-4xl font-black tracking-tight">Join the network</h1>
              <p className="text-slate-400 mt-2 font-medium">Empower your practice with AI-integrated clinical tools.</p>
            </div>
            
            {/* Stepper */}
            <div className="flex items-center gap-3 shrink-0">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500
                    ${step === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110' : 
                      step > s.id ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                  >
                    {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : s.id}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-1 rounded-full transition-colors duration-500
                      ${step > s.id ? 'bg-emerald-500' : 'bg-slate-800'}`} 
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 md:p-16">
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <AnimatePresence mode="wait">
              
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Practitioner Identity</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">First Name</label>
                      <Input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Sarah" className="h-12 bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Last Name</label>
                      <Input name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Smith" className="h-12 bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Professional Email</label>
                      <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="dr.smith@hospital.com" className="h-12 bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Direct Contact</label>
                      <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 (555) 000-0000" className="h-12 bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Secure Password</label>
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-12 bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Professional Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Credentials</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Medical Council Registration</label>
                      <Input name="medicalCouncilNumber" value={formData.medicalCouncilNumber} onChange={handleChange} required placeholder="MCR-12345678" className="h-12 bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Specialization Area</label>
                      <select 
                        name="specialization" 
                        value={formData.specialization} 
                        onChange={handleChange} 
                        required
                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                      >
                        <option value="">Select Specialization</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="General Practice">General Practice</option>
                        <option value="Orthopedics">Orthopedics</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Primary Clinical Facility</label>
                      <Input name="hospital" value={formData.hospital} onChange={handleChange} required placeholder="City General Hospital" className="h-12 bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Years of Clinical Experience</label>
                      <Input type="number" name="experience" value={formData.experience} onChange={handleChange} required placeholder="10" min="0" className="h-12 bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Verification */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Identity Verification</h2>
                  </div>
                  
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-blue-500/50 transition-all cursor-pointer group">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Clinical License</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs mx-auto">Upload a clear scan of your Medical License or Registration (PDF/JPG, Max 5MB)</p>
                    <Button type="button" variant="outline" className="border-slate-300 dark:border-slate-700 h-12 px-8 rounded-xl font-black">Browse Records</Button>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 p-6 rounded-[24px] text-sm flex gap-4 items-start shadow-sm">
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                    <p className="font-bold leading-relaxed">Your professional credentials will be reviewed by our medical board. Verification typically takes 24-48 business hours.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Actions */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={handlePrev} className="text-slate-500 dark:text-slate-400 h-12 font-black px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <div />
              )}
              
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[180px] h-14 text-lg font-black shadow-lg shadow-blue-500/20 rounded-2xl"
                isLoading={isLoading}
              >
                {step === 3 ? 'Apply Now' : 'Save & Continue'}
                {step < 3 && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </form>
          
          {step === 1 && (
            <div className="mt-12 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
              Clinical Professional?{' '}
              <Link to="/doctor/login" className="text-blue-600 hover:text-blue-500 font-black underline underline-offset-4">
                Login to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
