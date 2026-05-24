# CLAUDE.md — Supply & Demand Monitoring Platform

> Last updated: 2026-04-28
> Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Supabase · OpenRouter

---

## 1. Project Overview

A web-based platform for tracking product **availability (supply)** and user **interest (demand)** across locations in Nigeria. This is **not** an e-commerce system — no payments, no carts. The goal is location-aware, data-driven insights on product pricing and availability.

### User Roles

| Role | Description |
|------|-------------|
| `user` | Browse products, search by location, view supply/demand |
| `vendor` | Submit supply data, manage product listings, report prices |
| `admin` | Full platform control — manage vendors, users, pricing rules, flags |

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| State | Zustand (scoped, sliced stores) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| AI | OpenRouter API (model-agnostic) |
| Package Manager | **pnpm only** — never npm or yarn |

---

## 3. Design Philosophy

### Visual Direction: **Utilitarian Clarity**

This is a data tool. The UI should feel like a well-designed operations dashboard — not a consumer app, not a startup landing page.

**Rules:**
- **No gratuitous gradients.** Use them only for data visualisation (charts, heatmaps) or deliberate accent moments — never as background wallpaper.
- **Typography is structure.** Use a single, characterful monospace or geometric sans-serif for data labels. Pair with a refined humanist for body text. No Inter. No Roboto.
- **Density is intentional.** Data-heavy views should feel dense but never cluttered. Use consistent 4px/8px grid spacing.
- **Color carries meaning.** Green = available/supply. Amber = low/warning. Red = unavailable/flagged. Blue = demand/user activity. Never use these colors decoratively.
- **Motion is informational.** Animate loading states, transitions between data views, and number countups. No decorative animations.
- **Dark mode first.** The platform is used in operations contexts. Provide light mode as an option.

### Anti-patterns (banned)
- Purple/pink gradient hero backgrounds
- Glassmorphism cards with heavy blur on every panel
- Skeleton loaders that pulse for more than 1.5s
- Borders on every component — use spacing and background contrast instead
- Inline `style={{}}` for anything achievable in Tailwind

---

