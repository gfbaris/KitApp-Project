import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const typeConfig = {
    success: { bg: 'bg-emerald-500', icon: '✓' },
    error:   { bg: 'bg-red-500',     icon: '✕' },
    info:    { bg: 'bg-indigo-500',  icon: 'ℹ' },
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => {
          const cfg = typeConfig[toast.type] || typeConfig.success
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg min-w-64 pointer-events-auto animate-in slide-in-from-right-5 duration-200 ${cfg.bg}`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {cfg.icon}
              </span>
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors ml-1 text-xs"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
export default ToastContext
