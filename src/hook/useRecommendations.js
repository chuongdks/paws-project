import { useState, useCallback } from 'react';
import { createRecommendation } from '../models/Recommendation.js';
import api from '../api/axiosConfig.js';
import { useToast } from '../context/ToastContext.jsx';

//   - createSuggestion(): public, no auth required. POST /recommendations.php
//   - fetchRecommendations(status): admin only. GET /recommendations.php?status=...
//   - approve() / reject(): admin only. PUT /recommendations.php, approving makes the backend create a real `listings` row automatically
//   - remove(): admin only. DELETE /recommendations.php (for spam/dupes, kept separate from reject so rejected-but-kept-for-records stays intact)
export function useRecommendations() {
  const toast = useToast();
  const [recommendations, setRecommendations] = useState([]); // whatever status was last fetched
  const [statusFilter, setStatusFilter]       = useState('new'); // 'new' | 'reviewing' | 'approved' | 'rejected' | 'all'
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);

  const [pendingCount, setPendingCount]       = useState(0); // count of status IN ('new','reviewing') — the Sidebar tab badge

  const [submitting, setSubmitting]           = useState(false);
  const [submitError, setSubmitError]         = useState(null);

  const [actioningId, setActioningId]         = useState(null); // review row currently being approved/rejected/deleted

  // 'pending' means anything an admin still needs to act on: 'new' + 'reviewing'.
  // The backend only filters by a single status per request, so this fires both and sums them rather than trying to fetch a combined status.
  const refreshPendingCount = useCallback(async () => {
    try {
      const [newRes, reviewingRes] = await Promise.all([
        api.get('/recommendations.php', { params: { status: 'new' } }),
        api.get('/recommendations.php', { params: { status: 'reviewing' } }),
      ]);
      const newCount = newRes.data.success ? newRes.data.data.length : 0;
      const reviewingCount = reviewingRes.data.success ? reviewingRes.data.data.length : 0;
      setPendingCount(newCount + reviewingCount);
    } catch (err) {
      console.error('Failed to refresh pending suggestion count:', err);
    }
  }, []);

  // Admin moderation queue. status: 'new' | 'reviewing' | 'approved' | 'rejected' | 'all'
  const fetchRecommendations = useCallback(async (status = 'new') => {
    setStatusFilter(status);
    setLoading(true);
    try {
      const response = await api.get('/recommendations.php', { params: { status } });
      if (response.data.success) {
        setRecommendations(response.data.data.map(createRecommendation));
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Could not load suggestions.');
    } finally {
      setLoading(false);
    }
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Public submission (Works for non logged in user)
  // If logged in, the backend fills recommended_by_name/email from the token automatically when they're omitted here.
  const createSuggestion = async (formData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await api.post('/recommendations.php', {
        recommended_name:     formData.name,
        category_id:          Number(formData.category_id),
        address:               formData.address || null,
        city:                  formData.city || null,
        province:              formData.province || null,
        phone:                 formData.phone || null,
        email:                 formData.email || null,
        website_url:           formData.website_url || null,
        description:           formData.description || null,
        inclusivity_notes:     formData.inclusivity_notes || null,
        washroom_info:         formData.washroom_info || null,
        hours:                 formData.hours,
        by_appointment_only:   formData.by_appointment_only,
        image_url:             formData.image_url || null,
        tag_ids:               formData.tags,
        recommended_by_name:   formData.recommender_name || null,
        recommended_by_email:  formData.recommender_email || null,
        message:               formData.message || null,
        latitude:              formData.latitude,
        longitude:             formData.longitude,
      });
      if (!response.data.success) {
        setSubmitError(response.data.message || 'Could not submit this suggestion.');
        return false;
      }
      toast.success('Thanks! Your suggestion was submitted for review.');
      return true;
    } catch (err) {
      console.error('Failed to submit suggestion:', err);
      setSubmitError(err.response?.data?.message || 'Could not submit this suggestion — please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // PUT: mark as being looked at — 'new' → 'reviewing'. 
  // Still pending (shows up in the badge, Approve/Reject still available), just signals to other admins that someone has picked it up.
  const markReviewing = async (id, adminNotes = null) => {
    setActioningId(id);
    try {
      const response = await api.put('/recommendations.php', { id, status: 'reviewing', admin_notes: adminNotes });
      if (response.data.success) {
        await Promise.all([fetchRecommendations(statusFilter), refreshPendingCount()]);
        toast.success('Marked as reviewing.');
        return true;
      }
      toast.error(response.data.message || 'Could not update this suggestion.');
      return false;
    } catch (err) {
      console.error('Failed to mark recommendation as reviewing:', err);
      toast.error('Could not update this suggestion.');
      return false;
    } finally {
      setActioningId(null);
    }
  };

  // PUT: approve, backend creates the real listing and stamps approved_listing_id back onto this row.
  const approve = async (id, adminNotes = null) => {
    setActioningId(id);
    try {
      const response = await api.put('/recommendations.php', { id, status: 'approved', admin_notes: adminNotes });
      if (response.data.success) {
        await Promise.all([fetchRecommendations(statusFilter), refreshPendingCount()]);
        toast.success('Suggestion approved. Added to the directory.');
        return { ok: true, listingId: response.data.listing_id };
      }
      toast.error(response.data.message || 'Could not approve this suggestion.');
      return { ok: false };
    } catch (err) {
      console.error('Failed to approve recommendation:', err);
      toast.error('Could not approve this suggestion.');
      return { ok: false };
    } finally {
      setActioningId(null);
    }
  };

  // PUT: reject, marked rejected and kept for records (not deleted).
  const reject = async (id, adminNotes = null) => {
    setActioningId(id);
    try {
      const response = await api.put('/recommendations.php', { id, status: 'rejected', admin_notes: adminNotes });
      if (response.data.success) {
        await Promise.all([fetchRecommendations(statusFilter), refreshPendingCount()]);
        toast.success('Suggestion rejected.');
        return true;
      }
      toast.error(response.data.message || 'Could not reject this suggestion.');
      return false;
    } catch (err) {
      console.error('Failed to reject recommendation:', err);
      toast.error('Could not reject this suggestion.');
      return false;
    } finally {
      setActioningId(null);
    }
  };

  // DELETE: fully remove a recommendation row (spam/duplicates). FYI: not the same as reject which keeps the service row around
  const remove = async (id) => {
    setActioningId(id);
    try {
      const response = await api.delete('/recommendations.php', { data: { id } });
      if (response.data.success) {
        setRecommendations(prev => prev.filter(r => r.id !== id));
        await refreshPendingCount();
        toast.success('Suggestion deleted.');
        return true;
      }
      toast.error(response.data.message || 'Could not delete this suggestion.');
      return false;
    } catch (err) {
      console.error('Failed to delete recommendation:', err);
      toast.error('Could not delete this suggestion.');
      return false;
    } finally {
      setActioningId(null);
    }
  };

  return {
    recommendations, loading, error, statusFilter,
    fetchRecommendations, pendingCount,
    createSuggestion, submitting, submitError,
    markReviewing, approve, reject, remove, actioningId,
  };
}
