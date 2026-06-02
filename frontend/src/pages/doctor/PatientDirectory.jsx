import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Activity, 
  Heart, 
  Droplet,
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import { Card, Button, Input, Badge } from '../../components/ui'
import api from '../../services/api'
import { calculateHealthScore } from '../../utils/formatters'

const CHIPS = ['All', 'High Risk', 'Moderate Risk', 'Low Risk', 'Hypertension', 'Diabetes', 'Asthma']

export function PatientDirectory() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [passportId, setPassportId] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await api.get('/doctors/patients')
        
        // Map the backend response to the UI shape
        const mappedPatients = (response.data.patients || []).map(p => {
          const healthScore = p.profile?.health_score || 85;
          let risk = 'low';
          if (healthScore < 60) risk = 'high';
          else if (healthScore < 80) risk = 'moderate';
          
          return {
            id: p.profile?.passport_id || p.uid,
            uid: p.uid,
            name: p.name || 'Unknown Patient',
            age: p.profile?.dob ? new Date().getFullYear() - new Date(p.profile.dob).getFullYear() : '--',
            gender: p.profile?.gender?.charAt(0) || '-',
            bloodGroup: p.profile?.blood_group || '--',
            lastVisit: 'Recently', // TODO: derive from recent records
            healthScore: healthScore,
            tags: p.profile?.chronic_conditions || [],
            avatar: (p.name || 'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
            risk: risk
          }
        })
        setPatients(mappedPatients)
      } catch(err) {
        console.error('Failed to fetch patients', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  // Filter logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    
    if (activeFilter === 'All') return true
    if (activeFilter.includes('Risk')) return p.risk === activeFilter.split(' ')[0].toLowerCase()
    return p.tags.includes(activeFilter)
  })

  const handlePassportSearch = (e) => {
    e.preventDefault()
    if (passportId.trim()) {
      navigate(`/doctor/patients/${passportId.trim()}`)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Passport Lookup */}
      <Card className="p-6 border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-blue-100 dark:border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-1">Direct Patient Lookup</h2>
            <p className="text-blue-700 dark:text-blue-300 text-sm">Enter a Health Passport ID to securely view a patient's medical records.</p>
          </div>
          
          <form onSubmit={handlePassportSearch} className="flex-1 max-w-lg relative flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g., HP-12345" 
                value={passportId}
                onChange={(e) => setPassportId(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white uppercase"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Lookup
            </Button>
          </form>
        </div>
      </Card>

      {/* Header & Search */}
      <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">My Patients</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Search your existing patients.</p>
          </div>
          
          <div className="flex-1 max-w-lg relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or phone number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
            />
            <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === chip 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </Card>

      {/* Results Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-500">Loading your patients...</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPatients.map((patient, i) => (
            <motion.div
              key={patient.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-slate-900 group cursor-pointer" onClick={() => navigate(`/doctor/patients/${patient.id}`)}>
                
                {/* Card Header */}
                <div className="p-6 pb-4 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xl shadow-inner">
                        {patient.avatar}
                      </div>
                      {patient.risk === 'high' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                          <ShieldAlert className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{patient.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{patient.id} • {patient.gender}, {patient.age}y</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                {/* Body Stats */}
                <div className="px-6 py-4 border-y border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Droplet className="w-3 h-3" /> Blood</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{patient.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Score</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${patient.healthScore > 80 ? 'bg-emerald-500' : patient.healthScore > 60 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                      <p className="font-semibold text-slate-900 dark:text-white">{patient.healthScore}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Visit</p>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{patient.lastVisit}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {patient.tags.map(tag => (
                      <span key={tag} className={`px-2.5 py-1 rounded-md text-xs font-medium border
                        ${tag === 'Healthy' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 
                          'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'}
                      `}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}
      
      {!loading && filteredPatients.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No patients found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">We couldn't find any patients matching your search criteria. Try adjusting your filters or search term.</p>
        </div>
      )}

    </div>
  )
}
