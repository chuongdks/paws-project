import React from 'react';
import { BadgeCheck, ShieldAlert } from 'lucide-react';

// Two sizes to match where this badge is used:
// 'sm' — sidebar ServiceCard (compact)
// 'lg' — ServiceDetailPanel (more breathing room)
const SIZES = {
  sm: { text: 'text-[10px]', padding: 'px-2 py-0.5',   icon: 'h-3 w-3',     gap: 'gap-1' },
  lg: { text: 'text-xs',     padding: 'px-2.5 py-1',   icon: 'h-3.5 w-3.5', gap: 'gap-1.5' },
};

// ── Verification badge ─────────────────────────────────────────────────────────
export default function VerificationBadge({ status, size = 'sm' }) {
  const s = SIZES[size] ?? SIZES.sm;

  if (status === 'verified') return (
    <span className={`inline-flex items-center ${s.gap} ${s.text} font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 ${s.padding} rounded-full`}>
      <BadgeCheck className={s.icon} /> Verified{size === 'lg' ? ' by PAWS' : ''}
    </span>
  );

  if (status === 'needs verification') return (
    <span className={`inline-flex items-center ${s.gap} ${s.text} font-semibold text-amber-700 bg-amber-50 border border-amber-200 ${s.padding} rounded-full`}>
      <ShieldAlert className={s.icon} /> {size === 'lg' ? 'Needs Verification' : 'Unverified'}
    </span>
  );

  // Covers 'rejected' / 'archived' — only shown in the larger detail-panel context, matching the more complete of the two original implementations.
  if (size === 'lg') return (
    <span className={`inline-flex items-center ${s.gap} ${s.text} font-semibold text-slate-500 bg-slate-100 border border-slate-200 ${s.padding} rounded-full`}>
      {status}
    </span>
  );

  return null;
}
