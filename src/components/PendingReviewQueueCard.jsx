import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import StarRating from './StarRating.jsx';
import { formatReviewDate } from '../models/Review.js';

// Compact 2-rating readout, same pattern as ServiceDetailPanel's SubRatings, duplicated here rather than imported since that one isn't exported.
function SubRatings({ review }) {
  const rows = [
    { label: 'Respect',     value: review.respect_rating },
    { label: 'Inclusivity', value: review.inclusivity_rating },
  ].filter(r => r.value != null);

  if (rows.length === 0) return null;

  return (
    <div className="flex items-center gap-3 pt-0.5">
      {rows.map(r => (
        <span key={r.label} className="flex items-center gap-1 text-[11px] text-faint">
          {r.label}: <StarRating rating={r.value} size="h-2.5 w-2.5" />
        </span>
      ))}
    </div>
  );
}

// Used in the admin-only "Reviews" sidebar tab, one row per pending review, across every listing at once. 
// `serviceName` is resolved by the caller (looked up from the live `services` list via review.listing_id) since the reviews table itself has no listing name column.
export default function PendingReviewQueueCard({ review, serviceName, onApprove, onReject, onOpenService, busy }) {
  const resolvedName = review.listing_name ?? serviceName ?? `Listing #${review.listing_id}`;

  return (
    <div className="space-y-2 p-3 rounded-lg border border-warning-border bg-warning-soft/50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button onClick={() => onOpenService?.(review.listing_id)}
            className="text-xs font-bold text-accent-text hover:underline truncate block max-w-full text-left">
            {resolvedName}
          </button>
          <p className="text-sm font-semibold text-secondary-strong leading-tight pt-0.5">{review.reviewer_name}</p>
          <p className="text-[11px] text-faint">{formatReviewDate(review.created_at)}</p>
        </div>
        <StarRating rating={review.overall_rating} size="h-3.5 w-3.5" />
      </div>

      <SubRatings review={review} />

      {review.comment && <p className="text-sm text-secondary leading-relaxed">{review.comment}</p>}

      <div className="flex gap-2 pt-1">
        <button onClick={() => onApprove(review)} disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-success-text bg-success-soft hover:bg-success-soft/80 border border-success-border rounded-lg transition-colors disabled:opacity-60">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
        </button>
        <button onClick={() => onReject(review)} disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-danger-text bg-danger-soft hover:bg-danger-soft/80 border border-danger-border rounded-lg transition-colors disabled:opacity-60">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />} Reject
        </button>
      </div>
    </div>
  );
}
