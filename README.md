# PAWS in Recovery Service Maps

A community maintained directory of 2SLGBTQIA+-friendly services in Windsor-Essex. People can search/filter listings on a map, leave reviews, and suggest new services for admin review. Admins manage the listing directory, moderate suggestions and reviews, and manage user accounts.

Built for **PAWS in Recovery** (https://pawsinrecovery.ca/).

This README covers the **frontend**. For backend setup (PHP, `config.php`, CORS, endpoints), see the backend repo's own README.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema (reference only)](#database-schema-reference-only)
- [Feature Overview](#feature-overview)
- [Auth Model](#auth-model)
- [Offline Fallback Behavior](#offline-fallback-behavior)
- [Known Gotchas / Things to Know Before You Touch This](#known-gotchas--things-to-know-before-you-touch-this)
- [Deployment (GitHub Pages)](#deployment-github-pages)
- [Testing](#testing)
- [New Features Ideas](#new-features-ideas)
- [Contributors](#contributors)

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v4 (via `@theme` / CSS custom properties, see [`index.css`](./src/index.css) for the full design-token system, light + dark mode)
- React Leaflet (map) + Leaflet Gesture Handling
- Fuse.js (fuzzy search)
- Axios
- lucide-react (icons)

**Backend** (separate repo - see its README for setup)
- PHP (plain PDO, no framework)
- MySQL / MariaDB
- Token-based auth (custom bearer tokens, not JWT - see [Auth Model](#auth-model))

There is no build step tying frontend and backend together, they're deployed and versioned independently, connected only via a REST JSON API.

---

## Project Structure

```
src/
  components/     UI components (modals, cards, panels, sidebar, etc.)
  context/        React Context providers: Auth, Theme, Toast
  data/           service.json - offline fallback dataset (see below)
  hook/           Custom hooks - one per major feature area, own their own state + API calls
  models/         Plain factory functions that normalize raw API/JSON shapes
                  (Service.js, Recommendation.js, Review.js) - always run
                  data through these before using it in the UI
  api/            axiosConfig.js - shared axios instance + interceptors
  App.jsx         Top-level layout & wiring
  main.jsx        Entry point (wraps App in Theme/Toast/Auth providers)

backend (separate repo, check there for its structure)
```

### Hooks (`src/hook/`) - what owns what

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

## Getting Started

```bash
npm install
```

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8000/directory/api
```

Point this at wherever the backend is being served - see [`axiosConfig.js`](./src/api/axiosConfig.js), which reads `import.meta.env.VITE_API_URL` as the axios `baseURL`. Ask the backend team (or check their README) for how to get a local instance running, and for CORS setup if you're adding a new frontend origin.

```bash
npm run dev
```

If the backend isn't reachable, the app still runs, see [Offline Fallback Behavior](#offline-fallback-behavior).

---

## Database Schema (reference only)

The frontend doesn't touch the database directly, but it's useful to know the shape of what's underneath since `src/models/*.js` mirrors these tables closely. **For actual DB setup, migrations, and credentials, see the backend repo's README** - this is just a quick-reference summary.

- **`categories`** - `id, name, slug`
- **`tags`** - `id, name, slug` (a fixed set: ownership/allyship/accessibility/safety tags, plus two admin-managed ones - "Verified by PAWS" and "Needs verification")
- **`listings`** - the real, live services shown on the map/directory. Includes address/coordinates, contact info, hours (JSON), `by_appointment_only`, `image_url`, `verification_status`, and `is_visible` (soft-delete flag)
- **`listing_tags`** - join table between `listings` and `tags`
- **`recommendations`** - public "suggest a service" submissions. Shares most field names with `listings` on purpose (see `RecommendationDetailPanel.jsx`) so the same display helpers in `Service.js` work on both. Has its own moderation `status` (`new` → `reviewing` → `approved`/`rejected`) separate from `listings.verification_status`. Approving one inserts a new row into `listings`.
- **`reviews`** - tied to a `listing_id` and optionally a `user_id`. Has `overall_rating` plus optional `respect_rating`/`inclusivity_rating`, and its own `status` (`pending`/`approved`/`rejected`). One review per user per listing is enforced with a unique constraint.
- **`users`** - `role` is `admin` or `user`, plus `is_active` for the enable/disable feature and `gender` (free-ish list defined in `AuthContext.jsx`'s `GENDER_OPTIONS`).
- **`auth_tokens`** - bearer tokens tied to a user, with an expiry (see [Auth Model](#auth-model)).

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
  - **Cross-listing**, from the sidebar's "Reviews" tab - every pending review across every service in one place
- Manage users: promote/demote admin role, enable/disable accounts (can't act on their own account)
- Export the live `services` array as JSON (quiet dev-only link in Account Modal - used to refresh `src/data/service.json`, the offline fallback)

---

## Auth Model

- Custom bearer tokens (64-char random hex), stored server-side in `auth_tokens` with a 30-day expiry - **not** JWT, so there's nothing to decode client-side; validity is checked server-side on every authenticated request.
- Token lives in `localStorage` under the key exported as `TOKEN_STORAGE_KEY` (`src/api/axiosConfig.js`). `AuthContext.jsx` is the only place that should read/write it directly.
- On app mount, if a token exists, it's validated against `GET /auth/me.php` before the app trusts it (handles page refresh).
- **Global 401 handling**: `axiosConfig.js`'s response interceptor calls back into `AuthContext` on any `401`, clearing the session - this is meant for actually-expired/invalid tokens. If you add a new endpoint that can legitimately return `401` for a reason *other than* "this session is dead" (see `change-password.php`'s wrong-current-password case), pass `{ skipAuthHandler: true }` in that request's axios config to opt out, or the user gets logged out instead of seeing a normal form error.

---

## Offline Fallback Behavior

If the backend API is unreachable, `useServiceCRUD` and `useTaxonomy` both fall back to static local data (`src/data/service.json` and the hardcoded `CATEGORIES`/`PAWS_TAGS` arrays in `models/Service.js`) rather than showing a blank/broken page. An amber banner appears in the UI when this happens.

To keep `service.json` from going stale, an admin can use **Account Modal → "Export services data (JSON)"** to download the live API's current dataset and drop it in as a refreshed fallback file.

To test this path locally: block the API's domain/port in devtools (Network tab → right-click a request → Block request domain) or just stop the backend server - don't disable your whole network connection, since the map tiles and fonts still need internet access.

---

## Known Gotchas / Things to Know Before You Touch This

- **Image uploads are URL-paste only, not file upload**, even though the backend has a working upload endpoint. The multipart file-upload code is still in `ServiceFormModal.jsx`/`RecommendServiceModal.jsx`, just commented out (cost concerns - hosting scales with stored images). If file upload comes back, just re-enable the commented blocks and remove the URL-paste UI (check with the backend team that their endpoint is still current first).
- **Photo display is `object-cover`**, which crops non-16:9 images. If you're revisiting this, check whether a lightbox/full-view was added since - ask in the team channel, this has come up before.
- **`recommendations` and `listings` share field names on purpose** (see the comment at the top of `RecommendationDetailPanel.jsx`) so `Service.js`'s display helpers (`fullAddress`, `groupedHoursDisplay`, etc.) work unmodified on both. Don't rename fields on one without checking the other - and check with the backend team before renaming a DB column either.
- **Legacy tag matching**: `service.json`'s offline data stores tags as plain name strings, not `{id, name}` objects, and gets `id: null` when normalized. `ServiceFormModal.jsx` bridges this by matching legacy tags to live tag IDs by name when editing - a fragile seam if tag names themselves ever get renamed in the DB.
- **The admin-wide Reviews tab depends on a specific backend behavior**: `GET /reviews.php` with a `status` but no `listing_id`, admin-only. This was a backend addition made specifically for this feature - confirm with the backend team before assuming it still works if `reviews.php` gets rewritten.
- **Soft vs. hard delete inconsistency, intentionally**: deleting a *service* is a soft delete (hidden, not removed); deleting a *recommendation* is a hard delete (spam/dupes aren't worth keeping); *rejecting* a recommendation keeps the row (for records). This is a backend decision the frontend just reflects - don't "fix" the UI to imply otherwise without checking with the backend team first.

---

## Static Host Deployment (GitHub Pages)

The frontend is a static Vite build, so GitHub Pages works fine for hosting it for free, just remember it's **static hosting only**: the backend still needs to live somewhere else that can actually run it, and `VITE_API_URL` needs to point at that live backend before you build.

### One-time setup

1. Install `gh-pages` as a dev dependency:

   ```bash
   npm install gh-pages --save-dev
   ```

2. In `vite.config.js`, set `base` to your repo name (this is what makes asset paths resolve correctly under `https://<username>.github.io/<repo-name>/` instead of at the domain root):

   ```js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: '/<repo-name>/',
   })
   ```

3. In `package.json`, add a `homepage` field and two scripts:

   ```json
   {
     "homepage": "https://<username>.github.io/<repo-name>/",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. Make sure `VITE_API_URL` in your `.env` (or however you're supplying build-time env vars in CI) points at the **deployed** backend URL, not `localhost` - Vite bakes `import.meta.env.VITE_API_URL` into the build at build time, so this has to be set correctly *before* running `npm run deploy`.

5. Also double check with the backend team that the deployed GitHub Pages origin (`https://<username>.github.io`) has been added to their CORS allow-list, or every request from the deployed site will fail CORS.

6. Also also remember to tell the back end team to add "127.0.0.1:5173" to the CORS too since localhost and 127.0.0.1 are not consider the same in CORS somehow.

### Deploying

```bash
npm run deploy
```

This builds the app and pushes the `dist/` output to a `gh-pages` branch. Then, one-time in the repo's settings:

- **Settings → Pages → Build and deployment → Source**: set to **"Deploy from a branch"**
- **Branch**: `gh-pages`, folder `/ (root)`
- Save, wait a minute or two, and the site is live at the `homepage` URL from step 3.

To publish a new version later, just run `npm run deploy` again.

### Common gotcha: blank page / 404s on assets after deploying

If the deployed site loads a blank page and the console shows 404s for `.js`/`.css` files, the `base` in `vite.config.js` almost always doesn't match the actual repo name (including case) - double check it's exactly `/<repo-name>/` with leading and trailing slashes.

### Alternative: GitHub Actions (auto-deploy on push)

If you'd rather not run `npm run deploy` manually every time, a workflow file (e.g. `.github/workflows/deploy.yml`) can build and push to `gh-pages` automatically on every push to `main`:

```yaml
name: Deploy Vite app to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
```

Same `vite.config.js` `base` and `Settings → Pages` setup applies either way - this just automates the `npm run deploy` step so nobody forgets to run it before a demo.

---

## Testing

There is currently no automated test suite (unit or e2e), QA is manual. See the QA checklist spreadsheet (ask the previous frontend dev / check the team drive) covering: auth, account management, services CRUD, recommendations, reviews (including the cross-listing admin tab), search/filter/map, layout/responsive behavior, and the offline fallback path.

If you're picking this project up and have bandwidth, adding Playwright/Cypress coverage for at minimum the auth flow, service CRUD, and review moderation would meaningfully de-risk future changes.

Also there is a PAWS_Frontend_QA_Checklist excel file for a suggested QA Testing

---

## New Features Ideas

- Just make it better bro
- INSERT YOUR NEW FEATURES FOR THE SITE HERE

## Contributors

Created by [Noor Haddad](http://www.linkedin.com/in/noorhaddadcs), [Parsia Zahedimazandarani](https://www.linkedin.com/in/parsia-zahedi-bb49402b6/), and [Chuong Pham](https://www.linkedin.com/in/phchuong98/).