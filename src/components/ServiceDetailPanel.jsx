import React, { useRef, useState } from 'react';
import {
  X, Pencil, Trash2, Globe, Phone, Mail, MapPin, ExternalLink,
  FileText, Sparkles, DoorOpen, MessageSquare, Plus,
  Image as ImageIcon, Upload
} from 'lucide-react';
import { getCategoryName, fullAddress, buildGoogleMapsLink } from '../models/Service.js';
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
    <div className="relative w-full aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs">No photo yet</span>
        </div>
      )}

      {/* Admin privilage */}
      {isAdmin && (
        <button
          onClick={() => inputRef.current?.click()}
          className={`absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-slate-200 transition-opacity ${
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
    <div className="flex items-start gap-2.5 text-sm text-slate-700">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <span className="leading-snug">{children}</span>
    </div>
  );
}

// ── Single review row ───────────────────────────────────────────────────────────
function ReviewCard({ review, isAdmin, onDelete }) {
  return (
    <div className="space-y-2 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
            {getInitials(review.reviewer_name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">{review.reviewer_name}</p>
            <p className="text-[11px] text-slate-400">{formatReviewDate(review.created_at)}</p>
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => onDelete(review)} title="Delete review"
            className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <StarRating rating={review.overall_rating} size="h-3.5 w-3.5" />

      {review.comment && (
        <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function ServiceDetailPanel({
  service, onClose, onEdit, onDelete, onUpdateImage, isAdmin,
  isAuthenticated, reviews, onAddReview, onDeleteReview,
}) {
  const [showReviewForm, setShowReviewForm]         = useState(false);
  const [deleteReviewTarget, setDeleteReviewTarget] = useState(null);

  return (
    <aside className="w-[400px] shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-hidden">

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Service Details
        </span>

        <div className="flex items-center gap-1">
          {/* Admin privilage Edits*/}
          {isAdmin && (
            <>
              <button onClick={() => onEdit(service)} title="Edit"
                className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(service)} title="Delete"
                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          {/* Normal User close button*/}
          <button onClick={onClose} title="Close"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
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
          <h2 className="text-xl font-bold text-slate-900 leading-tight">{service.name}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {getCategoryName(service.category_id)}
            </span>
            <VerificationBadge status={service.verification_status} size="lg" />
          </div>
        </div>

        {/* PAWS tags */}
        {service.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {service.tags.map(tag => (
              <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {tag}
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
              <span className="text-purple-600 font-medium">No Fixed Location</span>
            </InfoRow>
          )}
          {service.phone && <InfoRow icon={Phone}>{service.phone}</InfoRow>}
          {service.email && <InfoRow icon={Mail}>{service.email}</InfoRow>}
          {service.website_url && (
            <InfoRow icon={Globe}>
              <a href={service.website_url} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline">
                {service.website_url}
              </a>
            </InfoRow>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-2">
          {service.website_url && (
            <a href={service.website_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors">
              <Globe className="h-3.5 w-3.5" /> Visit Website
            </a>
          )}
          {fullAddress(service) && (
            <a href={buildGoogleMapsLink(service)} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Get Directions
            </a>
          )}
        </div>

        {/* Description */}
        {service.description && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" /> About
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
          </div>
        )}

        {/* Inclusivity notes — highlighted, this is a key trust signal */}
        {service.inclusivity_notes && (
          <div className="space-y-1.5 bg-blue-50/60 border border-blue-100 rounded-xl p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Inclusivity Notes
            </p>
            <p className="text-sm text-blue-900/80 leading-relaxed">{service.inclusivity_notes}</p>
          </div>
        )}

        {/* Washroom info */}
        {service.washroom_info && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <DoorOpen className="h-3.5 w-3.5" /> Washroom Info
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">{service.washroom_info}</p>
          </div>
        )}
        {/* Reviews — Google Maps style */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5" /> Reviews
            </p>
            {isAuthenticated && (
              <button onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                <Plus className="h-3.5 w-3.5" /> Write a Review
              </button>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={averageRating(reviews)} />
              <span className="text-sm font-semibold text-slate-700">{averageRating(reviews)}</span>
              <span className="text-xs text-slate-400">
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
            <p className="text-sm text-slate-400 italic py-2">
              No reviews yet — be the first to share your experience.
            </p>
          )}

          {!isAuthenticated && (
            <p className="text-[11px] text-slate-400">Sign in to leave a review.</p>
          )}
        </div>

        <p className="text-[11px] text-slate-300 pt-2 border-t border-slate-100">
          Photo, edits, and reviews are stored in-memory only until connected to the backend. NOOR PLZ ADD BACK END SOON
        </p>
      </div>

      {/* Write a review modal */}
      {showReviewForm && (
        <ReviewFormModal
          serviceName={service.name}
          onClose={() => setShowReviewForm(false)}
          onSave={(formData) => { onAddReview(formData); setShowReviewForm(false); }}
        />
      )}

      {/* Delete review confirmation */}
      {deleteReviewTarget && (
        <DeleteConfirmModal
          title="Delete Review"
          message="Are you sure you want to remove this review? This cannot be undone."
          onConfirm={() => { onDeleteReview(deleteReviewTarget.id); setDeleteReviewTarget(null); }}
          onCancel={() => setDeleteReviewTarget(null)}
        />
      )}
    </aside>
  );
}
