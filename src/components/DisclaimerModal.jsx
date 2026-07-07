import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

// ── Full disclaimer modal, opened from the Footer's "Read full disclaimer" link ──
export default function DisclaimerModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-warning-soft rounded-xl shrink-0">
              <ShieldAlert className="h-5 w-5 text-warning-icon" />
            </div>
            <h3 className="font-bold text-primary text-base pt-1.5">Disclaimer</h3>
          </div>
          <button onClick={onClose}
            className="text-faint hover:text-secondary-strong rounded-lg p-1 hover:bg-surface-subtle transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="text-sm text-secondary leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <p>
            We do not endorse these busineses, they are just here to provide information (cause of adveristing alcohol cause Paws in recovery is a recovery organization, 
            they just want to allow people to have safe space)
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
