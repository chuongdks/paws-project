import React from 'react';
import { AlertTriangle } from 'lucide-react';

// ── Delete confirm modal ───────────────────────────────────────────────────────
export default function DeleteConfirmModal({ title = 'Delete Item', message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        {/* Icon + message */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-danger-soft rounded-xl shrink-0">
            <AlertTriangle className="h-5 w-5 text-danger-text" />
          </div>
          <div>
            <h3 className="font-bold text-primary text-base">{title}</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-subtle rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold bg-danger text-white rounded-lg hover:bg-danger-hover transition-colors">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
