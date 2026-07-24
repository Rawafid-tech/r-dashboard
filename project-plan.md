# Rawafid Dashboard — Project Plan & Architecture Reference

> This file is the **single source of truth** for the frontend project structure,
> tech stack, conventions, and build order.

---

## 1. Project Overview

**Product:** Rawafid (روافد) — The Operating System for E-commerce Logistics in Egypt  
**Frontend stack:** Vite + React 19 + TypeScript + Tailwind CSS v4  
**Two apps in one codebase:**

- **Merchant Dashboard** — storefront owners manage shipments, returns, products, etc.
- **Admin Console** — platform staff manage plans, companies, users.

**Base API URL:** `https://rawafid.softizone.net`

---

## 2. Tech Stack

| Purpose              | Library                                |
| -------------------- | -------------------------------------- |
| Build tool           | Vite                                   |
| UI framework         | React 19 + TypeScript                  |
| Styling              | Tailwind CSS v4 + CSS Variables        |
| UI components        | shadcn/ui (Radix Nova) — highly customizable |
| Routing              | React Router v7                        |
| Server state         | TanStack Query (React Query) v5        |
| Client state         | Zustand                                |
| Forms                | React Hook Form + Zod                  |
| HTTP client          | Axios (with interceptors)              |
| i18n                 | react-i18next + i18next                |
| Data tables          | TanStack Table v8                      |
| Toast notifications  | Sonner                                 |
| Icons                | Lucide React                           |
| Fonts (EN)           | @fontsource-variable/inter             |
| Fonts (AR)           | @fontsource-variable/cairo             |
| Class merging        | clsx + tailwind-merge                  |

---

## 3. Folder Structure

```
src/
├── app/                          # App shell & routing
│   ├── App.tsx                   # Root component (providers, router)
│   ├── merchant/                 # Merchant app routes & layout
│   │   ├── MerchantLayout.tsx
│   │   └── routes.tsx
│   ├── admin/                    # Admin console routes & layout
│   │   ├── AdminLayout.tsx
│   │   └── routes.tsx
│   └── public/                   # Public pages (login, register, pricing)
│       └── routes.tsx
│
├── features/                     # Feature modules (domain logic)
│   ├── auth/                     # Authentication
│   │   ├── api/                  # API calls (login, register, refresh...)
│   │   ├── hooks/                # useAuth, useSession
│   │   ├── components/           # LoginForm, RegisterForm
│   │   ├── stores/               # Auth state (Zustand)
│   │   └── types.ts
│   │
│   ├── account/                  # Profile & user settings
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/           # ProfileForm, PasswordForm, SettingsForm
│   │   └── types.ts
│   │
│   ├── company/                  # Company management
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── subscription/             # Plans & subscription
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/           # PricingTable, PlanCard, SubscriptionDetails
│   │   └── types.ts
│   │
│   ├── shipments/                # Core: Shipment management
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── returns/                  # Returns management
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── products/                 # Products management
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── wallet/                   # Wallet & transactions
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── locations/                # Sender locations
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── integrations/             # Store & courier integrations
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── shipping-boxes/           # Shipping boxes
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── shipping-rates/           # Manual shipping rates
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   ├── dashboard/                # Dashboard & analytics
│   │   ├── hooks/
│   │   ├── components/
│   │   └── types.ts
│   │
│   └── admin/                    # Admin-only features
│       ├── plans/                # Plan CRUD
│       │   ├── api/
│       │   ├── hooks/
│       │   ├── components/
│       │   └── types.ts
│       ├── companies/            # Companies directory
│       │   ├── api/
│       │   ├── hooks/
│       │   ├── components/
│       │   └── types.ts
│       └── users/                # Users directory & moderation
│           ├── api/
│           ├── hooks/
│           ├── components/
│           └── types.ts
│
├── shared/                       # Shared across all features
│   ├── api/                      # API client setup
│   │   ├── client.ts             # Axios instance + token refresh interceptor
│   │   ├── error-handler.ts      # RFC 9457 error parsing
│   │   └── types.ts              # PaginatedResponse<T>, ApiError
│   │
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # shadcn/ui primitives (Button, Input, Label...)
│   │   ├── layout/               # Sidebar, Topbar, PageHeader, PageShell
│   │   ├── data-display/         # DataTable, StatusBadge, EmptyState
│   │   └── feedback/             # Toast, LoadingSpinner, ErrorBoundary
│   │
│   ├── hooks/                    # Shared hooks
│   │   ├── use-local-storage.ts
│   │   ├── use-debounce.ts
│   │   └── use-pagination.ts
│   │
│   ├── lib/                      # Utilities
│   │   ├── constants.ts          # Enums, status maps, config
│   │   ├── formatters.ts         # Date, currency, phone formatting
│   │   ├── validators.ts         # Shared Zod schemas
│   │   └── cn.ts                 # Tailwind class merge utility
│   │
│   └── types/                    # Global types
│       ├── api.ts                # Shared API response types
│       └── enums.ts              # All backend enums
│
├── i18n/                         # Internationalization
│   ├── config.ts                 # i18next setup
│   └── locales/
│       ├── ar/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── shipments.json
│       │   ├── returns.json
│       │   ├── products.json
│       │   ├── settings.json
│       │   └── admin.json
│       └── en/
│           ├── common.json
│           ├── auth.json
│           ├── shipments.json
│           ├── returns.json
│           ├── products.json
│           ├── settings.json
│           └── admin.json
│
├── styles/                       # Global styles
│   ├── design-system.css         # CSS variables from design handoff
│   └── global.css                # Tailwind directives + base styles
│
├── assets/                       # Static assets
│   ├── main-logo-light.webp
│   └── main-logo-dark.webp
│
├── stores/                       # Global Zustand stores
│   ├── auth.store.ts             # Auth tokens & user state
│   ├── theme.store.ts            # Light/Dark theme
│   └── locale.store.ts           # AR/EN locale
│
└── main.tsx                      # Entry point
```

