import React from 'react';
import { MapPin, Phone, Globe, Check, X, Trash2, MessageCircleHeart, Loader2 } from 'lucide-react';
import { getCategoryName } from '../models/Service.js';

// ── Sidebar card for the admin "Suggestions" tab ────────────────────────────────
export default function RecommendationCard({ recommendation, onApprove, onReject, onDelete, busy }) {
  const address = [recommendation.address, recommendation.city, recommendation.province].filter(Boolean).join(', ');

  return (
    <article className="rounded-xl border border-warning-border bg-warning-soft/40 p-4 space-y-2.5">

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-primary text-sm leading-snug">{recommendation.recommended_name}</h3>
        <span className="text-[10px] font-semibold text-muted bg-surface-subtle px-2 py-0.5 rounded-full shrink-0">
          {recommendation.category_name ?? getCategoryName(recommendation.category_id)}
        </span>
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

      <div className="flex items-center gap-1.5 pt-1 border-t border-divider-subtle">
        <button onClick={() => onApprove(recommendation)} disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-success-text bg-success-soft hover:bg-success-soft/80 border border-success-border rounded-lg transition-colors disabled:opacity-60">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
        </button>
        <button onClick={() => onReject(recommendation)} disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-danger-text bg-danger-soft hover:bg-danger-soft/80 border border-danger-border rounded-lg transition-colors disabled:opacity-60">
          <X className="h-3.5 w-3.5" /> Reject
        </button>
        <button onClick={() => onDelete(recommendation)} title="Delete permanently (spam/duplicate)" disabled={busy}
          className="p-1.5 rounded-lg text-faint hover:text-danger-text hover:bg-danger-soft transition-colors disabled:opacity-60 shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}
