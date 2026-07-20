import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { useModalA11y } from '../hook/useModalA11y.js';

// ── Reusable clickable star row, used for each of the 3 ratings below ──────────
function StarPicker({ label, hint, value, onSelect }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-secondary uppercase tracking-wider text-center">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i} type="button"
            onClick={() => onSelect(i)}
            onMouseEnter={() => setHover(i)}
            className="transition-transform hover:scale-110"
          >
            <Star className={`h-6 w-6 ${
              (hover || value) >= i ? 'fill-amber-400 text-amber-400' : 'text-icon-faint'
            }`} />
          </button>
        ))}
      </div>
      {hint && <p className="text-[11px] text-faint text-center">{hint}</p>}
    </div>
  );
}

export default function ReviewFormModal({ serviceName, initialReview = null, onSave, onClose }) {
  const isEdit = Boolean(initialReview);

  const [rating, setRating]                     = useState(initialReview?.overall_rating ?? 0);
  const [respectRating, setRespectRating]       = useState(initialReview?.respect_rating ?? 0);
  const [inclusivityRating, setInclusivityRating] = useState(initialReview?.inclusivity_rating ?? 0);
  const [comment, setComment]                   = useState(initialReview?.comment ?? '');
  const [error, setError]                       = useState(null);
  const [submitting, setSubmitting]             = useState(false);
  const panelRef = useModalA11y(onClose, !submitting);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select an overall star rating.');
      return;
    }
    setError(null);
    setSubmitting(true);
    await onSave({
      rating,                                  // maps to overall_rating
      respect_rating: respectRating || null,    // optional sub-rating
      inclusivity_rating: inclusivityRating || null, // optional sub-rating
      comment: comment.trim(),
    });
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-[2200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget && !submitting) onClose(); }}
    >
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="review-form-title"
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 outline-none">

        <div className="flex items-center justify-between">
          <h2 id="review-form-title" className="text-base font-bold text-primary">{isEdit ? 'Edit Your Review' : 'Write a Review'}</h2>
          <button onClick={onClose} disabled={submitting}
            className="text-faint hover:text-secondary-strong rounded-lg p-1 hover:bg-surface-subtle transition-colors disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted">
          {isEdit
            ? <>Update your review of <span className="font-semibold text-secondary-strong">{serviceName}</span>.</>
            : <>How was your experience with <span className="font-semibold text-secondary-strong">{serviceName}</span>?</>}
        </p>

        {/* Overall rating — required */}
        <StarPicker label="Overall *" value={rating} onSelect={i => { setRating(i); setError(null); }} />

        {/* Sub-ratings — optional, mirror the DB's respect_rating / inclusivity_rating columns */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-divider-subtle">
          <StarPicker
            label="Respect" hint="Optional"
            value={respectRating} onSelect={setRespectRating}
          />
          <StarPicker
            label="Inclusivity" hint="Optional"
            value={inclusivityRating} onSelect={setInclusivityRating}
          />
        </div>

        <textarea
          rows={4}
          placeholder="Share details about your experience to help others in the community..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full bg-surface-muted border border-divider text-primary rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-focus-ring/20 focus:border-focus-ring transition-all"
        />

        <p className="text-[11px] text-faint text-center">
          {isEdit
            ? 'Editing sends your review back for admin approval before it reappears publicly.'
            : 'Reviews are held for moderation and will appear once approved.'}
        </p>

        {error && <p className="text-xs text-danger-text text-center">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} disabled={submitting}
            className="flex-1 px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-subtle rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Submitting…' : isEdit ? 'Save Changes' : 'Post Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
