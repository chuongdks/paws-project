// Mirrors the `reviews` table from the schema. user_id is nullable to allow for anonymous/legacy reviews, though in this app only logged-in users can post one. 
// respect_rating / inclusivity_rating exist in the DB for future PAWS-specific sub-ratings but aren't collected by the form yet, FUTURE: wire up later without any schema changes.
export function createReview(raw = {}) {
  return {
    id:                 raw.id                  ?? null,
    listing_id:         raw.listing_id          ?? null,
    user_id:            raw.user_id             ?? null,
    reviewer_name:      raw.reviewer_name       ?? 'Anonymous',
    overall_rating:     raw.overall_rating      ?? 0,
    respect_rating:     raw.respect_rating      ?? null,
    inclusivity_rating: raw.inclusivity_rating  ?? null,
    comment:            raw.comment             ?? '',
    // DB default is 'pending' (awaiting moderation) — this prototype has no moderation queue yet, so reviews default to 'approved' and show immediately. 
    // Swap this default once a moderation flow exists: enum('pending','approved','rejected')
    status:             raw.status              ?? 'approved',
    created_at:         raw.created_at          ?? new Date().toISOString(),
  };
}

// Average of overall_rating across a list of reviews, rounded to 1 decimal
export const averageRating = (reviews) => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.overall_rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

export const formatReviewDate = (isoString) =>
  new Date(isoString).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });

// Initials for the little avatar circle, e.g. "Jordan M." → "JM"
export const getInitials = (name) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
