import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { HeartPulse, ShieldCheck, ArrowRight, RefreshCcw } from 'lucide-react'
import { cn } from '../utils/formatters'

export default function OTP() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  const handleChange = (e, index) => {
    const value = e.target.value
    if (isNaN(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    // Auto-advance
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/onboarding')
    }, 1000)
  }

  return (
    <div className="min-h-screen -m-4 sm:-m-6 lg:-m-8 bg-white dark:bg-[#0b1120] flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Branding */}
      <div className="md:w-[45%] bg-blue-600 p-8 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 font-black text-2xl mb-16">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            oneHealth
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              Security is our <br />
              <span className="text-blue-200">top priority.</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-sm">
              We've sent a 6-digit verification code to your device. This keeps your medical data safe from unauthorized access.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm max-w-xs">
          <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium text-blue-50">Your connection to oneHealth is secure and end-to-end encrypted.</p>
        </div>
      </div>

      {/* Right Side: OTP Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-slate-50 dark:bg-[#0b1120]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Verify Identity</h2>
            <p className="text-slate-500 dark:text-slate-400">Enter the 6-digit code sent to your mobile.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-between gap-2 sm:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    "w-full h-14 sm:h-16 text-center text-2xl font-black rounded-2xl border transition-all duration-200",
                    "focus:outline-none focus:ring-4 focus:ring-blue-500/20",
                    digit 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white"
                  )}
                />
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-black" 
                disabled={otp.join('').length < 6}
                isLoading={loading}
                rightIcon={<ArrowRight size={20} />}
              >
                Verify & Continue
              </Button>
              
              <div className="text-center">
                <button type="button" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">
                  <RefreshCcw size={14} /> Resend OTP Code
                </button>
              </div>
            </div>
          </form>

          <p className="mt-12 text-center text-xs text-slate-400 uppercase tracking-widest font-black">
            Secured by oneHealth Auth
          </p>
        </motion.div>
      </div>
    </div>
  )
}

