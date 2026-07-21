import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // duration=0 keeps a toast until manually dismissed, not used anywhere yet, but available for a future 
  const show = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (message, duration) => show(message, 'success', duration),
    error:   (message, duration) => show(message, 'error', duration),
    info:    (message, duration) => show(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// Used by any hook/component that needs to fire a toast — e.g.
// `const toast = useToast(); toast.success('Service updated.');`
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx.toast;
}

// Separate hook for the container itself to read the active list 
export function useToastList() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastList must be used within a ToastProvider');
  return { toasts: ctx.toasts, dismiss: ctx.dismiss };
}
