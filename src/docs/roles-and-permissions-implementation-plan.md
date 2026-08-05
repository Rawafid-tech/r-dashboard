# Roles & Permissions — Implementation Plan

> **Status:** Implemented in the merchant dashboard (OWNER-only Roles screen).  
> **Source of truth (API):** [`Roles-and-permissions.md`](./Roles-and-permissions.md) (corrected 2026-08-04, live on staging 2026-08-05).  
> **Staging base:** `https://rawafid.softizone.net`  
> **Scope of this drop:** Merchant OWNER can CRUD named **roles** (permission bundles) and browse the permission catalog. Roles are **not assigned to users yet** and do **not** change access yet.

---

## 0. Executive summary

| Surface | Build now? | Why |
|---|---|---|
| **Merchant Dashboard** (الداشبورد العادية) | **Yes** | New screen **الأدوار (Roles)** under الإدارة. OWNER-only. List + create/edit modal with permission tree + delete. |
| **Admin Console** (لوحة الإدارة) | **No** | Platform admin tokens get `403` on `/api/permissions` and `/api/roles`. Out of scope for this drop. |

**Hard product rules (must not violate in UI copy or code):**

1. A role does nothing until assignment ships — no copy that says a role currently restricts anyone.
2. Do not build “assign role to user” / per-user overrides / staff-user create in this drop.
3. Do not gate tenant screens from a role’s permission contents yet — backend still uses coarse `OWNER` vs `AGENT`.
4. Hide the Roles menu for non-owners (`AGENT`) — do not let them hit a `403`.
5. One role per user conceptually (future): role *is* the type — no separate “user type” + “role name” columns when assignment lands.

---

## 1. What the API gives us (this drop)

### 1.1 Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/permissions` | Permission catalog tree (roots → nested `children`) |
| `GET` | `/api/roles?search=&page=&size=&sort=&direction=` | Paged roles list |
| `GET` | `/api/roles/{id}` | Role detail (`permissionIds` + `permissionCodes`) |
| `POST` | `/api/roles` | Create role |
| `PUT` | `/api/roles/{id}` | Replace role (name, description, full permission set) |
| `DELETE` | `/api/roles/{id}` | Delete role (`204`, or `409` if in use) |

### 1.2 Authorization matrix

| Caller | Catalog | Roles CRUD |
|---|---|---|
| Tenant `OWNER` | ✅ | ✅ |
| Tenant `AGENT` | `403` | `403` |
| Platform admin | `403` | `403` |
| No token | `401` | `401` |

### 1.3 Critical server behaviors to design around

| Behavior | UI implication |
|---|---|
| **Closure rule** — ticking an ACTION implies ancestors (PAGE chain) | Auto-tick parents client-side; grey parent while any child is on; **re-hydrate checkboxes from response `permissionIds`** after save (response may add ids). |
| Untick PAGE → untick subtree | Client-side only; empty PAGE selection is valid. |
| `PUT` replaces permissions wholesale | Always send full `permissionIds` array (use `[]`, never omit). |
| Omitting / blank `description` stores `null` | Always send current description on edit or you wipe it. |
| `userCount` always `0` today | Show column; do not invent fake counts; no “in use” UX beyond delete `409` wiring. |
| `OWNER` / `AGENT` never in list; by-id → `404` | Never show seeded platform roles; treat foreign/seeded ids as “gone”. |
| Permission `id` unstable across envs | Never hardcode ids; cache catalog keyed by env; on `auth.unknownPermission` re-fetch catalog. |
| Labels already localized via `Accept-Language` | Render `label` as-is; do not maintain a parallel permission label map. |
| Catalog order is display order | Preserve array order; do not sort client-side. |
| Arbitrary tree depth | Recursive tree component — do not assume 2 levels. |

### 1.4 Error codes to wire

| Status | Code | UI |
|---|---|---|
| `404` | `auth.roleNotFound` | Toast / redirect — treat as gone |
| `409` | `auth.roleNameTaken` | Keep modal open; mark `name` field |
| `400` | `auth.unknownPermission` | Re-fetch catalog; toast; do not blind-retry same ids |
| `409` | `auth.roleInUse` | Block delete; explain users must be moved first (copy ready even though untriggerable today) |
| `400` | field validation | Map `errors[]` to RHF fields (`name`, `description`, `permissionIds`) |

