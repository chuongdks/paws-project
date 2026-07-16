// Same as `recommendations` table + some stuff from normalizeRecommendations() recommendations.php. 
// a recommendation is a draft service for admin to approve or deny
export function createRecommendation(raw = {}) {
  return {
    id:                     raw.id                     ?? null,
    submitted_by_user_id:   raw.submitted_by_user_id    ?? null,
    recommended_name:       raw.recommended_name        ?? '',
    category_id:            raw.category_id  != null ? Number(raw.category_id) : null,
    category_name:          raw.category_name           ?? null,
    address:                raw.address                 ?? '',
    city:                   raw.city                    ?? '',
    province:               raw.province                ?? 'ON',
    phone:                  raw.phone                   ?? '',
    email:                  raw.email                   ?? '',
    website_url:            raw.website_url             ?? '',
    google_maps_url:        raw.google_maps_url         ?? null,
    description:            raw.description             ?? '',
    inclusivity_notes:      raw.inclusivity_notes       ?? '',
    washroom_info:          raw.washroom_info           ?? '',
    accessibility_notes:    raw.accessibility_notes     ?? '',
    latitude:               raw.latitude  != null ? parseFloat(raw.latitude)  : null,
    longitude:              raw.longitude != null ? parseFloat(raw.longitude) : null,
    hours:                  raw.hours                   ?? null,
    by_appointment_only:    Boolean(raw.by_appointment_only),
    image_url:              raw.image_url               ?? null,
    tag_ids:                Array.isArray(raw.tag_ids) ? raw.tag_ids : [],
    recommended_by_name:    raw.recommended_by_name     ?? '',
    recommended_by_contact: raw.recommended_by_contact  ?? '',
    recommended_by_email:   raw.recommended_by_email    ?? '',
    message:                raw.message                 ?? '',
    // 'new' | 'reviewing' | 'approved' | 'rejected'
    status:                 raw.status                  ?? 'new',
    reviewed_by_user_id:    raw.reviewed_by_user_id     ?? null,
    admin_notes:            raw.admin_notes             ?? '',
    reviewed_at:            raw.reviewed_at             ?? null,
    approved_listing_id:    raw.approved_listing_id     ?? null,
    created_at:             raw.created_at              ?? new Date().toISOString(),
  };
}

export const isPendingReview = (r) => r.status === 'new' || r.status === 'reviewing';
