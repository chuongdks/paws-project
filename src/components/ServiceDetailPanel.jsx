import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft, Pencil, Trash2, Globe, Phone, Mail, MapPin, ExternalLink,
  FileText, Transgender, DoorOpen, MessageSquare, Plus, Clock, CalendarClock,
  Image as ImageIcon, Upload, ShieldQuestion, Check, X as XIcon
} from 'lucide-react';
import { getCategoryName, fullAddress, buildGoogleMapsLink, hasHours, groupedHoursDisplay, isOpenNow, isAppointmentOnly } from '../models/Service.js';
import { averageRating, formatReviewDate, getInitials } from '../models/Review.js';
import VerificationBadge from './VerificationBadge.jsx';
import StarRating from './StarRating.jsx';
import ReviewFormModal from './ReviewFormModal.jsx';
import DeleteConfirmModal from './DeleteConfirmModal.jsx';

// ── Image area. WARNING: temporary client-side-only upload until DB support exists ────
function ImageUploader({ imageUrl, onChange, isAdmin }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full aspect-[16/9] bg-surface-subtle rounded-xl overflow-hidden border border-divider group">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-faint gap-1.5">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs">No photo yet</span>
        </div>
      )}

      {/* Admin privilage */}
      {isAdmin && (
        <button
          onClick={() => inputRef.current?.click()}
          className={`absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-surface/90 hover:bg-surface text-secondary-strong text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-divider transition-opacity ${
            imageUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          }`}
        >
          <Upload className="h-3.5 w-3.5" /> {imageUrl ? 'Change Photo' : 'Add Photo'}
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Small labeled row used for contact info ────────────────────────────────────
function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-secondary">
      <Icon className="h-4 w-4 text-faint mt-0.5 shrink-0" />
      <span className="leading-snug">{children}</span>
    </div>
  );
}

