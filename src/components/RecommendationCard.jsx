import React from 'react';
import { MapPin, Phone, Globe, Check, X, Trash2, MessageCircleHeart, Loader2, CircleCheck, CircleX, Eye } from 'lucide-react';
import { getCategoryName } from '../models/Service.js';

const STATUS_STYLES = {
  new:       { label: 'New',       card: 'border-warning-border bg-warning-soft/40' },
  reviewing: { label: 'Reviewing', card: 'border-warning-border bg-warning-soft/40' },
  approved:  { label: 'Approved',  card: 'border-success-border bg-success-soft/30' },
  rejected:  { label: 'Rejected',  card: 'border-divider bg-surface-subtle' },
};

// ── Sidebar card for the admin "Suggestions" tab ────────────────────────────────
export default function RecommendationCard({ recommendation, onSelect, onStartReview, onApprove, onReject, onDelete, busy }) {
  const address = [recommendation.address, recommendation.city, recommendation.province].filter(Boolean).join(', ');
  const style = STATUS_STYLES[recommendation.status] ?? STATUS_STYLES.new;
  const isPending = recommendation.status === 'new' || recommendation.status === 'reviewing';
  const isNew = recommendation.status === 'new';

  return (
    <article onClick={() => onSelect?.(recommendation)}
      className={`rounded-xl border p-4 space-y-2.5 cursor-pointer transition-shadow hover:shadow-sm ${style.card}`}>

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-primary text-sm leading-snug">{recommendation.recommended_name}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold text-muted bg-surface-subtle px-2 py-0.5 rounded-full">
            {recommendation.category_name ?? getCategoryName(recommendation.category_id)}
          </span>
          {!isNew && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              recommendation.status === 'approved'
                ? 'text-success-text bg-success-soft border border-success-border'
                : recommendation.status === 'rejected'
                ? 'text-muted bg-surface-subtle border border-divider'
                : 'text-warning-text bg-warning-soft border border-warning-border'
            }`}>
              {recommendation.status === 'approved' && <CircleCheck className="h-3 w-3" />}
              {recommendation.status === 'rejected' && <CircleX className="h-3 w-3" />}
              {recommendation.status === 'reviewing' && <Eye className="h-3 w-3" />}
              {style.label}
            </span>
          )}
        </div>
      </div>

      {address && (
        <div className="flex items-start gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-faint" />
          <span className="line-clamp-2 leading-snug">{address}</span>
        </div>
      )}

      {recommendation.phone && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Phone className="h-3.5 w-3.5 shrink-0 text-faint" /> <span>{recommendation.phone}</span>
        </div>
      )}

      {recommendation.website_url && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Globe className="h-3.5 w-3.5 shrink-0 text-faint" />
          <a href={recommendation.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
            {recommendation.website_url}
          </a>
        </div>
      )}

      {recommendation.message && (
        <div className="flex items-start gap-1.5 text-xs text-secondary italic bg-surface/60 rounded-lg p-2">
          <MessageCircleHeart className="h-3.5 w-3.5 shrink-0 mt-0.5 text-faint" />
          <span className="leading-snug">{recommendation.message}</span>
        </div>
      )}

      {(recommendation.recommended_by_name || recommendation.recommended_by_email) && (
        <p className="text-[11px] text-faint">
          Suggested by {recommendation.recommended_by_name || 'Anonymous'}
          {recommendation.recommended_by_email ? ` · ${recommendation.recommended_by_email}` : ''}
        </p>
      )}

      {recommendation.status !== 'new' && recommendation.reviewed_at && (
        <p className="text-[11px] text-faint">
          {style.label} on {new Date(recommendation.reviewed_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      )}

      <div className="flex items-center gap-1.5 pt-1 border-t border-divider-subtle"
        onClick={e => e.stopPropagation()}>
        {isNew && (
          <button onClick={() => onStartReview(recommendation)} disabled={busy} title="Mark as being reviewed"
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-warning-text bg-warning-soft hover:bg-warning-soft-strong border border-warning-border rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0">
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
        {isPending && (
          <>
            <button onClick={() => onApprove(recommendation)} disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-success-text bg-success-soft hover:bg-success-soft-strong border border-success-border rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
            </button>
            <button onClick={() => onReject(recommendation)} disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-danger-text bg-danger-soft hover:bg-danger-soft-strong border border-danger-border rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
              <X className="h-3.5 w-3.5" /> Reject
            </button>
          </>
        )}
        <button onClick={() => onDelete(recommendation)} title="Delete permanently (spam/duplicate)" disabled={busy}
          className={`${isPending ? 'shrink-0' : 'flex-1 flex items-center justify-center gap-1.5'} p-1.5 rounded-lg text-faint hover:text-danger-text hover:bg-danger-soft transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100`}>
          <Trash2 className="h-3.5 w-3.5" /> {!isPending && <span className="text-xs font-semibold">Delete</span>}
        </button>
      </div>
    </article>
  );
}
