import React from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquareHeart, 
  Frown, 
  MessageCircle, 
  ThumbsUp, 
  TrendingUp,
  Activity,
  Star
} from 'lucide-react'
import { Card, Button } from '../../components/ui'

export function Analytics() {
  return (
    <div className="space-y-6">
      
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400">AI-driven sentiment analysis of patient reviews and feedback.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Last 30 Days</Button>
          <Button>Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Reviews</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">--</h4>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Overall Satisfaction</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">--/5</h4>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Recommendation Rate</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">--%</h4>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Response Time</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">--</h4>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Patient Volume Trend */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 h-[400px] border-0 shadow-sm bg-white dark:bg-slate-900 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Patient Volume Trend</h3>
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No trend data yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] text-center">Data will appear as more patients are seen.</p>
            </div>
          </Card>
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 h-[400px] border-0 shadow-sm bg-white dark:bg-slate-900 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sentiment Analysis</h3>
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
              <Star className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No sentiment data yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] text-center">Gather more feedback to see AI-driven insights.</p>
            </div>
          </Card>
        </motion.div>
        
      </div>

    </div>
  )
}
