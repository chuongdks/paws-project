import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useModalA11y } from '../hook/useModalA11y.js';

// ── Delete confirm modal ───────────────────────────────────────────────────────
export default function DeleteConfirmModal({ title = 'Delete Item', message, onConfirm, onCancel, error, confirming }) {
  const panelRef = useModalA11y(onCancel);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div ref={panelRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title"
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 outline-none">
        {/* Icon + message */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-danger-soft rounded-xl shrink-0">
            <AlertTriangle className="h-5 w-5 text-danger-text" />
          </div>
          <div>
            <h3 id="delete-confirm-title" className="font-bold text-primary text-base">{title}</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {error && <p className="text-xs text-danger-text">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onCancel} disabled={confirming}
            className="px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-subtle rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={confirming}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-danger text-white rounded-lg hover:bg-danger-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirming ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
