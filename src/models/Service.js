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
  // NOOR add this in the DB
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
    lat:                 raw.lat  != null ? parseFloat(raw.lat)  : null,
    lng:                 raw.lng  != null ? parseFloat(raw.lng)  : null,
    description:         raw.description          ?? '',
    inclusivity_notes:   raw.inclusivity_notes    ?? '',
    washroom_info:       raw.washroom_info         ?? '',
    verification_status: raw.verification_status  ?? 'needs verification',
    is_visible:          raw.is_visible            ?? 1,
    tags:                Array.isArray(raw.tags)   ? raw.tags : [],
    // Temporary client-side only, NOOR add this in the DB
    image_url:           raw.image_url             ?? null,
    hours:               normalizeHours(raw.hours), // { "mon": { "open": "09:00", "close": "17:00", "closed": false }, "tue": { "open": "09:00", "close": "17:00", "closed": false }"...": "..."}
  };
}

// ── Blank service for the Add form ────────────────────────────────────────────
export const emptyService = () => createService({});

// ── Derived helpers ───────────────────────────────────────────────────────────

// Builds a readable address string from split fields
export const fullAddress = (s) => [s.address, s.city, s.province].filter(Boolean).join(', ');

// True if the service has coordinates for the Leaflet map
export const isMappable = (s) => s.lat != null && s.lng != null;

// True if the service has a physical location (not a helpline)
export const isInPerson = (s) => Boolean(s.address?.trim());

// True if the listing has been verified by PAWS staff
export const isVerified = (s) => s.verification_status === 'verified';

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

// Whether the service is open right now, based on the visitor's local day/time. Returns null if no hours are set at all.
export const isOpenNow = (s) => {
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