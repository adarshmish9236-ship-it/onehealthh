import React, { useState } from 'react'
import { motion } from 'framer-motion'
import OverviewCard from '../components/passport/OverviewCard'
import HealthTimeline from '../components/passport/HealthTimeline'
import UploadModal from '../components/passport/UploadModal'
import { Button } from '../components/ui/Button'
import { Plus, ActivitySquare, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

export default function Passport() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-dark">My Health Passport</h1>
          <p className="text-gray-500 mt-1">Your lifelong unified medical record.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-danger border-danger/20 hover:bg-danger/10" onClick={() => navigate('/emergency')}>
            <AlertCircle size={16} className="mr-2" />
            Emergency
          </Button>
          <Button variant="secondary" onClick={() => navigate('/symptom-analyzer')}>
            <ActivitySquare size={16} className="mr-2" />
            Check Symptoms
          </Button>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <OverviewCard profile={useUserStore(s => s.profile)} healthMetrics={useUserStore(s => s.healthMetrics)} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold text-dark">Health Timeline</h2>
        </div>
        <HealthTimeline />
      </motion.div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
