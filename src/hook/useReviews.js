import { useState, useCallback } from 'react';
import { createReview } from '../models/Review.js';
import api from '../api/axiosConfig.js';

// Reviews are now fetched (and cached) per listing_id + status, like how backend is made:
//   - fetchReviews(listingId)                  -> public 'approved' reviews
//   - fetchReviews(listingId, 'pending')       -> admin-only moderation queue
//   - fetchReviews(listingId, 'all')           -> admin-only, every status
const cacheKey = (listingId, status) => `${listingId}:${status}`;

export function useReviews() {
  const [reviewsByKey, setReviewsByKey] = useState({});   // { "listingId:status": Review[] }
  const [loadingByKey, setLoadingByKey] = useState({});   // { "listingId:status": boolean }
  const [error, setError]               = useState(null);

  // status: 'approved' (default/public), or 'pending' | 'all' 
  const fetchReviews = useCallback(async (listingId, status = 'approved') => {
    if (!listingId) return;
    const key = cacheKey(listingId, status);
    setLoadingByKey(prev => ({ ...prev, [key]: true }));
    try {
      const response = await api.get('/reviews.php', {
        params: { listing_id: listingId, status },
      });
      if (response.data.success) {
        setReviewsByKey(prev => ({ ...prev, [key]: response.data.data.map(createReview) }));
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Could not load reviews for this listing.');
    } finally {
      setLoadingByKey(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  // Most recent first, like Google Maps reviews. Defaults to the public
  // 'approved' bucket — pass status='pending' to read the admin queue.
  const getReviewsFor = (listingId, status = 'approved') =>
    (reviewsByKey[cacheKey(listingId, status)] ?? [])
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const isLoading = (listingId, status = 'approved') =>
    Boolean(loadingByKey[cacheKey(listingId, status)]);

  // POST: submit a new review with all three ratings.
  // New reviews always start 'pending' server-side (see reviews.php)
  const addReview = async (listingId, { rating, respect_rating, inclusivity_rating, comment }) => {
    try {
      const response = await api.post('/reviews.php', {
        listing_id: listingId,
        overall_rating: rating,
        respect_rating: respect_rating || null,
        inclusivity_rating: inclusivity_rating || null,
        comment,
      });
      return Boolean(response.data.success);
    } catch (err) {
      console.error('Failed to add review:', err);
      return false;
    }
  };

  // DELETE: remove a review (admin only)
  const deleteReview = async (reviewId, listingId, status = 'approved') => {
    try {
      const response = await api.delete('/reviews.php', { data: { id: reviewId } });
      if (response.data.success) {
        const key = cacheKey(listingId, status);
        setReviewsByKey(prev => ({
          ...prev,
          [key]: (prev[key] ?? []).filter(r => r.id !== reviewId),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete review:', err);
      return false;
    }
  };

  // PUT: admin approve/reject moderation. Refreshes both the pending queue and the public approved list 
  const updateReviewStatus = async (reviewId, status, listingId) => {
    try {
      const response = await api.put('/reviews.php', { id: reviewId, status });
      if (response.data.success) {
        await Promise.all([
          fetchReviews(listingId, 'pending'),
          fetchReviews(listingId, 'approved'),
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update review status:', err);
      return false;
    }
  };

  const approveReview = (reviewId, listingId) => updateReviewStatus(reviewId, 'approved', listingId);
  const rejectReview  = (reviewId, listingId) => updateReviewStatus(reviewId, 'rejected', listingId);

  // NOTE: the backend only includes `user_id` on review rows when the
  // requester is an admin (see reviews.php normalizeReviews($rows, $isAdmin)).
  // For a logged in non admin viewer this will always read false, even for their own review — that's an existing backend behavior, not something this frontend fix changes. 
  // Look into this SOON
  const hasUserReviewed = (listingId, userId, status = 'approved') =>
    (reviewsByKey[cacheKey(listingId, status)] ?? []).some(r => r.user_id === userId);

  return {
    fetchReviews, getReviewsFor, isLoading, error,
    addReview, deleteReview,
    updateReviewStatus, approveReview, rejectReview,
    hasUserReviewed,
  };
}