---

## 2. Merchant Dashboard — what we build now

### 2.1 Product surface

Suggested UX (from API doc §8), adapted to Rawafid merchant shell patterns:

1. **Nav:** Entry under الإدارة — **الأدوار / Roles** — visible **only when `me.role === OWNER`**.
2. **List page:** Table columns at minimum:
   - الاسم (name) + muted subtitle = `description`
   - عدد المستخدمين (`userCount`)
   - Optional: `permissionCount`, created date
   - Row actions: Edit, Delete
3. **Toolbar:** Search by name (`search` query param), page size 10 or 20, sort `CREATED_AT` / `NAME` + `ASC`/`DESC`.
4. **CTA:** «إضافة دور» opens empty create modal/drawer.
5. **Modal / dialog:**
   - `name` (required, ≤100)
   - `description` (optional textarea, ≤500)
   - Client-side search filter over the permission tree
   - Recursive checkbox tree with نوع المعاملة chip from `kind` (`PAGE` / `ACTION` → الصفحة / الإجراء)
6. **Edit:** `GET /api/roles/{id}` → fill form from `name`, `description`, `permissionIds` → submit complete payload.
7. **Delete:** Confirm dialog; handle `204` and `409 auth.roleInUse`.

### 2.2 Explicit non-goals (Merchant, this drop)

- Assign role to a user
- Per-user permission overrides (تعديل الأدوار / استعادة الأدوار)
- «لديه دور مخصص» column
- Creating staff users under the company
- Client-side route/feature gating from role permission codes/contents
- Copy that implies roles currently enforce access
- Any Admin Console Roles UI

### 2.3 Access control (client)

| Actor | Behavior |
|---|---|
| `OWNER` | See nav item, route, full CRUD |
| `AGENT` | Hide nav item; route guard → redirect (e.g. dashboard or 403 page) — never call APIs |
| Unauthenticated | Existing merchant auth guard |

Match existing pattern used for company logo / company settings (`MerchantRole.OWNER` checks). Prefer **hide** over disabled-with-403 for this menu.

---

## 3. Admin Console — what we do (and don’t)

### 3.1 Do not build

- No Roles page under `/admin`
- No calls to `/api/roles` or `/api/permissions` from admin features
- No admin nav item for tenant roles

Platform admin cannot use these endpoints (`403`). Tenant role management is a **company OWNER** concern inside the merchant app.

### 3.2 Optional future (out of scope now)

If product later wants platform visibility into company roles, that needs **new admin-scoped APIs**. Do not reuse tenant endpoints with an admin token.

### 3.3 Keep designing around (no UI yet)

When staff/user assignment lands on merchant side, admin company/user detail screens may later *display* assigned role names if admin APIs expose them — not part of this plan.

---

## 4. Target folder structure (match project conventions)

Follow feature-module layout from [`project-plan.md`](./project-plan.md). New merchant feature (not under `features/admin/`):

