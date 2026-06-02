import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Sparkles,
  ChevronRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { Button } from '../../ui'

const REPORTS = [
  {
    id: 'R-102',
    title: 'Lipid Profile & HbA1c',
    date: '12 May 2026',
    lab: 'City Diagnostic Center',
    type: 'Blood Report',
    aiSummary: {
      status: 'Warning',
      text: 'Elevated LDL Cholesterol (160 mg/dL). HbA1c is borderline at 6.2%. Liver enzymes (AST/ALT) are within normal limits.',
      flags: ['High LDL', 'Borderline HbA1c']
    }
  },
  {
    id: 'R-098',
    title: 'Chest X-Ray (PA View)',
    date: '10 May 2026',
    lab: 'General Hospital Radiology',
    type: 'Imaging',
    aiSummary: {
      status: 'Normal',
      text: 'No active cardiothoracic lesion seen. Lung fields are clear. Heart size is normal.',
      flags: []
    }
  }
]

export function ReportReviewModule({ timeline }) {
  const data = timeline?.length > 0 
    ? timeline
        .filter(t => t.type === 'record' && t.data)
        .map(t => ({
          id: t.data.id,
          title: t.data.title,
          date: t.date ? new Date(t.date).toLocaleDateString() : 'Unknown Date',
          lab: t.data.metadata?.hospital || 'Unknown Lab',
          type: t.data.type,
          aiSummary: t.data.ai_analysis ? {
            status: t.data.ai_analysis.extracted_values?.some(v => v.status === 'high' || v.status === 'critical') ? 'Warning' : 'Normal',
            text: t.data.ai_analysis.summary || 'No summary available.',
            flags: t.data.ai_analysis.extracted_values?.filter(v => v.status !== 'normal').map(v => `${v.status} ${v.parameter}`) || []
          } : {
            status: 'Normal',
            text: 'AI analysis pending or not available for this report.',
            flags: []
          }
        }))
    : REPORTS;

  const [selectedReportId, setSelectedReportId] = useState(data.length > 0 ? data[0].id : null)
  
  const activeReport = data.find(r => r.id === selectedReportId) || data[0]

  return (
    <div className="space-y-4">
      {/* Report List */}
      <div className="grid grid-cols-1 gap-3">
        {data.length === 0 ? (
          <div className="p-4 rounded-2xl border bg-slate-50 text-slate-500 text-center text-sm">No reports available</div>
        ) : data.map((report) => (
          <div 
            key={report.id}
            onClick={() => setSelectedReportId(report.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group
              ${selectedReportId === report.id 
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                : 'bg-white border-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
              }
            `}
          >
            <div className="flex gap-3 items-center">
              <div className={`p-2 rounded-xl ${selectedReportId === report.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-semibold text-sm ${selectedReportId === report.id ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                  {report.title}
                </h4>
                <p className="text-xs text-slate-500">{report.date} • {report.type}</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${selectedReportId === report.id ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
          </div>
        ))}
      </div>

      {/* Active Report Preview Area */}
      <AnimatePresence mode="wait">
        {activeReport ? (
        <motion.div
          key={activeReport.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white">{activeReport.title}</h5>
              <p className="text-xs text-slate-500">{activeReport.lab}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Document Preview Placeholder */}
          <div className="h-48 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">Document Preview</p>
            <p className="text-xs text-slate-400">PDF - 2.4 MB</p>
          </div>

          {/* AI Summary Panel */}
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 relative overflow-hidden">
            <Sparkles className="absolute top-2 right-2 w-24 h-24 text-indigo-500/10 dark:text-indigo-400/5" />
            
            <div className="flex items-center justify-between mb-3 relative z-10">
              <h6 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1 text-sm">
                <Sparkles className="w-4 h-4" /> AI Analysis
              </h6>
              {activeReport.aiSummary?.status === 'Warning' ? (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Flagged
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Normal
                </span>
              )}
            </div>

            <p className="text-sm text-indigo-950/80 dark:text-indigo-200/80 leading-relaxed mb-3 relative z-10">
              {activeReport.aiSummary?.text}
            </p>

            {activeReport.aiSummary?.flags?.length > 0 && (
              <div className="flex gap-2 relative z-10 flex-wrap">
                {activeReport.aiSummary.flags.map(flag => (
                  <span key={flag} className="px-2 py-1 bg-white/60 dark:bg-slate-900/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold rounded uppercase tracking-wider shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                    {flag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        ) : null}
      </AnimatePresence>
      
      <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20">
        Upload New Report
      </Button>

    </div>
  )
}
