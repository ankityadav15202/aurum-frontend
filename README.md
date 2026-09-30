# Aurum — Frontend

Aurum is a personal expense tracker: log expenses and income, set monthly budgets per category, read monthly reports, and ask an AI advisor questions about your own spending.

This repository is the **React single-page app**. It talks to the Aurum backend (Node.js + Express + MongoDB, with Google Gemini for AI features), which lives in a separate `backend/` project and must be running for the app to work.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How the app works](#how-the-app-works)
- [Design system](#design-system)
- [Backend API](#backend-api)
- [Security notes](#security-notes)
- [Deployment](#deployment)
- [Known issues](#known-issues)

---

## Features

| Area | What it does |
|---|---|
| **Dashboard** | Month-to-date spending, income, net savings and transaction count; 7-day spending chart; spending by category; budget progress; AI-generated insights; recent transactions. |
| **Transactions** | Add, edit and delete expenses and income across 10 categories. Recurring entries (daily, weekly, monthly, yearly), notes, search, category and month filters, sort by date or amount, pagination. "Suggest category" asks the AI to pick a category from the description. |
| **Budgets** | A monthly limit per category, with status (on track / near limit at 80% / over budget) and a budget-vs-spent chart. |
| **Reports** | Generate a monthly summary (income, expenses, savings rate, spending by category, AI-written summary) and export it as PDF or CSV. |
| **Advisor** | Chat with an AI advisor that is given your transactions and budgets. Free accounts get **2 questions**; admins can grant unlimited access. Chat history is kept in the browser only. |
| **Feedback** | Submit feature requests, bug reports and suggestions, and track their status. |
| **Settings** | Profile name, password change, currency (USD, EUR, GBP, JPY, INR, KRW, AUD, CAD), appearance (light / dark / system), and delete all transactions. |
| **Onboarding** | A 5-step setup after registration: currency, monthly income, first budget, first transaction. Can be skipped. |
| **Admin** | "Users & access" page for admins: see every user's advisor usage and grant or revoke unlimited access. |
| **Accounts** | Register, log in, email verification, forgot and reset password. |
| **Public pages** | Landing page, About, Contact form, Privacy Policy, Terms. |
| **PWA** | Installable (web manifest) with a service worker and an offline page. |

---

## Tech stack

| Concern | Library |
|---|---|
| UI | React 18 |
| Build / dev server | Vite 5 |
| Routing | React Router 6 |
| Server state and caching | TanStack Query 5 |
| HTTP | Axios |
| Charts | Recharts |
| Icons | lucide-react |
| Toasts | react-hot-toast |
| Markdown (advisor replies) | react-markdown + remark-gfm |
| Fonts | Geist, Geist Mono, Source Serif 4 (Google Fonts) |

Styling is plain CSS in a single file, `src/index.css`, built on CSS custom properties. There is no CSS framework.

---

## Getting started

### Prerequisites

- **Node.js 18 or newer** and npm.
- The **Aurum backend** running locally (default `http://localhost:5000`) or deployed somewhere you can reach. The backend needs MongoDB and a Gemini API key; see the backend's own setup instructions.

### 1. Install

```bash
git clone https://github.com/ankityadav15202/aurum-frontend.git
cd aurum-frontend
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Then set the values in `.env`. See [Environment variables](#environment-variables). For local development against a backend on port 5000, this is enough:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Run

```bash
npm run dev
```

Open http://localhost:5173. Requests to `/api/*` are proxied to `VITE_BACKEND_URL`, so there are no CORS issues in development.

### 4. Create an account

Register through the app, then open the verification link sent to your email before logging in. Admin access is configured on the backend; see the backend's own documentation.

---

## Environment variables

Vite only exposes variables prefixed with `VITE_`. Values are read at **build time**, so rebuild after changing them.

| Variable | Used by | Default | Purpose |
|---|---|---|---|
| `VITE_BACKEND_URL` | `vite.config.js` (dev server and `vite preview` only) | `http://localhost:5000` | Where the dev proxy forwards `/api/*` requests. Has no effect on a production build. |
| `VITE_API_BASE_URL` | `src/utils/api.js` (baked into the build) | `/api` | Base URL for every API request. Leave it as `/api` locally. In production, set it to the full backend URL (for example `https://api.example.com/api`) unless the backend is served from the same domain under `/api`. |

`.env` is git-ignored. Never commit real values.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server on port 5173 with hot reload and the `/api` proxy. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally, using the same `/api` proxy, to check a production build. |

There are no automated tests or lint scripts yet.

> The build prints a "chunks larger than 500 kB" warning. This is expected: the app ships as one bundle, and Recharts and react-markdown account for most of it. Route-level code splitting would remove the warning.

---

## Project structure

```
.
├── index.html               # HTML shell: fonts, meta tags, theme bootstrap script, service worker registration
├── public/
│   ├── favicon.svg
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker
│   └── offline.html         # Shown by the service worker when offline
├── src/
│   ├── main.jsx             # Entry: QueryClient, Router, ThemeProvider, AuthProvider, Toaster
│   ├── App.jsx              # Routes, route guards, app shell (sidebar / mobile nav), public layout
│   ├── index.css            # Design tokens and every style in the app
│   ├── context/
│   │   ├── AuthContext.jsx  # Logged-in user, login / register / logout / updateUser
│   │   └── ThemeContext.jsx # Light / dark / system theme, useChartColors()
│   ├── components/
│   │   ├── AddExpenseModal.jsx
│   │   └── ui/
│   │       ├── index.jsx      # Logo, PageHeader, StatStrip, CategoryIcon, Badge, EmptyState,
│   │       │                  # Modal, ConfirmDialog, ThemeToggle, ChartTooltip, PasswordInput
│   │       └── DatePicker.jsx # DatePicker and MonthPicker
│   ├── pages/               # One file per route (see below)
│   └── utils/
│       ├── api.js           # Axios instance: base URL, auth header, 401 handling
│       └── constants.js     # Categories, currencies, money / date formatting helpers
├── vercel.json              # SPA rewrite for Vercel
└── vite.config.js           # React plugin and dev proxy
```

### Routes

| Path | Page | Access |
|---|---|---|
| `/` | Landing | Public. Logged-in users are redirected to `/dashboard`. |
| `/login`, `/register`, `/forgot-password` | Auth pages | Logged-out users only |
| `/verify-email`, `/verify-email/:token` | Email verification | Public |
| `/reset-password/:token` | Reset password | Public |
| `/onboarding` | Setup wizard | Any |
| `/dashboard`, `/transactions`, `/budgets`, `/reports`, `/ai`, `/feedback`, `/settings` | App | Logged in and onboarding completed |
| `/admin` | Users & access | Logged-in admins (others are sent to `/dashboard`) |
| `/about`, `/contact`, `/privacy-policy`, `/terms` | Info pages | Public |
| `/features` | Feature guide: a plain-language walkthrough of every feature | Public. Linked as "Guide" in the site footer, the help icon in the app sidebar, Settings and the last onboarding step (in-app links open in a new tab). |
| anything else | — | Redirects to `/` |

---

## How the app works

### Authentication

- Session handling lives in `src/context/AuthContext.jsx` (the `useAuth()` hook) and `src/utils/api.js`, which attaches the session to API requests and signs the user out if the session expires.
- `PrivateRoute` in `App.jsx` sends logged-out users to `/login` and users who haven't finished onboarding to `/onboarding`.
- Route guards in the frontend only control what is shown. All access control, including admin-only features, is enforced by the backend.

### Data fetching

All server data goes through TanStack Query. Queries use `staleTime: 0`, don't refetch on window focus, and retry once.

| Query key | Loaded by |
|---|---|
| `['dashboard', month]` | Dashboard (stats, recent transactions, budgets) |
| `['ai-insights']` | Dashboard insights |
| `['expenses', filters]` | Transactions |
| `['budgets', month]` | Budgets |
| `['reports']` | Reports |
| `['feedback']` | Feedback |
| `['admin-users']` | Admin |

After a change, pages invalidate every key that depends on it. For example, adding a transaction invalidates `expenses`, `dashboard`, `budgets` and `reports`. The refresh button in the sidebar (or mobile header) re-fetches the current page's queries. Logging out clears the whole query cache.

### Browser storage

Besides the login session, the app keeps two preferences in `localStorage`:

| Key | Contents |
|---|---|
| `aurum_theme` | `system`, `light` or `dark` |
| `aurum_ai_chat` | Advisor conversation (stays in the browser; never stored on the server) |

### Theme

- The theme is `system` by default and follows the operating system. Users can choose Light or Dark in **Settings → Appearance**, in the sidebar footer, or from the sun/moon button in headers.
- A small inline script in `index.html` applies the saved theme before React loads, so there is no flash of the wrong theme.
- `ThemeContext` sets `data-theme="light|dark"` on `<html>`; all colors switch through CSS variables.

### Dates

Dates are stored and sent as local-time strings: `YYYY-MM-DD` for days, `YYYY-MM` for months. Use `toISODate()` and `toISOMonth()` from `utils/constants.js` to build them. Avoid `new Date().toISOString()`: it is UTC and gives the wrong day for users east of UTC shortly after midnight.

---

## Design system

The look is deliberately restrained: warm neutral surfaces, near-black text, hairline borders, one muted brass accent, and no gradients or glow effects. Keep new UI consistent with it.

### Tokens

Every color, font and radius is a CSS variable defined at the top of `src/index.css`, with a light set and a dark set (`[data-theme="dark"]`). **Never hard-code a hex color in a component.** Use a token.

| Token | Use |
|---|---|
| `--bg`, `--surface`, `--surface-2`, `--surface-3` | Page background, cards, subtle fills and hover states |
| `--border`, `--border-strong` | Hairlines, input borders |
| `--text`, `--text-2`, `--text-3` | Primary, secondary and muted text (all meet WCAG AA contrast) |
| `--primary`, `--primary-fg` | Primary buttons (near-black in light mode, near-white in dark mode) |
| `--accent`, `--accent-soft`, `--accent-border` | Brass accent: logo, focus ring, active nav marker, selected options. Use sparingly. |
| `--positive`, `--negative`, `--warning`, `--info` (plus `-soft`) | Status only: income, errors and over-budget, warnings, information |
| `--cat-<id>` | Chart color for each category |

Typography:

- **Geist** for all UI.
- **Source Serif 4** only for marketing and info-page headlines.
- **Geist Mono** only for code in advisor replies.

Money uses the `.num` class (tabular figures) so digits line up. Labels are sentence case; there are no uppercase letter-spaced labels.

### Reusable pieces

- **CSS classes:**
  - `.btn` with `.btn-primary | .btn-secondary | .btn-ghost | .btn-danger | .btn-danger-outline`, plus `.btn-sm`, `.btn-lg`, `.btn-block`
  - `.icon-btn`
  - `.card`, `.card-header`, `.card-title`
  - `.field`, `.label`, `.input`, `.field-hint`
  - `.option` (selectable tile)
  - `.segmented` (tabs or toggles)
  - `.badge` with tone modifiers
  - `.callout`
  - `.list` and `.list-row`
  - `.progress`
  - `.table`
  - `.empty-state`
- **Components** (`src/components/ui`): `PageHeader`, `StatStrip`, `CategoryIcon`, `Badge`, `EmptyState`, `Modal`, `ConfirmDialog`, `ThemeToggle`, `PasswordInput`, `ChartTooltip`, `DatePicker`, `MonthPicker`, `Logo`.
- **Icons:** from `lucide-react`, usually at `size={16}`–`17`. Don't use emoji as icons.

### Charts

Recharts writes colors into SVG attributes, which can't read CSS variables. Get resolved colors from the `useChartColors()` hook (`colors.text3`, `colors.grid`, `colors.accent`, `colors.cat.food`, …), which updates when the theme changes. Use `<ChartTooltip>` for tooltips.

The eight expense-category colors are a fixed, colorblind-checked order. Don't reorder them or add new hues; always pair them with text labels.

### Adding a new page

1. Create `src/pages/MyPage.jsx`. Start with `<PageHeader title=… description=… actions=…/>` and build the body from cards and the classes above.
2. Add a route in `App.jsx`, wrapped in `<PrivateRoute><Layout>…</Layout></PrivateRoute>` if it needs a login.
3. Add it to the `NAV` array in `App.jsx` with a lucide icon, a `label` and a `short` label for the mobile bottom bar.
4. Fetch data with `useQuery` and a new query key. Invalidate related keys after mutations.
5. Check the page in light and dark mode and at phone width (about 390px).

---

## Backend API

All requests go through the Axios client in `src/utils/api.js`, relative to `VITE_API_BASE_URL` (`/api` by default). The frontend uses the backend's account, expense, budget, AI, report, feedback and contact APIs. The backend documentation is the reference for endpoints and payloads; the calls each page makes are in its file under `src/pages/`.

Usage limits, such as the number of free advisor questions, are enforced by the backend, not the frontend.

### Categories

Category ids are shared with the backend and must not be renamed: `food`, `transport`, `shopping`, `health`, `bills`, `entertainment`, `travel`, `education`, `income`, `other`. Labels, short labels and icons live in `src/utils/constants.js`.

---

## Deployment

The app is set up for **Vercel**. `vercel.json` rewrites every path to `index.html` so client-side routes work on refresh.

1. Import the repository in Vercel. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
2. Set the environment variable **`VITE_API_BASE_URL`** to your deployed backend, for example `https://your-backend.example.com/api`. On Vercel, `/api` isn't proxied, so the default `/api` won't reach the backend.
3. On the backend, add the Vercel domain to `CLIENT_URL` so CORS allows it. It accepts a comma-separated list.
4. Deploy. Changing an environment variable requires a redeploy, because Vite bakes it into the build.

Any static host works the same way, as long as it serves `index.html` for unknown paths.

---

## Security notes

- Never commit `.env` files, API keys, database URLs or production backend addresses. `.env` is git-ignored; put real values in your hosting provider's environment settings.
- Everything under `VITE_` is compiled into the public JavaScript bundle and visible to anyone. Never put secrets in `VITE_` variables. Secrets belong on the backend only.
- Treat the frontend as untrusted. Permissions, limits and data validation must be enforced on the backend.
- Report security issues privately to the maintainer rather than in a public issue.

---

## Known issues

- **The Privacy Policy promises account deletion** ("Settings → Account"). The app can currently delete all transactions, but not the account itself.
- **Onboarding uses UTC dates** (`toISOString()`) for the first income and transaction. Users east of UTC who complete onboarding shortly after midnight get the previous day. Switch these to `toISODate()` / `toISOMonth()`.
- **Single bundle** (~960 kB minified, ~280 kB gzipped). Lazy-loading routes with `React.lazy` would improve first load.