// ── Compact 3-rating readout (overall/respect/inclusivity), skips any that are null ──
function SubRatings({ review }) {
  const rows = [
    { label: 'Respect',      value: review.respect_rating },
    { label: 'Inclusivity',  value: review.inclusivity_rating },
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

// ── Single review row ───────────────────────────────────────────────────────────
function ReviewCard({ review, isAdmin, onDelete }) {
  return (
    <div className="space-y-2 pb-4 border-b border-divider-subtle last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent-soft-strong text-accent-text-strong text-xs font-bold flex items-center justify-center shrink-0">
            {getInitials(review.reviewer_name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-secondary-strong leading-tight">{review.reviewer_name}</p>
            <p className="text-[11px] text-faint">{formatReviewDate(review.created_at)}</p>
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => onDelete(review)} title="Delete review"
            className="p-1 rounded-md text-disabled hover:text-danger-text hover:bg-danger-soft transition-colors shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <StarRating rating={review.overall_rating} size="h-3.5 w-3.5" />
      <SubRatings review={review} />

      {review.comment && (
        <p className="text-sm text-secondary leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ── Admin only moderation row for a pending review: approve or reject the review ────────────
function PendingReviewCard({ review, onApprove, onReject, busy }) {
  return (
    <div className="space-y-2 p-3 rounded-lg border border-warning-border bg-warning-soft/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-secondary-strong leading-tight">{review.reviewer_name}</p>
          <p className="text-[11px] text-faint">{formatReviewDate(review.created_at)}</p>
        </div>
        <StarRating rating={review.overall_rating} size="h-3.5 w-3.5" />
      </div>
      <SubRatings review={review} />
      {review.comment && <p className="text-sm text-secondary leading-relaxed">{review.comment}</p>}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onApprove(review)} disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-success-text bg-success-soft hover:bg-success-soft/80 border border-success-border rounded-lg transition-colors disabled:opacity-60">
          <Check className="h-3.5 w-3.5" /> Approve
        </button>
        <button onClick={() => onReject(review)} disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-danger-text bg-danger-soft hover:bg-danger-soft/80 border border-danger-border rounded-lg transition-colors disabled:opacity-60">
          <XIcon className="h-3.5 w-3.5" /> Reject
        </button>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function ServiceDetailPanel({
  service, onClose, onEdit, onDelete, onUpdateImage, isAdmin,
  isAuthenticated, canReview, reviews, onAddReview, onDeleteReview,
  pendingReviews = [], pendingLoading = false,   
  onFetchPendingReviews, onApproveReview, onRejectReview,
}) {
  const [showReviewForm, setShowReviewForm]         = useState(false);
  const [deleteReviewTarget, setDeleteReviewTarget] = useState(null);
  const [submittedMsg, setSubmittedMsg]             = useState(false);
  const [moderationTarget, setModerationTarget]     = useState(null); // review being approved/rejected

  // Admins get a pending-review queue for whichever listing is open
  useEffect(() => {
    if (isAdmin && service?.id) onFetchPendingReviews?.(service.id);
  }, [isAdmin, service?.id]);

  const handleApprove = async (review) => {
    setModerationTarget(review.id);
    await onApproveReview?.(review.id, service.id);
    setModerationTarget(null);
  };

  const handleReject = async (review) => {
    setModerationTarget(review.id);
    await onRejectReview?.(review.id, service.id);
    setModerationTarget(null);
  };

  return (
    <aside className="w-full h-full shrink-0 flex flex-col border-r border-divider-page bg-surface overflow-hidden">

      {/* Header bar and Edit Button*/}
      <div className="flex items-center justify-between px-4 py-3 border-b border-divider-subtle shrink-0">
        <button onClick={onClose}
          className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-accent-text transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to results
        </button>
        {/* Admin privilage Edits*/}
        {isAdmin && (
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(service)} title="Edit"
              className="p-1.5 rounded-md text-faint hover:text-accent-text hover:bg-accent-soft transition-colors">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(service)} title="Delete"
              className="p-1.5 rounded-md text-faint hover:text-danger-text hover:bg-danger-soft transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Photo */}
        <ImageUploader
          imageUrl={service.image_url}
          onChange={(dataUrl) => onUpdateImage(service.id, dataUrl)}
          isAdmin={isAdmin}
        />

        {/* Name + category + verification */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-primary leading-tight">{service.name}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted bg-surface-subtle px-2.5 py-1 rounded-full">
              {getCategoryName(service.category_id)}
            </span>
            <VerificationBadge status={service.verification_status} size="lg" />
          </div>
        </div>

        {/* PAWS tags */}
        {service.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {service.tags.map(tag => (
              <span key={tag.id ?? tag.name} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent-text border border-accent-border">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Contact block */}
        <div className="space-y-2.5 pt-1">
          {fullAddress(service) ? (
            <InfoRow icon={MapPin}>{fullAddress(service)}</InfoRow>
          ) : (
            <InfoRow icon={Globe}>
              <span className="text-admin-text font-medium">No Fixed Location</span>
            </InfoRow>
          )}
          {service.phone && <InfoRow icon={Phone}>{service.phone}</InfoRow>}
          {service.email && <InfoRow icon={Mail}>{service.email}</InfoRow>}
          {service.website_url && (
            <InfoRow icon={Globe}>
              <a href={service.website_url} target="_blank" rel="noopener noreferrer"
                className="text-accent-text font-medium hover:underline">
                {service.website_url}
              </a>
            </InfoRow>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-2">
          {service.website_url && (
            <a href={service.website_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-accent-text bg-accent-soft hover:bg-accent-soft-strong border border-accent-border rounded-lg transition-colors">
              <Globe className="h-3.5 w-3.5" /> Visit Website
            </a>
          )}
          {fullAddress(service) && (
            <a href={buildGoogleMapsLink(service)} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-secondary bg-surface-muted hover:bg-surface-subtle border border-divider rounded-lg transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Open in Google Map
            </a>
          )}
        </div>

        {/* Hours of Operation — or an appointment-only note in place of the grid */}
        {(hasHours(service) || isAppointmentOnly(service)) && (
          <div className="space-y-1.5 pt-2 border-t border-divider-subtle">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5" /> Hours of Operation
              </p>
              {!isAppointmentOnly(service) && isOpenNow(service) !== null && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isOpenNow(service) ? 'bg-success-soft text-success-text' : 'bg-surface-subtle text-muted'
                }`}>
                  {isOpenNow(service) ? 'Open now' : 'Closed now'}
                </span>
              )}
            </div>

            {isAppointmentOnly(service) ? (
              <p className="flex items-center gap-1.5 text-sm text-secondary leading-relaxed">
                <CalendarClock className="h-4 w-4 text-warning-icon shrink-0" />
                By appointment only. Please contact this service directly to schedule.
              </p>
            ) : (
              <div className="text-sm space-y-1">
                {groupedHoursDisplay(service).map(({ label, text }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-muted">{label}</span>
                    <span className={text === 'Closed' ? 'text-faint' : 'font-medium text-secondary'}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {service.description && (
          <div className="space-y-1.5 pt-2 border-t border-divider-subtle">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" /> About
            </p>
            <p className="text-sm text-secondary leading-relaxed">{service.description}</p>
          </div>
        )}

        {/* Inclusivity notes */}
        {service.inclusivity_notes && (
          <div className="space-y-1.5 bg-accent-soft/60 border border-accent-border rounded-xl p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-text-strong uppercase tracking-wider">
              <Transgender className="h-3.5 w-3.5" /> Inclusivity Notes
            </p>
            <p className="text-sm text-accent-text-emphasis/80 leading-relaxed">{service.inclusivity_notes}</p>
          </div>
        )}

        {/* Washroom info */}
        {service.washroom_info && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
              <DoorOpen className="h-3.5 w-3.5" /> Washroom Info
            </p>
            <p className="text-sm text-secondary leading-relaxed">{service.washroom_info}</p>
          </div>
        )}

        {/* Admin-only: pending review moderation queue for this listing */}
        {isAdmin && (
          <div className="space-y-3 pt-2 border-t border-divider-subtle">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-warning-text uppercase tracking-wider">
              <ShieldQuestion className="h-3.5 w-3.5" /> Pending Reviews
              {pendingReviews.length > 0 && (
                <span className="text-[10px] font-bold bg-warning-soft text-warning-text px-1.5 py-0.5 rounded-full">
                  {pendingReviews.length}
                </span>
              )}
            </p>

            {pendingLoading ? (
              <p className="text-xs text-faint italic">Loading pending reviews…</p>
            ) : pendingReviews.length > 0 ? (
              <div className="space-y-2">
                {pendingReviews.map(review => (
                  <PendingReviewCard
                    key={review.id}
                    review={review}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    busy={moderationTarget === review.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-faint italic">Nothing waiting on review right now.</p>
            )}
          </div>
        )}

        {/* Reviews — Google Maps style */}
        <div className="space-y-3 pt-2 border-t border-divider-subtle">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5" /> Reviews
            </p>
            {canReview && (
              <button onClick={() => { setShowReviewForm(true); setSubmittedMsg(false); }}
                className="flex items-center gap-1 text-xs font-semibold text-accent-text hover:underline">
                <Plus className="h-3.5 w-3.5" /> Write a Review
              </button>
            )}
          </div>

          {submittedMsg && (
            <p className="text-xs font-medium text-success-text bg-success-soft border border-success-border rounded-lg px-3 py-2">
              Thanks! Your review was submitted and is awaiting approval.
            </p>
          )}

          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={averageRating(reviews)} />
              <span className="text-sm font-semibold text-secondary">{averageRating(reviews)}</span>
              <span className="text-xs text-faint">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4 pt-1">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} isAdmin={isAdmin}
                  onDelete={setDeleteReviewTarget} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-faint italic py-2">
              No reviews yet. Be the first to share your experience.
            </p>
          )}

          {/* Contextual footer message — one of four states */}
          {!isAuthenticated && (
            <p className="text-[11px] text-faint">Sign in to leave a review.</p>
          )}
          {isAdmin && (
            <p className="text-[11px] text-faint">Sorry Admins, you cannot post reviews. No corruption</p>
          )}
          {canReview === false && isAuthenticated && !isAdmin && (
            <p className="text-[11px] text-faint">You have already reviewed this service.</p>
          )}
        </div>
      </div>

      {/* Await the API call before hiding the form */}
      {showReviewForm && (
        <ReviewFormModal
          serviceName={service.name}
          onClose={() => setShowReviewForm(false)}
          onSave={async (formData) => {
            const ok = await onAddReview(formData);
            setShowReviewForm(false);
            if (ok) setSubmittedMsg(true);
          }}
        />
      )}

      {/* Await the API call before removing the target */}
      {deleteReviewTarget && (
        <DeleteConfirmModal
          title="Delete Review"
          message="Are you sure you want to remove this review? This cannot be undone."
          onConfirm={async () => {
            await onDeleteReview(deleteReviewTarget.id, service.id);
            setDeleteReviewTarget(null);
          }}
          onCancel={() => setDeleteReviewTarget(null)}
        />
      )}
    </aside>
  );
}
