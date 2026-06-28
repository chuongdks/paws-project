import { useState } from 'react';
import { createReview } from '../models/Review.js';

// Owns the reviews array. Swap the useState initializer below for a fetch('/api/reviews') call once the PHP backend exists 
// Seeded with two sample reviews on the Campus Pride Centre (id: 1) so the feature isn't empty on first load.
const SEED_REVIEWS = [
  createReview({
    id: 1, listing_id: 1, reviewer_name: 'Jordan M.',
    overall_rating: 5,
    comment: 'Such a welcoming space — the staff were incredibly kind and the centre felt genuinely safe.',
    created_at: '2026-05-02T12:00:00Z',
  }),
  createReview({
    id: 2, listing_id: 1, reviewer_name: 'Alex R.',
    overall_rating: 4,
    comment: 'Great resource for students. Wish the hours were a bit longer, but overall a fantastic space.',
    created_at: '2026-05-20T09:30:00Z',
  }),
];

export function useReviews() {
  const [reviews, setReviews] = useState(SEED_REVIEWS);

  // Most recent first, like Google Maps reviews
  const getReviewsFor = (listingId) =>
    reviews
      .filter(r => r.listing_id === listingId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const addReview = (listingId, { rating, comment }, user) => {
    const newReview = createReview({
      id: Date.now(),
      listing_id: listingId,
      user_id: user.id,
      reviewer_name: user.name,
      overall_rating: rating,
      comment,
    });
    setReviews(prev => [newReview, ...prev]);
  };

  const deleteReview = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  return { getReviewsFor, addReview, deleteReview };
}
