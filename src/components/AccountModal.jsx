import React from 'react';
import { X, User, Mail, ShieldCheck, VenetianMask, Pencil, Check } from 'lucide-react';
import { useAuth, GENDER_OPTIONS } from '../context/AuthContext.jsx';
import { useState } from 'react';

// ── Small read-only row, matches the style used in ServiceDetailPanel's InfoRow ──
function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-faint mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</p>
        <div className="text-sm text-secondary-strong leading-snug">{children}</div>
      </div>
    </div>
  );
}

export default function AccountModal({ onClose }) {
  const { user, isAdmin, updateGender } = useAuth();
  const [editingGender, setEditingGender] = useState(false);
  const [genderDraft, setGenderDraft]     = useState(user?.gender ?? '');

  if (!user) return null;

  const saveGender = () => {
    updateGender(genderDraft);
    setEditingGender(false);
  };

  const inputCls = "w-full bg-surface-muted border border-divider text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all";

  return (
    <div
      className="fixed inset-0 z-[4000] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-primary">My Account</h2>
          <button onClick={onClose}
            className="text-faint hover:text-secondary-strong rounded-lg p-1 hover:bg-surface-subtle transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Avatar + role badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent-soft-strong text-accent-text-strong text-base font-bold flex items-center justify-center shrink-0">
            {user.name?.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')}
          </div>
          <div>
            <p className="font-semibold text-primary text-sm">{user.name}</p>
            <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isAdmin
                ? 'bg-admin-soft text-admin-text border-admin-border'
                : 'bg-surface-subtle text-secondary border-divider'
            }`}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-4 pt-1 border-t border-divider-subtle">
          <InfoRow icon={User} label="Name">{user.name}</InfoRow>
          <InfoRow icon={Mail} label="Email">{user.email}</InfoRow>
          <InfoRow icon={ShieldCheck} label="Role">{isAdmin ? 'Administrator' : 'Community Member'}</InfoRow>

          <InfoRow icon={VenetianMask} label="Gender">
            {editingGender ? (
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={genderDraft}
                  onChange={e => setGenderDraft(e.target.value)}
                  className={inputCls}
                >
                  {GENDER_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <button onClick={saveGender} title="Save"
                  className="p-2 rounded-lg text-success-text hover:bg-success-soft transition-colors shrink-0">
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span>{user.gender || 'Not set'}</span>
                <button onClick={() => { setGenderDraft(user.gender ?? ''); setEditingGender(true); }} title="Edit"
                  className="p-1 rounded-md text-faint hover:text-accent-text hover:bg-accent-soft transition-colors">
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </InfoRow>
        </div>

        <button onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-surface-subtle hover:bg-divider text-secondary text-sm font-semibold transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}
