import React, { useState } from 'react';
import {
  ArrowLeft, Check, X, Trash2, Phone, Mail, Globe, MapPin, ExternalLink,
  FileText, DoorOpen, Clock, CalendarClock, MessageCircleHeart, User,
  Loader2, CircleCheck, CircleX, StickyNote, Eye, Image as ImageIcon,
} from 'lucide-react';
import { getCategoryName, fullAddress, buildGoogleMapsLink, hasHours, groupedHoursDisplay, isAppointmentOnly } from '../models/Service.js';

// A `Recommendation` and a `Service` share the same field names (check backend code models/Recommendation.js)
// so Service.js's display helpers work here unmodified. This panel is intentionally read-only for everything except Admin Notes

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-secondary">
      <Icon className="h-4 w-4 text-faint mt-0.5 shrink-0" />
      <span className="leading-snug">{children}</span>
    </div>
  );
}

// Read-only photo display 
function ImageViewer({ imageUrl }) {
  return (
    <div className="relative w-full aspect-[16/9] bg-surface-subtle rounded-xl overflow-hidden border border-divider">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-faint gap-1.5">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs">No photo submitted</span>
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES = {
  new:       { label: 'New',       badge: 'text-warning-text bg-warning-soft border-warning-border' },
  reviewing: { label: 'Reviewing', badge: 'text-warning-text bg-warning-soft border-warning-border' },
  approved:  { label: 'Approved',  badge: 'text-success-text bg-success-soft border-success-border' },
  rejected:  { label: 'Rejected',  badge: 'text-muted bg-surface-subtle border-divider' },
};

export default function RecommendationDetailPanel({
  recommendation, onClose, tags = [],
  onStartReview, onApprove, onReject, onDelete, busy,
}) {
  const [adminNotes, setAdminNotes] = useState(recommendation.admin_notes ?? '');

  const style = STATUS_STYLES[recommendation.status] ?? STATUS_STYLES.new;
  const isPending = recommendation.status === 'new' || recommendation.status === 'reviewing';
  const isNew = recommendation.status === 'new';
  const recTags = tags.filter(t => recommendation.tag_ids.includes(t.id));

  return (
    <aside className="w-full h-full shrink-0 flex flex-col border-r border-divider-page bg-surface overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-divider-subtle shrink-0">
        <button onClick={onClose}
          className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-accent-text transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to suggestions
        </button>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${style.badge}`}>
          {recommendation.status === 'approved' && <CircleCheck className="h-3.5 w-3.5" />}
          {recommendation.status === 'rejected' && <CircleX className="h-3.5 w-3.5" />}
          {style.label}
        </span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Photo — read-only, whatever the person suggesting this service uploaded (if anything) */}
        <ImageViewer imageUrl={recommendation.image_url} />

        {/* Name + category */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-primary leading-tight">{recommendation.recommended_name}</h2>
          <span className="text-xs font-semibold text-muted bg-surface-subtle px-2.5 py-1 rounded-full inline-block">
            {recommendation.category_name ?? getCategoryName(recommendation.category_id)}
          </span>
        </div>

        {/* Tags */}
        {recTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recTags.map(tag => (
              <span key={tag.id} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent-text border border-accent-border">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Contact block */}
        <div className="space-y-2.5 pt-1">
          {fullAddress(recommendation) ? (
            <InfoRow icon={MapPin}>{fullAddress(recommendation)}</InfoRow>
          ) : (
            <InfoRow icon={Globe}><span className="text-admin-text font-medium">No Fixed Location</span></InfoRow>
          )}
          {recommendation.phone && <InfoRow icon={Phone}>{recommendation.phone}</InfoRow>}
          {recommendation.email && <InfoRow icon={Mail}>{recommendation.email}</InfoRow>}
          {recommendation.website_url && (
            <InfoRow icon={Globe}>
              <a href={recommendation.website_url} target="_blank" rel="noopener noreferrer"
                className="text-accent-text font-medium hover:underline">
                {recommendation.website_url}
              </a>
            </InfoRow>
          )}
        </div>

        {/* Map link */}
        {fullAddress(recommendation) && (
          <a href={buildGoogleMapsLink(recommendation)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-secondary bg-surface-muted hover:bg-surface-subtle border border-divider rounded-lg transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
          </a>
        )}

        {/* Hours */}
        {(hasHours(recommendation) || isAppointmentOnly(recommendation)) && (
          <div className="space-y-1.5 pt-2 border-t border-divider-subtle">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" /> Hours of Operation
            </p>
            {isAppointmentOnly(recommendation) ? (
              <p className="flex items-center gap-1.5 text-sm text-secondary leading-relaxed">
                <CalendarClock className="h-4 w-4 text-warning-icon shrink-0" /> By appointment only.
              </p>
            ) : (
              <div className="text-sm space-y-1">
                {groupedHoursDisplay(recommendation).map(({ label, text }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-muted">{label}</span>
                    <span className={text === 'Closed' ? 'text-faint' : 'font-medium text-secondary'}>{text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {recommendation.description && (
          <div className="space-y-1.5 pt-2 border-t border-divider-subtle">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" /> About
            </p>
            <p className="text-sm text-secondary leading-relaxed">{recommendation.description}</p>
          </div>
        )}

        {/* Inclusivity notes */}
        {recommendation.inclusivity_notes && (
          <div className="space-y-1.5 bg-accent-soft/60 border border-accent-border rounded-xl p-3.5">
            <p className="text-xs font-semibold text-accent-text-strong uppercase tracking-wider">Inclusivity Notes</p>
            <p className="text-sm text-accent-text-emphasis/80 leading-relaxed">{recommendation.inclusivity_notes}</p>
          </div>
        )}

        {/* Washroom info */}
        {recommendation.washroom_info && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
              <DoorOpen className="h-3.5 w-3.5" /> Washroom Info
            </p>
            <p className="text-sm text-secondary leading-relaxed">{recommendation.washroom_info}</p>
          </div>
        )}

        {/* Why they recommend it */}
        {recommendation.message && (
          <div className="space-y-1.5 pt-2 border-t border-divider-subtle">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
              <MessageCircleHeart className="h-3.5 w-3.5" /> Why they recommended it
            </p>
            <p className="text-sm text-secondary italic leading-relaxed bg-surface-subtle rounded-lg p-3">
              {recommendation.message}
            </p>
          </div>
        )}

        {/* Submitted by */}
        <div className="space-y-1.5 pt-2 border-t border-divider-subtle">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
            <User className="h-3.5 w-3.5" /> Submitted By
          </p>
          <p className="text-sm text-secondary">
            {recommendation.recommended_by_name || 'Anonymous'}
            {recommendation.recommended_by_email ? ` · ${recommendation.recommended_by_email}` : ''}
          </p>
          <p className="text-[11px] text-faint">
            Submitted {new Date(recommendation.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Admin notes — the one genuinely editable field; backend already
            persists this via PUT /recommendations.php's admin_notes param */}
        <div className="space-y-1.5 pt-2 border-t border-divider-subtle">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
            <StickyNote className="h-3.5 w-3.5" /> Admin Notes
          </p>
          <textarea
            rows={3}
            placeholder="Internal notes about this decision (optional)..."
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            className="w-full bg-surface-muted border border-divider text-primary rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all"
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="px-5 py-4 border-t border-divider-subtle shrink-0 space-y-2">
        {isNew && (
          <button onClick={() => onStartReview(recommendation, adminNotes)} disabled={busy}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-warning-text bg-warning-soft hover:bg-warning-soft-strong border border-warning-border rounded-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Mark as Reviewing
          </button>
        )}
        {isPending ? (
          <div className="flex gap-2">
            <button onClick={() => onApprove(recommendation, adminNotes)} disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-success-text bg-success-soft hover:bg-success-soft-strong border border-success-border rounded-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
            </button>
            <button onClick={() => onReject(recommendation, adminNotes)} disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-danger-text bg-danger-soft hover:bg-danger-soft-strong border border-danger-border rounded-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
              <X className="h-4 w-4" /> Reject
            </button>
          </div>
        ) : (
          <p className="text-xs text-faint text-center">
            This suggestion has already been {style.label.toLowerCase()}.
          </p>
        )}
        <button onClick={() => onDelete(recommendation)} disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-faint hover:text-danger-text hover:bg-danger-soft rounded-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
          <Trash2 className="h-3.5 w-3.5" /> Delete Permanently
        </button>
      </div>
    </aside>
  );
}
