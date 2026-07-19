// ── Phone / email format helpers (Canadian phone, XXX-XXX-XXXX, no +1) ──────────
// Strips anything non-numeric as the person types and inserts dashes at the
// right spots, capping at 10 digits — so it's impossible to type an invalid
// shape in the first place rather than only catching it on submit.
export const formatPhoneInput = (raw) => {
  const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// Empty is valid (phone is optional) — only enforce the shape once something's been entered.
export const isValidPhoneFormat = (value) => !value || /^\d{3}-\d{3}-\d{4}$/.test(value);

// Structural check only (has an @ and a . after it) — not full RFC validation,
// intentionally: catches typos like missing "@" without over-verifying deliverability.
export const isValidEmailFormat = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// similar to the backend lat/long range check (services.php / recommendations.php validateCoordinates()) 
export const isValidLatitude = (value) => {
  if (value === '' || value == null) return true;
  const n = parseFloat(value);
  return !isNaN(n) && n >= -90 && n <= 90;
};

export const isValidLongitude = (value) => {
  if (value === '' || value == null) return true;
  const n = parseFloat(value);
  return !isNaN(n) && n >= -180 && n <= 180;
};

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
  { id: 18, name: 'Performers & Entertainers',        slug: 'performers-entertainers' },
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
    latitude:            raw.latitude  != null ? parseFloat(raw.latitude)  : null,
    longitude:           raw.longitude  != null ? parseFloat(raw.longitude)  : null,
    description:         raw.description          ?? '',
    inclusivity_notes:   raw.inclusivity_notes    ?? '',
    washroom_info:       raw.washroom_info         ?? '',
    verification_status: raw.verification_status  ?? 'needs verification',
    image_url:           raw.image_url             ?? null,
    hours:               normalizeHours(raw.hours), // { "mon": { "open": "09:00", "close": "17:00", "closed": false }, "tue": { "open": "09:00", "close": "17:00", "closed": false }"...": "..."}
    // Not in the Front End but in the Back End, future implementation or just leave it
    accessibility_notes: raw.accessibility_notes   ?? '',
    last_verified_at:    raw.last_verified_at      ?? null,
    is_visible:          raw.is_visible            ?? 1,
    // True if this service has no fixed public hours and must be booked directly
    by_appointment_only: raw.by_appointment_only === true || raw.by_appointment_only === 1 || raw.by_appointment_only === '1',
    // Normalized to a consistent [{ id, name }] shape regardless of source:
    // - live API sends [{ id, name, slug }]
    // - local service.json / offline fallback only has plain name strings, so
    //   those get id: null (can't be safely matched to a real DB id offline)
    tags:                normalizeTags(raw.tags),
  };
}

// Normalizes tags from either shape (API objects or legacy name strings) into
// a single consistent [{ id, name }] shape used everywhere in the app.
const normalizeTags = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.map(t => (t && typeof t === 'object')
    ? { id: t.id ?? null, name: t.name ?? '' }
    : { id: null, name: String(t) });
};

// ── Blank service for the Add form ────────────────────────────────────────────
export const emptyService = () => createService({});

// ── Derived helpers ───────────────────────────────────────────────────────────

// Builds a readable address string from split fields
export const fullAddress = (s) => [s.address, s.city, s.province].filter(Boolean).join(', ');

// True if the service has coordinates for the Leaflet map
export const isMappable = (s) => s.latitude != null && s.longitude != null;

// True if the service has a physical location (not a helpline)
export const isInPerson = (s) => Boolean(s.address?.trim());

// True if the listing has been verified by PAWS staff
export const isVerified = (s) => s.verification_status === 'verified';

// True if this service has no fixed public hours — appointment-only, always
export const isAppointmentOnly = (s) => Boolean(s.by_appointment_only);

// Lookup a category name by id
export const getCategoryName = (id) => CATEGORIES.find(c => c.id === id)?.name ?? 'Uncategorized';

// Builds an external Google Maps link. Uses the stored URL if the DB has one, otherwise falls back to a search query built from the address parts.
// Was previously copy-pasted in App.jsx and ServiceDetailPanel.jsx.
export const buildGoogleMapsLink = (s) => s.google_maps_url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(s))}`;

// ── Hours of Operation ──────────────────────────────────────────────────────
// Stored as an object keyed by day: { mon: { open: '09:00', close: '17:00', closed: false }, ... }
// open/close are 24h "HH:MM" strings from <input type="time">. Empty strings mean "not set".
export const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Monday',    short: 'Mon' },
  { key: 'tue', label: 'Tuesday',   short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday',  short: 'Thu' },
  { key: 'fri', label: 'Friday',    short: 'Fri' },
  { key: 'sat', label: 'Saturday',  short: 'Sat' },
  { key: 'sun', label: 'Sunday',    short: 'Sun' },
];

const emptyDayHours = () => ({ open: '', close: '', closed: false });

export const defaultHours = () =>
  DAYS_OF_WEEK.reduce((acc, d) => ({ ...acc, [d.key]: emptyDayHours() }), {});  // { mon: { open: '', close: '', closed: false }, tue ...)

// Merges raw hours data (may be missing, partial, or from legacy records) into the full 7-day shape
export const normalizeHours = (raw) => {
  const base = defaultHours();
  if (!raw || typeof raw !== 'object') return base;
  DAYS_OF_WEEK.forEach(({ key }) => {
    if (raw[key]) base[key] = { ...emptyDayHours(), ...raw[key] };
  });
  return base;
};

// True if at least one day has been given actual hours or explicitly marked closed —
// lets the UI hide the whole "Hours" section for listings (like helplines) that never filled it in
export const hasHours = (s) =>
  Object.values(s.hours ?? {}).some(d => d.closed || (d.open && d.close));

// "14:30" -> "2:30 PM"
export const formatTime12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

const dayText = (d) => {
  if (d.closed) return 'Closed';
  if (d.open && d.close) return `${formatTime12(d.open)} – ${formatTime12(d.close)}`;
  return 'Hours not listed';
};

// Groups consecutive days sharing identical hours for a compact display,
// e.g. "Mon–Fri: 9:00 AM – 5:00 PM", "Sat: 10:00 AM – 2:00 PM", "Sun: Closed"
export const groupedHoursDisplay = (s) => {
  const hours = s.hours;
  if (!hours) return [];
  const sameDay = (a, b) => a.closed === b.closed && a.open === b.open && a.close === b.close;

  const groups = [];
  DAYS_OF_WEEK.forEach(({ key, short }) => {
    const day = hours[key] ?? emptyDayHours();
    const last = groups[groups.length - 1];
    if (last && sameDay(last.hours, day)) {
      last.days.push(short);
    } else {
      groups.push({ days: [short], hours: day });
    }
  });

  return groups.map(g => ({
    label: g.days.length > 1 ? `${g.days[0]}–${g.days[g.days.length - 1]}` : g.days[0],
    text: dayText(g.hours),
  }));
};

// Whether the service is open right now, based on the visitor's local day/time. Returns null if no hours are set at all, or if the service is appointment-only.
export const isOpenNow = (s) => {
  if (isAppointmentOnly(s)) return null;
  if (!hasHours(s)) return null;
  const now = new Date();
  const todayKey = DAYS_OF_WEEK[(now.getDay() + 6) % 7].key; // JS Sunday=0 → align to our Mon-first array
  const day = s.hours[todayKey];
  if (!day || day.closed || !day.open || !day.close) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = day.open.split(':').map(Number);
  const [ch, cm] = day.close.split(':').map(Number);
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
};