## 4. Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no shell)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected route group (with shell)
│   │   ├── layout.tsx            # Dashboard shell (sidebar + topbar)
│   │   ├── page.tsx              # Root → redirects by role
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Supply vs demand overview
│   │   ├── vendor/               # Vendor-only routes
│   │   │   ├── listings/
│   │   │   │   └── page.tsx
│   │   │   └── submit/
│   │   │       └── page.tsx
│   │   └── admin/                # Admin-only routes
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── vendors/
│   │       │   └── page.tsx
│   │       ├── users/
│   │       │   └── page.tsx
│   │       ├── pricing/
│   │       │   └── page.tsx
│   │       └── flags/
│   │           └── page.tsx
│   ├── api/
│   │   ├── products/
│   │   │   └── route.ts
│   │   ├── supply/
│   │   │   └── route.ts
│   │   ├── demand/
│   │   │   └── route.ts
│   │   ├── prices/
│   │   │   └── route.ts
│   │   └── ai/
│   │       └── route.ts          # OpenRouter proxy
│   ├── layout.tsx                # Root layout (providers, fonts)
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── ui/                       # Base primitives (no business logic)
│   │   ├── button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── badge/
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── input/
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   ├── select/
│   │   │   ├── Select.tsx
│   │   │   └── index.ts
│   │   ├── table/
│   │   │   ├── Table.tsx
│   │   │   ├── TableRow.tsx
│   │   │   ├── TableCell.tsx
│   │   │   └── index.ts
│   │   ├── card/
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── modal/
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── tooltip/
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts
│   │   ├── skeleton/
│   │   │   ├── Skeleton.tsx
│   │   │   └── index.ts
│   │   └── error-state/          # THE canonical error component
│   │       ├── ErrorState.tsx    # Always use this for errors
│   │       └── index.ts
│   │
│   ├── layout/                   # Shell and structural components
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── MobileNav.tsx
│   │   └── RoleGuard.tsx         # Wraps protected sections
│   │
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── SearchResults.tsx
│   │   └── LocationSelector.tsx
│   │
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── SupplyIndicator.tsx
│   │   ├── DemandIndicator.tsx
│   │   └── PriceBadge.tsx
│   │
│   ├── dashboard/
│   │   ├── SupplyDemandChart.tsx
│   │   ├── LocationHeatmap.tsx
│   │   ├── MetricCard.tsx
│   │   ├── TrendSparkline.tsx
│   │   └── PriceFairnessGauge.tsx
│   │
│   ├── vendor/
│   │   ├── SupplySubmitForm.tsx
│   │   ├── ListingTable.tsx
│   │   └── PriceReportForm.tsx
│   │
│   └── admin/
│       ├── VendorApprovalRow.tsx
│       ├── PriceRuleEditor.tsx
│       ├── FlaggedItemRow.tsx
│       └── UserRoleSelect.tsx
│
├── hooks/
│   ├── useProducts.ts            # Product search + fetch
│   ├── useSupply.ts              # Supply data per location
│   ├── useDemand.ts              # Demand signals
│   ├── usePrices.ts              # Price fetch + flag logic
│   ├── useLocation.ts            # Browser geolocation + manual
│   ├── useRole.ts                # Current user role helper
│   ├── useDebounce.ts
│   ├── useIntersectionObserver.ts
│   └── useOpenRouter.ts          # AI query hook
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client (RSC/route handlers)
│   │   └── admin.ts              # Service-role client (admin ops only)
│   ├── openrouter/
│   │   ├── client.ts
│   │   └── models.ts             # Supported model list
│   ├── price/
│   │   ├── calculate.ts          # Average, median, outlier detection
│   │   └── validate.ts           # Min/max range checks
│   ├── demand/
│   │   └── tracker.ts            # Search event logging
│   ├── utils/
│   │   ├── cn.ts                 # clsx + tailwind-merge
│   │   ├── format.ts             # Currency (NGN), numbers, dates
│   │   ├── logger.ts             # Structured console logger
│   │   └── errors.ts             # Error normaliser
│   └── constants/
│       ├── roles.ts
│       ├── locations.ts          # Nigerian states/LGAs seed
│       └── categories.ts         # Product categories
│
├── providers/
│   ├── index.tsx                 # Composes all providers
│   ├── AuthProvider.tsx          # Supabase session sync
│   ├── ThemeProvider.tsx         # Dark/light mode
│   └── QueryProvider.tsx         # (if using React Query alongside Zustand)
│
├── store/
│   ├── index.ts                  # Re-exports all stores
│   ├── auth.store.ts             # User session + role
│   ├── search.store.ts           # Search query, filters, results
│   ├── ui.store.ts               # Sidebar open, modal state, theme
│   └── vendor.store.ts           # Vendor-specific draft state
│
└── types/
    ├── database.types.ts         # Auto-generated from Supabase
    ├── api.types.ts              # Request/response shapes
    ├── product.types.ts
    ├── supply.types.ts
    ├── demand.types.ts
    ├── price.types.ts
    ├── user.types.ts
    └── vendor.types.ts
```

---

## 5. Architecture Rules

### Server vs Client Components
- **Default to Server Components.** Only add `'use client'` when you need: hooks, browser APIs, event handlers, or Zustand.
- **Never import Zustand stores in Server Components.** Pass data via props or fetch in layout/page.
- **Data fetching lives in Server Components or Route Handlers.** Hooks are for client-side reactivity only.

### State Management (Zustand)
- One store per domain. No god stores.
- Always use slices with explicit actions — no mutating state directly outside of actions.
- Stores are **never** for server data (that's React cache / Route Handler response). Stores hold UI state and user session.
- Use `subscribeWithSelector` middleware when subscribing to partial state.

```ts
// ✅ Correct slice pattern
interface SearchStore {
  query: string
  locationId: string | null
  setQuery: (q: string) => void
  setLocation: (id: string) => void
  reset: () => void
}
```

### API Routes
- All Supabase writes go through `/api/` route handlers — never call Supabase mutations directly from the client.
- Route handlers validate input with Zod before touching the database.
- OpenRouter calls are **always** proxied through `/api/ai/` — never expose the API key to the client.

### Error Handling
- **Always use `<ErrorState />`** for rendering errors in UI. Never roll a one-off error div.
- In Server Components, use `error.tsx` boundary files per route segment.
- In async functions, use the `normaliseError` utility from `lib/utils/errors.ts`.
- Log errors with `logger.error()` — never raw `console.error()`.

---

## 6. Database Schema (Supabase / PostgreSQL)

```sql
-- Core tables (simplified)

