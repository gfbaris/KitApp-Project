import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Konteyneri */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map(({ id, message, type }) => {
          const styles = {
            success: 'bg-emerald-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-indigo-500 text-white',
          };
          const icons = { success: '✓', error: '✕', info: 'ℹ' };
          return (
            <div
              key={id}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-lg text-sm font-medium cursor-pointer max-w-xs transition-all duration-300 ${styles[type] || styles.info}`}
              onClick={() => removeToast(id)}
            >
              <span className="text-base font-bold">{icons[type]}</span>
              <span>{message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast, ToastProvider içinde kullanılmalıdır');
  return ctx;
};

export default ToastContext;
