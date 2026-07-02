import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

// ── Full disclaimer modal, opened from the Footer's "Read full disclaimer" link ──
export default function DisclaimerModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-base pt-1.5">Disclaimer</h3>
          </div>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-700 rounded-lg p-1 hover:bg-slate-100 transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="text-sm text-slate-600 leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <p>
            We do not endorse these busineses, they are just here to provide information (cause of adveristing alcohol cause Paws in recovery is a recovery organization, 
            they just want to allow people to have safe space)
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
