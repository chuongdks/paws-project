// ── Categories — mirrors the `categories` table exactly ───────────────────────
export const CATEGORIES = [
  { id: 1,  name: 'Restaurants',                     slug: 'restaurants' },
  { id: 2,  name: 'Cafés',                            slug: 'cafes' },
  { id: 3,  name: 'Bars & Pubs',                      slug: 'bars-pubs' },
  { id: 4,  name: 'Barbershops & Salons',             slug: 'barbershops-salons' },
  { id: 5,  name: 'Dentists',                         slug: 'dentists' },
  { id: 6,  name: 'Doctors & Healthcare',             slug: 'doctors-healthcare-providers' },
  { id: 7,  name: 'Lawyers & Legal Services',         slug: 'lawyers-legal-services' },
  { id: 8,  name: 'Mechanics & Auto Repair',          slug: 'mechanics-auto-repair-shops' },
  { id: 9,  name: 'Schools & Education',              slug: 'schools-educational-programs' },
  { id: 10, name: 'Government Services',              slug: 'government-offices-services' },
  { id: 11, name: 'Non-Profit Organizations',         slug: 'non-profit-organizations' },
  { id: 12, name: 'Churches & Faith Communities',     slug: 'churches-faith-communities' },
  { id: 13, name: 'Financial Services',               slug: 'financial-services' },
  { id: 14, name: 'Housing Supports',                 slug: 'housing-supports' },
  { id: 15, name: 'Pet Services',                     slug: 'pet-services' },
  { id: 16, name: 'Local Businesses',                 slug: 'local-businesses' },
  { id: 17, name: 'Other Community Resources',        slug: 'other-community-resources' },
];

// ── Tags — mirrors the `tags` table exactly ────────────────────────────────────
// Note: 'Verified by PAWS' and 'Needs verification' are admin-set, shown here
// for completeness but the form only lets regular users set the first five.
export const PAWS_TAGS = [
  '2SLGBTQIA+ owned or led',
  'Active ally',
  'Gender-inclusive washroom',
  'Safe / welcoming / affirming space',
  'Community recommended',
  'Verified by PAWS',
  'Needs verification',
];

// Tags that a regular admin can assign (excludes the auto-managed ones)
export const ASSIGNABLE_TAGS = PAWS_TAGS.slice(0, 5);

// ── Factory — normalizes raw JSON or future API response into one shape ────────
// When the PHP API arrives, just add new field aliases here if names differ.
// e.g. raw.service_name → add `?? raw.service_name` to the name line.
export function createService(raw = {}) {
  return {
    id:                  raw.id                   ?? null,
    name:                raw.name                 ?? '',
    category_id:         raw.category_id          ?? null,
    address:             raw.address              ?? '',
    city:                raw.city                 ?? '',
    province:            raw.province             ?? 'ON',
    phone:               raw.phone                ?? '',
    email:               raw.email                ?? '',
    website_url:         raw.website_url          ?? '',
    google_maps_url:     raw.google_maps_url      ?? null,
    lat:                 raw.lat  != null ? parseFloat(raw.lat)  : null,
    lng:                 raw.lng  != null ? parseFloat(raw.lng)  : null,
    description:         raw.description          ?? '',
    inclusivity_notes:   raw.inclusivity_notes    ?? '',
    washroom_info:       raw.washroom_info         ?? '',
    verification_status: raw.verification_status  ?? 'needs verification',
    is_visible:          raw.is_visible            ?? 1,
    tags:                Array.isArray(raw.tags)   ? raw.tags : [],
  };
}

// ── Blank service for the Add form ────────────────────────────────────────────
export const emptyService = () => createService({});

// ── Derived helpers ───────────────────────────────────────────────────────────

// Builds a readable address string from split fields
export const fullAddress = (s) =>
  [s.address, s.city, s.province].filter(Boolean).join(', ');

// True if the service has coordinates for the Leaflet map
export const isMappable = (s) => s.lat != null && s.lng != null;

// True if the service has a physical location (not a helpline)
export const isInPerson = (s) => Boolean(s.address?.trim());

// True if the listing has been verified by PAWS staff
export const isVerified = (s) => s.verification_status === 'verified';

// Lookup a category name by id
export const getCategoryName = (id) =>
  CATEGORIES.find(c => c.id === id)?.name ?? 'Uncategorized';