users          (id, email, role: 'user'|'vendor'|'admin', location_id, created_at)
locations      (id, name, state, lga, lat, lng)
categories     (id, name, slug)
products       (id, name, slug, category_id, unit, created_at)
supply_entries (id, product_id, vendor_id, location_id, quantity, price, submitted_at)
price_flags    (id, supply_entry_id, reported_by, reason, resolved, created_at)
demand_events  (id, product_id, location_id, user_id, event_type, created_at)
price_rules    (id, product_id, location_id, min_price, max_price, updated_by, updated_at)
```

### Price Logic
- **Average price**: Trim top/bottom 10% of submissions before averaging.
- **Outlier flag**: Any submission outside `price_rules.min_price` / `max_price` is auto-flagged.
- **Demand score**: Count of `demand_events` per `(product_id, location_id)` in last 7 days.

---

## 7. Logging Convention

Use `lib/utils/logger.ts` everywhere. Never raw `console.*` except inside the logger itself.

```ts
// Structure: [MODULE] message { context }
logger.info('[Search] Query executed', { query, locationId, resultCount })
logger.warn('[Price] Outlier detected', { entryId, price, range })
logger.error('[API] Supabase write failed', { table, error })
logger.debug('[Store] Auth state changed', { role, userId })
```

Log levels: `debug` (dev only) · `info` · `warn` · `error`

---

## 8. Role & Access Control

### Middleware (`middleware.ts`)
- Reads session from Supabase cookie.
- Redirects unauthenticated users to `/login`.
- Redirects users by role on root `/` → `/dashboard`, `/vendor/listings`, `/admin`.

### RoleGuard Component
Wrap role-restricted UI sections:

```tsx
<RoleGuard allow={['admin', 'vendor']}>
  <SupplySubmitForm />
</RoleGuard>
```

### Admin Abilities (superset of vendor)
- Approve/reject vendor accounts
- Edit price rules (min/max per product per location)
- Resolve price flags
- Manage user roles
- Submit supply data as any vendor

---

## 9. OpenRouter Integration

Route: `POST /api/ai`

Use cases:
- Demand trend summarisation
- Price anomaly explanation
- Location-based supply gap insights (admin view)

```ts
// lib/openrouter/client.ts
export async function openRouterChat(messages: Message[], model?: string) {
  // Always server-side. API key from process.env.OPENROUTER_API_KEY
}
```

Default model: `google/gemma-3-27b-it` or similar cost-effective model. Make model configurable via env `OPENROUTER_DEFAULT_MODEL`.

---

## 10. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server only. Never expose.

# OpenRouter
OPENROUTER_API_KEY=               # Server only. Never expose.
OPENROUTER_DEFAULT_MODEL=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEFAULT_LOCATION=     # Default LGA/state slug
```

---

## 11. Performance Rules

- Use `React.memo` only when profiling confirms unnecessary re-renders — not preemptively.
- Paginate all list queries. Default page size: `20`.
- Use `next/dynamic` for heavy chart components (SupplyDemandChart, LocationHeatmap).
- Demand event logging is **fire-and-forget** — never await it in the search critical path.
- Supabase queries must always include explicit `select()` columns — never `select('*')` in production paths.
- Images use `next/image` always. No raw `<img>` tags.

---

## 12. Commands

```bash
pnpm dev               # Start dev server
pnpm build             # Production build
pnpm lint              # ESLint
pnpm type-check        # tsc --noEmit
pnpm db:types          # Regenerate Supabase types → types/database.types.ts
```

> **pnpm is the only allowed package manager.** No `npm install`, no `yarn add`. CI will fail otherwise.

---

## 13. Key Conventions Summary

| Rule | Detail |
|------|--------|
| Package manager | `pnpm` only |
| Error UI | Always `<ErrorState />` — never ad-hoc error divs |
| Logging | Always `logger.*` — never raw `console.*` |
| Mutations | Always via `/api/` route handlers |
| AI calls | Always via `/api/ai/` — key never on client |
| Styling | Tailwind classes only — no inline `style={{}}` |
| Gradients | Only for data viz or deliberate accent — never backgrounds |
| Stores | One per domain, sliced, no god stores |
| Server Components | Default — add `'use client'` only when necessary |
| Select queries | Always explicit columns — no `select('*')` |