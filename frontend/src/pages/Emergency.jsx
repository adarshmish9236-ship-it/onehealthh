import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmergencyCardView from '../components/emergency/EmergencyCardView'
import { Button } from '../components/ui/Button'
import { Share2, Mic, AlertTriangle, ShieldCheck, HeartPulse, ChevronRight } from 'lucide-react'
import { useUserStore } from '../store/userStore'

export default function Emergency() {
  const [isGuidanceMode, setIsGuidanceMode] = useState(false)
  const [guidanceResult, setGuidanceResult] = useState(null)
  const [symptomInput, setSymptomInput] = useState('')
  const profile = useUserStore(s => s.profile)

  const handleGetGuidance = () => {
    if (!symptomInput.trim()) return
    // Mock getting guidance
    setGuidanceResult({
      riskLevel: 'critical',
      condition: 'Possible Cardiac Event',
      instructions: [
        'Call emergency medical services (112) immediately.',
        'Help the patient sit down comfortably, rest, and stay calm.',
        'Loosen any restrictive or tight clothing around the neck/chest.',
        'Ask if they have prescribed chest pain medication (like nitroglycerin) and assist them in taking it.'
      ]
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Calming reassurance banner */}
        <div className="bg-emerald-50/60 border border-emerald-200/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg text-white">
            <ShieldCheck size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-emerald-800">What is the Emergency Card?</p>
            <p className="text-xs text-emerald-600 font-medium">This card provides first responders with your vital health information, allergies, and emergency contacts to ensure you get the right care instantly.</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmergencyCardView profile={profile} />
        </motion.div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="lg" 
            className="flex-1 text-base font-bold shadow-lg shadow-rose-500/10 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 h-14" 
            onClick={() => setIsGuidanceMode(true)}
          >
            <HeartPulse size={20} className="mr-2" />
            Get Emergency Guidance
          </Button>
          <Button size="lg" variant="outline" className="flex-1 bg-white hover:bg-slate-50 shadow-md border-slate-200/80 text-base font-bold text-slate-700 h-14">
            <Share2 size={20} className="mr-2 text-rose-500" />
            Share Emergency Info
          </Button>
        </div>

        {/* AI Symptom Guidance Area */}
        <AnimatePresence>
          {isGuidanceMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200/60 mt-6">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <HeartPulse className="text-rose-500" size={20} /> Describe Emergency Symptoms
                </h3>
                <p className="text-xs font-semibold text-slate-400 mb-4">
                  Describe what you or the patient is experiencing. Our assistant will guide you on immediate next steps.
                </p>
                
                {!guidanceResult ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        placeholder="E.g., severe chest pain, left arm numbness..." 
                        className="flex-1 h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                      />
                      <Button size="icon" className="h-12 w-12 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 shadow-none">
                        <Mic size={20} />
                      </Button>
                    </div>
                    <Button 
                      className="w-full h-12 text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white" 
                      onClick={handleGetGuidance}
                      disabled={!symptomInput.trim()}
                    >
                      Get AI Guidance
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {guidanceResult.riskLevel === 'critical' && (
                      <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-700 p-4 rounded-xl font-bold text-sm flex items-center gap-3 animate-pulse">
                        <AlertTriangle size={24} className="text-rose-500" />
                        <span>CRITICAL: Please call emergency services (112) immediately.</span>
                      </div>
                    )}
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Suspected Cause</h4>
                      <p className="text-lg font-extrabold text-slate-800">{guidanceResult.condition}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-3">Immediate Actions to Take</h4>
                      <ul className="space-y-3">
                        {guidanceResult.instructions.map((inst, i) => (
                          <li key={i} className="flex gap-3 text-sm font-medium text-slate-700 items-start">
                            <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 font-bold text-xs border border-rose-100">
                              {i+1}
                            </span>
                            <span className="mt-0.5 leading-relaxed">{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => { setGuidanceResult(null); setSymptomInput(''); }}>
                        Start Over
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