```
src/
├── app/merchant/
│   ├── roles-page.tsx                 # Thin page shell → RolesHome
│   └── routes.tsx                     # Add OWNER-guarded /roles route
│
├── features/roles/                    # NEW merchant feature module
│   ├── api/
│   │   ├── permissions.api.ts         # GET /api/permissions
│   │   └── roles.api.ts               # list / get / create / update / delete
│   ├── hooks/
│   │   ├── use-permissions-catalog.ts
│   │   ├── use-roles.ts               # paged list
│   │   ├── use-role.ts                # detail
│   │   ├── use-create-role.ts
│   │   ├── use-update-role.ts
│   │   └── use-delete-role.ts
│   ├── components/
│   │   ├── roles-home.tsx             # Page composition (hero + toolbar + table + modal)
│   │   ├── roles-hero.tsx
│   │   ├── roles-toolbar.tsx
│   │   ├── roles-data-table.tsx
│   │   ├── roles-empty-state.tsx
│   │   ├── roles-error-state.tsx
│   │   ├── roles-page-skeleton.tsx
│   │   ├── role-form-dialog.tsx       # Create + edit
│   │   ├── role-delete-dialog.tsx
│   │   ├── permission-tree.tsx        # Recursive tree + search filter
│   │   └── permission-kind-badge.tsx  # PAGE / ACTION chip
│   ├── lib/
│   │   ├── roles-list-params.ts       # URL search/sort/page helpers
│   │   ├── permission-tree.ts         # Closure helpers, filter, flatten, ancestor map
│   │   └── role-form-errors.ts        # Map API codes → field/toast
│   ├── schema.ts                      # Zod: name, description, permissionIds
│   ├── types.ts
│   └── index.ts                       # Public exports if needed
│
├── shared/components/layout/
│   └── merchant-nav.ts                # Add roles nav item (OWNER-gated at render)
│
├── i18n/locales/
│   ├── ar/roles.json                  # NEW namespace
│   └── en/roles.json                  # NEW namespace
│
└── docs/
    ├── Roles-and-permissions.md       # API contract (existing)
    └── roles-and-permissions-implementation-plan.md  # this file
```

**Why `features/roles/` not `features/admin/roles/`:**  
Admin console ≠ tenant OWNER. This is merchant domain, same as `company/`, `account/`, `subscription/`.

---

## 5. Types & contracts

```ts
// features/roles/types.ts (illustrative)

export type PermissionKind = "PAGE" | "ACTION";

export interface PermissionNode {
  id: string;
  code: string;
  kind: PermissionKind;
  label: string;
  children: PermissionNode[];
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  userCount: number;
  permissionCount: number;
  createdAt: string;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string | null;
  permissionIds: string[];
  permissionCodes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleUpsertPayload {
  name: string;
  description?: string | null;
  permissionIds: string[]; // required; may be []
}

export type RolesSortField = "CREATED_AT" | "NAME";
```

Reuse `PaginatedResponse<T>` from `@/shared/types/api`.

---

## 6. Data layer & React Query

### 6.1 Query keys

```ts
export const rolesQueryKeys = {
  all: ["roles"] as const,
  lists: () => [...rolesQueryKeys.all, "list"] as const,
  list: (params) => [...rolesQueryKeys.lists(), params] as const,
  details: () => [...rolesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...rolesQueryKeys.details(), id] as const,
};

export const permissionsQueryKeys = {
  all: ["permissions-catalog"] as const,
  // Optionally include locale + api base URL so cache never crosses envs/languages incorrectly
  tree: (locale: string, apiBase: string) =>
    [...permissionsQueryKeys.all, locale, apiBase] as const,
};
```

### 6.2 Hook rules

| Hook | Notes |
|---|---|
| `usePermissionsCatalog` | `staleTime` reasonably high (catalog changes rarely); **enabled only for OWNER**; key includes locale + env/base URL |
| `useRoles` | Debounced `search`; URL-synced `page` / `sort` / `direction` (mirror `UsersHome` pattern) |
| `useRole` | Fetch on edit open; cancel/ignore stale responses if dialog closes (Query `enabled: open && !!id`) |
| Mutations | Invalidate list; on success update/replace detail; toast via Sonner; map field errors with existing `getFieldErrors` |

### 6.3 Memory / performance

- Tree search: filter in memory with `useDeferredValue` on the filter string (catalog is small now, stays recursive-safe).
- Do not deep-clone the whole tree on every checkbox tick — store selected ids in a `Set` / RHF field and derive checked/indeterminate from parent maps built once when catalog loads.
- Abort or disable detail query when dialog unmounts (`enabled` flag) — prevent setState-after-unmount leaks.
- No unbounded local caches of permission ids outside React Query.
- Virtualization: **not required** while catalog is tiny; revisit when tree grows large.

---

## 7. Permission tree UX rules (designer + a11y)

### 7.1 Interaction

