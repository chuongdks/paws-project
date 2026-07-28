# PAWS in Recovery Service Maps

A community maintained directory of 2SLGBTQIA+-friendly services in Windsor-Essex. People can search/filter listings on a map, leave reviews, and suggest new services for admin review. Admins manage the listing directory, moderate suggestions and reviews, and manage user accounts.

Built for **PAWS in Recovery** (https://pawsinrecovery.ca/).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Frontend)](#getting-started-frontend)
- [Getting Started (Backend)](#getting-started-backend)
- [Database](#database)
- [Feature Overview](#feature-overview)
- [Auth Model](#auth-model)
- [Offline Fallback Behavior](#offline-fallback-behavior)
- [Known Gotchas / Things to Know Before You Touch This](#known-gotchas--things-to-know-before-you-touch-this)
- [Testing](#testing)
- [Contributors](#contributors)

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v4 (via `@theme` / CSS custom properties — see [`index.css`](./src/index.css) for the full design-token system, light + dark mode)
- React Leaflet (map) + Leaflet Gesture Handling
- Fuse.js (fuzzy search)
- Axios
- lucide-react (icons)

**Backend**
- PHP (plain PDO, no framework) — flat file-per-endpoint structure
- MySQL / MariaDB
- Token-based auth (custom bearer tokens, not JWT — see [Auth Model](#auth-model))

There is no build step tying frontend and backend together — they're deployed and versioned independently, connected only via the REST-ish JSON API described below.

---

## Project Structure

```
src/
  components/     UI components (modals, cards, panels, sidebar, etc.)
  context/        React Context providers: Auth, Theme, Toast
  data/           service.json — offline fallback dataset (see below)
  hook/           Custom hooks — one per major feature area, own their own state + API calls
  models/         Plain factory functions that normalize raw API/JSON shapes
                  (Service.js, Recommendation.js, Review.js) — always run
                  data through these before using it in the UI
  api/            axiosConfig.js — shared axios instance + interceptors
  App.jsx         Top-level layout & wiring
  main.jsx        Entry point (wraps App in Theme/Toast/Auth providers)

backend (Check the backend repo)
```

### Hooks (`src/hook/`) — what owns what

| Hook | Owns |
|---|---|
| `useServiceCRUD` | The live `services` array, all create/update/delete, add/edit modal state, JSON export (dev feature) |
| `useServiceDirectory` | Search query + access/category filters, Fuse.js instance |
| `useServiceSelection` | Which service is selected, scroll-to-card, auto-clear on filter |
| `useTaxonomy` | Categories + tags, with static fallbacks if the API is down |
| `useRecommendations` | Public "Suggest a Service" submissions + admin moderation queue |
| `useReviews` | Per-listing reviews (cached by `listingId:status`) **and** the admin-wide cross-listing pending-reviews queue |
| `useUserManagement` | Admin-only: list/promote/demote/enable/disable users |
| `useModalA11y` | Shared focus-trap/Escape/Tab-cycling behavior for every modal |

If you're adding a new feature that talks to the API, follow this pattern: one hook owns the state + API calls, and the hook is only ever called once at the top of `App.jsx`, then its returned values are passed down as props. No component below `App.jsx` calls `api` directly.

---

## Getting Started (Frontend)

```bash
npm install
```

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8000/directory/api
```

(Point this at wherever your PHP backend is being served — see [`axiosConfig.js`](./src/api/axiosConfig.js), which reads `import.meta.env.VITE_API_URL` as the axios `baseURL`.)

```bash
npm run dev
```

If the backend isn't reachable, the app still runs — see [Offline Fallback Behavior](#offline-fallback-behavior).

---

4. **This file is gitignored — never commit real credentials.** Ask a teammate for the values, or set up your own local DB.
5. Point your web server (Apache/nginx/PHP built-in server) at the directory so the endpoints resolve at whatever path `VITE_API_URL` expects, e.g.:

```bash
php -S localhost:8000
```

6. CORS is locked down in `handleCors()` (`includes/api.php`) to an explicit allow-list of origins. **If you add a new frontend origin (a new local port, a staging URL, etc.), add it to `$allowedOrigins` in that function** or every request will silently fail CORS.


## Database

- **`tables.sql`** — base schema: `categories`, `listings`, `tags`, `listing_tags`, `recommendations`, `reviews`.
- **`data.sql`** — seed categories + tags.
- **Numbered migrations** (`001_...` onward) — run in order, each does one focused thing:
  1. `001` — adds `hours`/`image_url` to listings, adds `users` + `auth_tokens` tables
  2. `003` — adds `gender` to users, `by_appointment_only` to listings
  3. `004` — adds `user_id` to reviews (ties a review to an account)
  4. `005` — massively expands `recommendations` to carry the full submission shape (address, hours, tags, etc.) instead of just a name/category/message
  5. `006` — adds a unique constraint so one user can't leave two reviews on the same listing (**run the dedup query in that migration's own comment first** if this is an existing DB with real data)
- **`indices.sql`** — performance indexes, safe to run any time after the schema exists.
- **`hidden.sql`** — a dev/test-only seed row (`is_visible = 0`), not meant for production seeding.

If you're setting up a fresh environment: `tables.sql` → `data.sql` → migrations in numeric order → `indices.sql`.

---

## Feature Overview

**Public (no login required)**
- Browse/search/filter services by keyword, category, and in-person vs. no-fixed-location
- View a service's full detail panel (hours, tags, description, reviews)
- Suggest a new service (goes into the admin moderation queue as a `recommendation`)

**Logged-in members**
- Everything above, plus:
- Leave one review per service (overall + optional respect/inclusivity sub-ratings)
- Edit their own review (resubmits it as `pending` for re-approval)
- Manage their own account: name/email (read-only), gender, password

**Admins**
- Full CRUD on services (`listings` table), including verification status
- Moderate suggested services: new → reviewing → approved (auto-creates a real listing) / rejected, or hard-delete (spam)
- Moderate reviews two ways:
  - Per-service, from that service's detail panel
  - **Cross-listing**, from the sidebar's "Reviews" tab — every pending review across every service in one place
- Manage users: promote/demote admin role, enable/disable accounts (can't act on their own account)
- Export the live `services` array as JSON (quiet dev-only link in Account Modal — used to refresh `src/data/service.json`, the offline fallback)

---

## Auth Model

- Custom bearer tokens (64-char random hex), stored in `auth_tokens` with a 30-day expiry — **not** JWT, so there's nothing to decode client-side; validity is checked server-side against the DB on every authenticated request.
- Token lives in `localStorage` under the key exported as `TOKEN_STORAGE_KEY` (`src/api/axiosConfig.js`). `AuthContext.jsx` is the only place that should read/write it directly.
- On app mount, if a token exists, it's validated against `GET /auth/me.php` before the app trusts it (handles page refresh).
- **Global 401 handling**: `axiosConfig.js`'s response interceptor calls back into `AuthContext` on any `401`, clearing the session — this is meant for actually-expired/invalid tokens. If you add a new endpoint that can legitimately return `401` for a reason *other than* "this session is dead" (see `change-password.php`'s wrong-current-password case), pass `{ skipAuthHandler: true }` in that request's axios config to opt out, or the user gets logged out instead of seeing a normal form error.

---

## Offline Fallback Behavior

If the backend API is unreachable, `useServiceCRUD` and `useTaxonomy` both fall back to static local data (`src/data/service.json` and the hardcoded `CATEGORIES`/`PAWS_TAGS` arrays in `models/Service.js`) rather than showing a blank/broken page. An amber banner appears in the UI when this happens.

To keep `service.json` from going stale, an admin can use **Account Modal → "Export services data (JSON)"** to download the live API's current dataset and drop it in as a refreshed fallback file.

To test this path locally: block the API's domain/port in devtools (Network tab → right-click a request → Block request domain) or just stop the backend server — don't disable your whole network connection, since the map tiles and fonts still need internet access.

---

## Known Gotchas / Things to Know Before You Touch This

- **Image uploads are URL-paste only, not file upload**, despite `upload-image.php` existing and being fully functional server-side. The multipart file-upload code is still in `ServiceFormModal.jsx`/`RecommendServiceModal.jsx`, just commented out (cost concerns — hosting scales with stored images). If file upload comes back, that endpoint is ready; just re-enable the commented blocks and remove the URL-paste UI.
- **Photo display is `object-cover`**, which crops non-16:9 images. If you're revisiting this, check whether a lightbox/full-view was added since — ask in the team channel, this has come up before.
- **`recommendations` and `listings` share field names on purpose** (see the comment at the top of `RecommendationDetailPanel.jsx`) so `Service.js`'s display helpers (`fullAddress`, `groupedHoursDisplay`, etc.) work unmodified on both. Don't rename fields on one without checking the other.
- **Legacy tag matching**: `service.json`'s offline data stores tags as plain name strings, not `{id, name}` objects, and gets `id: null` when normalized. `ServiceFormModal.jsx` bridges this by matching legacy tags to live tag IDs by name when editing — a fragile seam if tag names themselves ever get renamed in the DB.
- **The admin-wide Reviews tab requires `reviews.php` to support `GET` with `status` but no `listing_id`** (admin-only) — this was a backend addition made specifically for that feature; if `reviews.php` ever gets rewritten, make sure that branch survives.
- **Soft vs. hard delete inconsistency, intentionally**: deleting a *service* is a soft delete (`is_visible = 0`); deleting a *recommendation* is a hard delete (spam/dupes aren't worth keeping); *rejecting* a recommendation keeps the row (for records). Don't "fix" one to match the others without checking why.
- **Rate limits are file-based**, not DB-based (`sys_get_temp_dir()/paws_rate_limits/*.json`, keyed by hashed IP) — on a multi-server deployment behind a load balancer this won't be shared across instances. Fine for current scale, worth knowing if that changes.
- **`api_key`/`requireApiKey()` in `includes/api.php` is currently unused** by any live endpoint — it's scaffolding for a future non-browser/admin-tooling use case, not part of the current auth flow.

---

## Testing

There is currently no automated test suite (unit or e2e), QA is manual. See the QA checklist spreadsheet (ask the previous frontend dev / check the team drive) covering: auth, account management, services CRUD, recommendations, reviews (including the cross-listing admin tab), search/filter/map, layout/responsive behavior, and the offline fallback path.

If you're picking this project up and have bandwidth, adding Playwright/Cypress coverage for at minimum the auth flow, service CRUD, and review moderation would meaningfully de-risk future changes.

Also there is a PAWS_Frontend_QA_Checklist excel file for a suggested QA Testing
---

## NEW FEATURES IDEAS

- INSERT YOUR FABULOUS NEW IDEA FOR THE SITES HERE

## Contributors

Created by [Noor Haddad](http://www.linkedin.com/in/noorhaddadcs), [Parsia Zahedimazandarani](https://www.linkedin.com/in/parsia-zahedi-bb49402b6/), and [Chuong Pham](https://www.linkedin.com/in/phchuong98/).

