import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Activity,
  ArrowRight,
  Star,
  MessageSquare,
  Inbox
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, Button } from '../../components/ui'
import api from '../../services/api'

export function Dashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, avgHealth: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await api.get('/doctors/patients')
        const pts = res.data.patients || []
        
        let avg = 0
        if (pts.length > 0) {
          const sum = pts.reduce((acc, p) => acc + (p.profile?.health_score || 85), 0)
          avg = Math.round(sum / pts.length)
        }
        
        setStats({ totalPatients: pts.length, avgHealth: avg })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Patients', value: loading ? '...' : stats.totalPatients.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { title: "Today's Consults", value: '0', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { title: 'Pending Follow-ups', value: '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { title: 'Health Score Avg', value: loading ? '...' : `${stats.avgHealth}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ perspective: 1000 }}
          >
            <motion.div whileHover={{ y: -8, scale: 1.05, rotateX: 10, rotateY: -10, z: 40 }} style={{ transformStyle: 'preserve-3d' }}>
              <Card className="p-6 border-0 shadow-lg hover:shadow-2xl hover:shadow-[var(--color-primary)]/20 transition-all duration-500 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(20px)' }}>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white" style={{ transform: 'translateZ(10px)' }}>{stat.value}</h3>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-500`} style={{ transform: 'translateZ(30px)' }}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 h-full border-0 shadow-sm bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Health Reports Reviewed</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Weekly trend of AI-analyzed reports</p>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex">View Details</Button>
            </div>
            <div className="h-[300px] w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl mt-4">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-slate-500 dark:text-slate-400">No chart data available yet</p>
            </div>
          </Card>
        </motion.div>

        {/* AI Alerts Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 h-full border-0 shadow-sm bg-white dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Health Alerts</h3>
              <div className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">3 New</div>
            </div>
            
            <div className="flex-1 space-y-4">
              {[
                { type: 'Critical', patient: 'David Warner', desc: 'Abnormal ECG detected in recent report upload.', time: '10m ago', icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
                { type: 'Warning', patient: 'Susan Clarke', desc: 'Missed 3 consecutive medication doses.', time: '1h ago', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                { type: 'Info', patient: 'James Smith', desc: 'Blood pressure returned to normal range.', time: '2h ago', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map((alert, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer group">
                  <div className={`p-2 rounded-xl h-fit shrink-0 ${alert.bg} dark:bg-opacity-10`}>
                    <alert.icon className={`w-5 h-5 ${alert.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{alert.patient}</h4>
                      <span className="text-[10px] text-slate-400">{alert.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-blue-600 dark:text-blue-400">View All Alerts</Button>
          </Card>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Feedback */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-1"
        >
          <Card className="p-6 h-full border-0 shadow-sm bg-white dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Feedback</h3>
              <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full text-xs">
                <Star size={12} className="fill-amber-500" /> 9.8 / 10
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              {[
                { patient: 'Priya Sharma', rating: 10, time: '2h ago', comment: 'Very patient and explained everything clearly. Highly recommend!' },
                { patient: 'Michael Chang', rating: 9, time: '5h ago', comment: 'Excellent consultation, felt very heard.' },
                { patient: 'Sarah Jenkins', rating: 8, time: '1d ago', comment: 'Good visit, slight delay in start time.' },
              ].map((fb, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{fb.patient}</h4>
                    <span className="text-[10px] text-slate-400">{fb.time}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                      <Star key={star} size={10} className={star <= fb.rating ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]' : 'text-slate-300 dark:text-slate-700'} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{fb.comment}"</p>
                </div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-blue-600 dark:text-blue-400" leftIcon={<MessageSquare size={16} />}>View All Reviews</Button>
          </Card>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="h-full border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Appointments</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Today's schedule</p>
            </div>
            <Button>Schedule New</Button>
          </div>
          <div className="p-8 text-center flex flex-col items-center justify-center border-t border-slate-100 dark:border-slate-800">
            <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 font-medium">No upcoming appointments</p>
            <p className="text-slate-400 text-sm max-w-sm mt-1">When patients book consultations with you, they will appear here.</p>
          </div>
        </Card>
      </motion.div>
      </div>

    </div>
  )
}
