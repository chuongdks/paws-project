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
    <span className={`inline-flex items-center ${s.gap} ${s.text} font-semibold text-success-text bg-success-soft border border-success-border ${s.padding} rounded-full`}>
      <BadgeCheck className={s.icon} /> Verified{size === 'lg' ? ' by PAWS' : ''}
    </span>
  );

  if (status === 'needs verification') return (
    <span className={`inline-flex items-center ${s.gap} ${s.text} font-semibold text-warning-text bg-warning-soft border border-warning-border ${s.padding} rounded-full`}>
      <ShieldAlert className={s.icon} /> {size === 'lg' ? 'Needs Verification' : 'Unverified'}
    </span>
  );

  // Covers 'rejected' / 'archived' — only shown in the larger detail-panel context, matching the more complete of the two original implementations.
  if (size === 'lg') return (
    <span className={`inline-flex items-center ${s.gap} ${s.text} font-semibold text-muted bg-surface-subtle border border-divider ${s.padding} rounded-full`}>
      {status}
    </span>
  );

  return null;
}
