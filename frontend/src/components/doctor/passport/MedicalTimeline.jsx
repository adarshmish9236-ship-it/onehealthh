import React from 'react'
import { motion } from 'framer-motion'
import { 
  Stethoscope, 
  Pill, 
  FileText, 
  Syringe, 
  Building,
  ChevronDown
} from 'lucide-react'
import { Button } from '../../ui'

const TIMELINE_DATA = [
  {
    id: 1,
    date: '10 May 2026',
    type: 'Consultation',
    title: 'General Checkup',
    doctor: 'Dr. Sarah Smith',
    desc: 'Patient complained of mild chest pain. Recommended ECG and blood work.',
    icon: Stethoscope,
    color: 'bg-blue-500 text-white',
    ring: 'ring-blue-100 dark:ring-blue-900/30'
  },
  {
    id: 2,
    date: '12 May 2026',
    type: 'Report',
    title: 'ECG & Lipid Profile',
    doctor: 'City Lab',
    desc: 'ECG normal. Elevated LDL cholesterol (160 mg/dL).',
    icon: FileText,
    color: 'bg-indigo-500 text-white',
    ring: 'ring-indigo-100 dark:ring-indigo-900/30'
  },
  {
    id: 3,
    date: '14 May 2026',
    type: 'Prescription',
    title: 'Cholesterol Management',
    doctor: 'Dr. Sarah Smith',
    desc: 'Prescribed Atorvastatin 20mg daily. Diet modification advised.',
    icon: Pill,
    color: 'bg-emerald-500 text-white',
    ring: 'ring-emerald-100 dark:ring-emerald-900/30'
  },
  {
    id: 4,
    date: '15 Oct 2025',
    type: 'Vaccination',
    title: 'Annual Flu Shot',
    doctor: 'Nurse Station 4',
    desc: 'Administered standard tetravalent influenza vaccine.',
    icon: Syringe,
    color: 'bg-amber-500 text-white',
    ring: 'ring-amber-100 dark:ring-amber-900/30'
  },
  {
    id: 5,
    date: '02 Mar 2024',
    type: 'Hospital Visit',
    title: 'Appendectomy',
    doctor: 'Dr. Robert Jenkins',
    desc: 'Laparoscopic appendectomy performed. Uncomplicated recovery.',
    icon: Building,
    color: 'bg-red-500 text-white',
    ring: 'ring-red-100 dark:ring-red-900/30'
  }
]

export function MedicalTimeline({ timeline }) {
  const data = timeline?.length > 0 
    ? timeline.map((item, index) => ({
        id: item.data?.id || index,
        date: item.date ? new Date(item.date).toLocaleDateString() : 'Unknown Date',
        type: item.type === 'record' ? item.data?.type : item.type,
        title: item.data?.title || item.data?.name || 'Untitled',
        doctor: item.data?.metadata?.doctor_name || 'System',
        desc: item.data?.metadata?.notes || 'No description available',
        icon: item.type === 'record' ? FileText : Pill,
        color: item.type === 'record' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white',
        ring: item.type === 'record' ? 'ring-blue-100 dark:ring-blue-900/30' : 'ring-emerald-100 dark:ring-emerald-900/30'
      }))
    : TIMELINE_DATA;

  return (
    <div className="relative pl-4 sm:pl-0">
      
      {/* Vertical Line */}
      <div className="absolute left-4 sm:left-32 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

      <div className="space-y-8">
        {data.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative sm:flex items-start group"
          >
            {/* Date (Desktop) */}
            <div className="hidden sm:block w-28 shrink-0 text-right pr-6 pt-2">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{item.date}</span>
            </div>

            {/* Node */}
            <div className={`absolute left-0 sm:relative sm:left-auto w-8 h-8 rounded-full ${item.color} flex items-center justify-center ring-8 ${item.ring} shadow-sm z-10 shrink-0 mt-1`}>
              <item.icon className="w-4 h-4" />
            </div>

            {/* Content Card */}
            <div className="ml-12 sm:ml-6 flex-1">
              <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 transition-colors shadow-sm cursor-pointer">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{item.type}</span>
                    <span className="sm:hidden text-xs font-medium text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 rounded-full">{item.date}</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.doctor}</span>
                </div>
                
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                
                {/* Expand indicator */}
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center sm:pl-32">
        <Button variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          Load Older Records
        </Button>
      </div>

    </div>
  )
}
