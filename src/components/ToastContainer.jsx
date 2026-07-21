import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastList } from '../context/ToastContext.jsx';

const STYLES = {
  success: { icon: CheckCircle2, classes: 'bg-success-soft text-success-text border-success-border' },
  error:   { icon: XCircle,      classes: 'bg-danger-soft text-danger-text border-danger-border' },
  info:    { icon: Info,         classes: 'bg-accent-soft text-accent-text border-accent-border' },
};

// One toast: handles its own mount transition (a simple opacity/translate fade-in triggered a frame after mount) so this has zero dependency on any animation library.
function ToastItem({ toast: t, onDismiss }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const { icon: Icon, classes } = STYLES[t.type] ?? STYLES.success;

  return (
    <div
      role={t.type === 'error' ? 'alert' : 'status'}
      aria-live={t.type === 'error' ? 'assertive' : 'polite'}
      className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-all duration-300 ease-out ${classes} ${
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <span className="flex-1 leading-snug">{t.message}</span>
      <button onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Render this once, near the root of the app (inside ToastProvider).
export default function ToastContainer() {
  const { toasts, dismiss } = useToastList();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[5000] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