1. Check ACTION → auto-check all ancestors (closure).
2. While any descendant is checked, parent PAGE is checked and **cannot be unchecked alone** (disabled / `aria-disabled` with explanation).
3. Uncheck PAGE → uncheck entire subtree.
4. PAGE with zero actions checked is valid (“see screen, do nothing”).
5. After create/update response → reset selection from `permissionIds` in the response (server may have added ancestors).
6. Client filter hides non-matching nodes but **keeps ancestors of matches** visible so hierarchy stays understandable.
7. Preserve server order at every level.

### 7.2 Accessibility (WCAG-oriented)

- Dialog: focus trap, ` Esc` closes (confirm if dirty), restore focus to trigger.
- Tree: use checkbox pattern with proper labeling (`aria-labelledby` / visible label).
- Indeterminate parents (if used): set `input.indeterminate` + expose state in accessible name when helpful.
- Kind chip is decorative/supplementary — do not rely on color alone; include text (الصفحة / الإجراء).
- Live region or toast for save/delete success/errors.
- Keyboard: Tab to rows/actions; Space/Enter toggles checkbox; do not trap focus inside tree nodes incorrectly.
- RTL: logical properties only (`ps`/`pe`, `ms`/`me`, `start`/`end`); tree indent via `padding-inline-start`.
- Reduced motion: no essential information only in animation; respect `prefers-reduced-motion` for expand/collapse if animated.
- Empty / error / loading states must be announced (`role="status"` / `role="alert"` as elsewhere).

### 7.3 Copy / SEO (merchant app)

- Document title via existing meta pattern: e.g. «الأدوار — روافد» / «Roles — Rawafid».
- Avoid promising enforcement: prefer «حزم صلاحيات» / «permission bundles» wording until assignment ships.
- `userCount` column label stays; helper text can note assignment comes later only if product wants — otherwise keep UI quiet and accurate (`0` is fine).

---

## 8. Forms & validation

**Zod + React Hook Form** (project standard):

| Field | Rules |
|---|---|
| `name` | required, trim, max 100 |
| `description` | optional, trim, max 500; blank → send `null` / omit consistently with wipe rule |
| `permissionIds` | always array (default `[]`), max 500 |

On submit:

- Create: `POST` complete body.
- Update: `PUT` complete body including description (to avoid silent wipe).
- Success: close dialog, invalidate list, optional optimistic row replace from response.
- `409 auth.roleNameTaken`: keep open, set error on `name`.
- Validation `400`: map `errors[]` to fields.

---

## 9. Routing, nav, i18n

### 9.1 Route

- Path: `/roles` (merchant) — or `/management/roles` if product prefers an الإدارة group; default recommendation: **`/roles`** for simplicity unless nav IA needs a nest.
- Register in `src/app/merchant/routes.tsx`.
- Guard: authenticated + `OWNER` (component-level or small `OwnerRoute` wrapper next to `ProtectedRoute`).

### 9.2 Nav

- Add item in `MERCHANT_NAV_ITEMS` (e.g. key `roles`, icon `Shield` / `UserCog`, `enabled: true`).
- In sidebar render path: **filter out** when `user.role !== OWNER` (cleaner than showing disabled).
- i18n keys in `common.json` nav + full screen copy in `roles.json`.

### 9.3 i18n namespaces

Register `roles` in i18n config (ar + en), covering:

- Page title, hero, empty, errors
- Table headers, actions
- Form labels, helpers, validation messages
- Kind labels (PAGE/ACTION)
- Delete confirm + `roleInUse` message
- Toasts

Permission node `label` comes from API — do not duplicate in JSON.

---

## 10. UI composition (align with existing screens)

Mirror patterns from admin list homes (`UsersHome`, `PlansHome`) and merchant settings:

| Piece | Pattern |
|---|---|
| Page shell | Hero + toolbar + content states |
| List params | `useSearchParams` + `useDebounce` + shared pagination helpers |
| Table | TanStack Table if other merchant tables exist; otherwise same table primitives as admin users |
| Dialog | Existing shared Dialog / AlertDialog |
| Feedback | Sonner toasts + inline field errors |
| Skeletons | Dedicated `roles-page-skeleton` |
| Empty / error | Dedicated components with retry |

Visual language: follow existing merchant design tokens — do not invent a new purple/cream marketing look; this is an app screen inside the shell.

---

## 11. Implementation phases (build order)