---

## 4. Architecture Decisions

### Feature-based modules

Each feature is self-contained with its own `api/`, `hooks/`, `components/`, and `types.ts`.
This means when the backend delivers a new module (e.g., shipments), we open
`features/shipments/` and build everything there without touching other features.

### Two apps, one codebase

Merchant and Admin share the same design system, API client, and shared components.
They are separated at the **routing level** — different layouts, different route trees,
different auth tokens. A merchant token never works on admin routes and vice versa.

### API client with automatic token refresh

A single Axios instance with interceptors handles:
- Adding `Authorization: Bearer <token>` to every request
- Adding `Accept-Language: ar|en` header based on current locale
- On `401`: attempting one refresh, then redirecting to login on failure
- Parsing RFC 9457 error responses into typed error objects

### RTL-first CSS

Arabic is the default locale. Use CSS logical properties everywhere:
- `padding-inline-start` instead of `padding-left`
- `margin-inline-end` instead of `margin-right`
- `inset-inline-start` instead of `left`

### Theme system

Theme is stored in `localStorage` under key `rawafid-theme`.
Applied via `data-theme="light|dark"` on the `<html>` element.
Falls back to `prefers-color-scheme` when no stored choice exists.

---

## 5. Backend API Status

### Ready now (build frontend for these first)

| Module                | Endpoints                              |
| --------------------- | -------------------------------------- |
| Auth                  | register, login, refresh, logout       |
| User profile          | GET/PUT /api/auth/me                   |
| User settings         | GET/PUT /api/auth/me/settings          |
| Password change       | POST /api/auth/me/password             |
| Company               | GET/PUT /api/company                   |
| Subscription          | GET /api/subscription                  |
| Public plans          | GET /api/public/plans                  |
| Admin auth            | login, refresh, logout, me             |
| Admin plans           | full CRUD + archive/activate           |
| Admin companies       | list + detail + assign subscription    |
| Admin users           | list + detail + moderation             |

### Not ready yet (don't build frontend until backend delivers)

- Shipments (core domain — coming next)
- Returns, Products, Inventory
- Wallet & transactions
- Store integrations (Shopify, etc.)
- Courier integrations (Bosta, etc.)
- Shipping boxes, Manual shipping rates
- Notifications (SMS/WhatsApp)
- Analytics & reporting
- Logo upload, Email/phone verification
- Password reset, Team management

---

## 6. Build Order (page by page)

### Phase 1: Foundation (current)
- [x] Project setup (Vite + deps + folder structure)
- [x] Design system CSS + Tailwind config
- [x] API client + error handler
- [x] Theme provider + locale provider
- [x] shadcn/ui setup + core shared components (Button, Input, Label, Field...)
- [ ] Login page (next)

### Phase 2: Auth pages
- [ ] Login page (merchant)
- [ ] Register page (merchant)
- [ ] Login page (admin)
- [ ] Token refresh + protected routes

### Phase 3: Merchant shell
- [ ] Merchant layout (sidebar + topbar)
- [ ] Dashboard page (placeholder)

### Phase 4: Account & Settings
- [ ] Profile page (view + edit)
- [ ] Password change
- [ ] System settings (theme, locale, timezone, date format)

### Phase 5: Company
- [ ] Company profile page (view + edit for OWNER)

### Phase 6: Subscription
- [ ] Current plan view
- [ ] Public pricing page

### Phase 7: Admin Console
- [ ] Admin layout
- [ ] Plans management (CRUD)
- [ ] Companies directory
- [ ] Users directory + moderation

### Phase 8+: As backend delivers
- [ ] Shipments module
- [ ] Returns module
- [ ] Products & inventory
- [ ] Wallet
- [ ] Integrations
- [ ] And so on...

---

## 7. Conventions

### Naming
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `use-kebab-case.ts` → exports `useHookName`
- Stores: `kebab-case.store.ts`
- Types: `PascalCase` for interfaces/types

### Imports
- Use `@/` path alias for `src/`
- Feature imports: `@/features/auth/...`
- Shared imports: `@/shared/...`

### API functions
- Named as `verbNoun`: `getUser`, `createShipment`, `updateCompany`
- Return typed promises
- Use the shared API client

### State management
- **Server state** (API data): TanStack Query — never duplicate in Zustand
- **Client state** (UI/auth): Zustand — only for things not from the server

---

## 8. Key Design System Tokens

See `design-system-handoff.md` for the full reference. Quick summary:

- **Primary:** `#2563EB` (blue)
- **Accent:** `#22C55E` (green — success/delivered)
- **Error:** `#EF4444` (red — failed)
- **Warning:** `#F59E0B` (amber — pending)
- **Fonts:** Inter (EN) + Cairo (AR)
- **Radius:** 8–16px for operational UI
- **Spacing:** 8pt grid
- **Theme key:** `rawafid-theme` in localStorage
