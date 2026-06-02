import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../utils/formatters'

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />,
  error:   <XCircle size={18} className="text-red-600 flex-shrink-0" />,
  warning: <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />,
  info:    <Info size={18} className="text-blue-600 flex-shrink-0" />,
}

const toastStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
  error:   'border-red-200 bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  info:    'border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
}

function Toast({ toast }) {
  const removeToast = useUIStore(s => s.removeToast)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 w-80 rounded-xl border px-4 py-3 shadow-lg',
        toastStyles[toast.type] || toastStyles.info
      )}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
        {toast.message && <p className="text-sm opacity-90">{toast.message}</p>}
      </div>
      <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore(s => s.toasts)

  return createPortal(
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => <Toast key={toast.id} toast={toast} />)}
      </AnimatePresence>
    </div>,
    document.body
  )
}

// Hook for easy toast usage
export function useToast() {
  const addToast = useUIStore(s => s.addToast)
  return {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error:   (title, message) => addToast({ type: 'error',   title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info:    (title, message) => addToast({ type: 'info',    title, message }),
  }
}