### Phase A — Foundation

1. Types + Zod schema  
2. API functions (`permissions.api`, `roles.api`)  
3. Query keys + hooks  
4. i18n namespace registration  
5. Error-code mapping helpers  

### Phase B — List screen

1. `RolesHome` + hero/toolbar/table/empty/error/skeleton  
2. Route + OWNER nav gating  
3. Search / sort / pagination wired to query string  
4. Delete dialog + `roleInUse` handling  

### Phase C — Create / Edit + tree

1. `permission-tree` utilities (ancestors map, closure apply/remove, filter)  
2. `PermissionTree` + kind badge  
3. `RoleFormDialog` create + edit (load detail, re-hydrate after save)  
4. Field + conflict error UX  

### Phase D — Hardening

1. A11y pass (dialog, tree, keyboard, RTL, focus)  
2. Stale catalog / `unknownPermission` recovery  
3. Confirm no AGENT leakage (nav + route + hooks `enabled`)  
4. Copy review: no “enforces access” claims  
5. Manual QA against staging  

### Phase E — Explicitly later (do not start)

- Assign role to user  
- Permission-based client gating  
- Staff user management  
- Per-user overrides  
- Admin console equivalents  

---

## 12. Testing & QA checklist

### Functional

- [ ] OWNER sees Roles nav and can CRUD  
- [ ] AGENT does not see nav; deep-link `/roles` redirected  
- [ ] Search matches name only  
- [ ] Sort `CREATED_AT` / `NAME`  
- [ ] Create with empty permissions allowed  
- [ ] Create/edit with ACTION auto-includes PAGE in stored set (verify via GET)  
- [ ] After save, UI checkboxes match response `permissionIds`  
- [ ] Edit without sending description does not wipe when we correctly re-send it  
- [ ] Duplicate name → `409` on name field  
- [ ] Delete success removes row  
- [ ] Delete `roleInUse` shows correct message (mock if needed)  
- [ ] Locale switch refreshes catalog labels (`Accept-Language`)  
- [ ] Platform roles never appear  

### A11y / UX

- [ ] Dialog focus trap + restore  
- [ ] Tree operable by keyboard  
- [ ] Kind not color-only  
- [ ] RTL indentation correct  
- [ ] Loading/empty/error announced  

### Performance / hygiene

- [ ] No permission id hardcoding  
- [ ] Catalog query not enabled for AGENT  
- [ ] Detail query disabled when dialog closed  
- [ ] No console errors / leaked subscriptions  

---

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Checkbox drift vs server closure | Always re-hydrate from response |
| Description silent wipe | Always include description on PUT |
| Stale permission ids across envs | Cache key includes API base; re-fetch on `unknownPermission` |
| Over-promising product | Freeze copy review before merge |
| Building admin UI by mistake | Explicit out-of-scope; endpoints return 403 for admin token |
| Premature permission gating | Keep using `OWNER`/`AGENT` only until backend enforces fine-grained perms |

---

## 14. Definition of Done (this feature drop)

- Merchant OWNER can list/search/sort roles, create, edit (name + description + permission tree), and delete.  
- AGENT cannot reach the feature.  
- Admin console unchanged for this feature.  
- Closure rule + re-hydration correct.  
- Errors from §6 wired.  
- i18n AR/EN complete for UI chrome (API labels for permissions).  
- A11y baseline met for dialog + tree.  
- No assignment UI; no fine-grained client gating; copy does not claim live enforcement.  

---

## 15. Suggested commit message (when implementation is done)

```
feat(roles): add merchant OWNER roles screen with permission tree CRUD
```

Alternative (if split commits are preferred later):

```
feat(roles): wire roles API, OWNER-gated list, and permission tree form
```

---

## 16. Quick reference — Merchant vs Admin

```
Merchant Dashboard (build now)
├── Nav: الأدوار (OWNER only)
├── GET /api/permissions
├── CRUD /api/roles
├── Permission tree modal + closure rule
└── userCount column (always 0 for now)

Admin Console (do nothing this drop)
├── No roles routes
├── No permissions API usage
└── Wait for admin-scoped APIs if ever needed
```
