# Rawafid API — Frontend Integration Guide

Everything the backend exposes today, verified against the deployed code. Interactive docs
(Swagger UI) are served by the API itself at `/swagger-ui.html` — use them to try requests live;
this document adds the context the generated docs can't: token handling, error contracts, flows,
and what is deliberately not there yet.

**Base URL:** `https://rawafid.softizone.net`

There are **two separate applications** in one API:

- **Merchant app** (`/api/auth/**`, `/api/company`, `/api/subscription`) — the storefront owners.
- **Admin console** (`/api/admin/**`) — platform staff. Separate accounts, separate tokens.
  A merchant token is *never* valid on `/api/admin/**` and vice versa — the wrong one gets `401`.
- **Public** (`/api/public/**`) — no authentication at all (landing page content).

---

## 1. Authentication & token handling

All authenticated calls send:

```
Authorization: Bearer <accessToken>
```

Both login endpoints (and refresh) return the same shape:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "refreshToken": "d5b0f0e2-...."
}
```

- **Access token** lives `expiresIn` seconds. Don't hardcode a value — read the field.
- **Refresh token** lives 7 days and is **single-use**: every call to `refresh` returns a *new*
  refresh token and invalidates the one you sent. Always overwrite the stored one.
- On a `401` from any API call: try one `refresh`; if that also fails, drop to the login screen.
- **A password change logs out every session** — refresh stops working everywhere; users must
  log in again with the new password.
- Logout invalidates the refresh token server-side; discard both tokens client-side.

### Rate limiting

`register`, `login`, `refresh`, `me/password` (and the admin `login`/`refresh`) are rate
limited. Past the limit the API answers `429` with the standard error body below — handle it
with a "try again later" message.

---

## 2. Localization

Send `Accept-Language: ar` for Arabic, anything else (or nothing) falls back to English. It
affects:

- every human-readable error message (`detail` in error bodies, `reason` in validation errors),
- localized catalog content (`name`, `description`, feature labels in `/api/public/plans`,
  `planName` in the subscription endpoints).

Admin endpoints return the **full locale maps** (`{"en": "...", "ar": "..."}`) instead, because
the admin UI edits both translations.

---

## 3. Error contract

Every error is an [RFC 9457 problem-detail](https://www.rfc-editor.org/rfc/rfc9457) JSON body.

**Business/auth errors** — show `detail` to the user, branch on `status`:

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Current password is incorrect",
  "instance": "/api/auth/me/password"
}
```

**Bean-validation errors** (`400`) additionally carry `errors`, one entry per bad field — use
`name` to highlight the form field, `reason` as its inline message:

```json
{
  "type": "about:blank",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request validation failed",
  "instance": "/api/auth/register",
  "errors": [
    { "name": "shipFromCountry", "reason": "must be a 2-letter country code" }
  ]
}
```

Statuses you will meet: `400` bad input, `401` missing/expired/wrong-plane token or bad
credentials, `403` authenticated but not allowed (wrong role/permission, suspended account),
`404` not found, `409` conflict (duplicate email, duplicate plan code, archiving the default
plan), `429` rate limited.

---

## 4. Shared enums

| Enum | Values |
|---|---|
| `MonthlyShipmentVolume` | `VOL_0_50`, `VOL_50_200`, `VOL_200_500`, `VOL_500_1000`, `VOL_1000_PLUS` |
| `CompanySize` | `FROM_1_TO_10`, `FROM_11_TO_50`, `FROM_51_TO_200`, `ABOVE_200` |
| `BillingPeriod` | `MONTHLY`, `YEARLY` |
| Subscription `status` | `ACTIVE`, `REPLACED`, `EXPIRED` |
| Plan `status` | `ACTIVE`, `ARCHIVED` |
| Plan feature `type` | `NUMBER`, `BOOLEAN`, `UNLIMITED`, `TEXT` |
| User/admin `status` | `ACTIVE`, `SUSPENDED` |
| Merchant roles | `OWNER`, `AGENT` |
| Admin roles | `SUPER_ADMIN`, `SUPPORT` |

Sending an invalid enum value returns a `400` listing the permitted values.

All timestamps are ISO-8601 UTC instants (`"2026-07-17T15:01:13.852736Z"`). All ids are UUIDs.
Money is a decimal number with 2 fraction digits (`6110.00`).

---

## 5. Public endpoints (no auth)

### `GET /api/public/plans`

The landing-page pricing table: **active** plans only, sorted by `sortOrder`, translated by
`Accept-Language`. The `FREE` plan (every new account starts on it) is part of the list.

```json
[
  {
    "code": "LAUNCH",
    "name": "Launch",
    "description": "For growing stores",
    "highlighted": true,
    "customPricing": false,
    "tiers": [
      { "shipmentsPerMonth": 50, "monthlyPrice": 49.00, "yearlyPrice": 499.00 },
      { "shipmentsPerMonth": 1000, "monthlyPrice": 599.00, "yearlyPrice": 6110.00 }
    ],
    "features": [
      { "label": "Users", "type": "NUMBER", "number": 3, "enabled": null, "text": null }
    ]
  }
]
```

- `customPricing: true` ⇒ `tiers` is empty; render "Contact us" instead of a price.
- `tiers` is the volume dropdown: each pairs a shipments-per-month volume with explicit monthly
  and yearly prices (yearly is *not* 12× monthly — display it as stored).
- Feature rendering by `type`: `NUMBER` → show `number`; `BOOLEAN` → check/cross from `enabled`;
  `UNLIMITED` → an "unlimited" badge; `TEXT` → show `text`.

---

## 6. Merchant endpoints

### Registration & session

#### `POST /api/auth/register` → `201`

```json
{
  "firstName": "Saeed",
  "lastName": "Eldeeb",
  "dateOfBirth": "1995-04-12",
  "email": "owner@store.com",
  "password": "s3cure-Password",
  "phone": "+201234567890",
  "shipFromCountry": "EG",
  "monthlyShipmentVolume": "VOL_0_50",
  "companyName": "My Store"
}
```

- `firstName` and `lastName` are **required** (max 255 each); the API joins them into the
  display `fullName` it returns.
- `dateOfBirth` is **optional**, an ISO date (`YYYY-MM-DD`), and must be in the **past**.
- `companyName` is **optional** — omitted, the backend names the company
  `"{firstName} {lastName}-{accountNumber}"` and the owner can rename it later.
- `shipFromCountry` is a 2-letter ISO code, case-insensitive (stored uppercase).
- Password: 8–100 chars.
- Registration creates the user (role `OWNER`), their company, and an active subscription on the
  FREE plan.
- Returns the user (below), **not tokens** — follow with `login`.
- `409` if the email is already registered.

#### `POST /api/auth/login` → `200` token response (§1)

Body: `{ "email": "...", "password": "..." }`. `401` on wrong credentials, `403` if suspended.

#### `POST /api/auth/refresh` → `200` token response (§1)

Body: `{ "refreshToken": "..." }`. `401` if invalid/expired/already used.

#### `POST /api/auth/logout` → `204`

Body: `{ "refreshToken": "..." }`. Requires a valid access token.

### Account (the person)

#### `GET /api/auth/me` → `200`

```json
{
  "id": "c714e80a-...",
  "companyId": "15828830-...",
  "firstName": "Saeed",
  "lastName": "Eldeeb",
  "fullName": "Saeed Eldeeb",
  "dateOfBirth": "1995-04-12",
  "email": "owner@store.com",
  "emailVerified": false,
  "phone": "+201234567890",
  "phoneVerified": false,
  "verified": false,
  "role": "OWNER",
  "status": "ACTIVE"
}
```

- `fullName` is derived (first + last) — a convenience for labels/greetings; don't post it back.
- `dateOfBirth` may be `null` (it's optional at registration).
- `emailVerified` / `phoneVerified` are the per-channel confirmation flags; `verified` is the
  overall "Verified User" badge — `true` **only when both channels are confirmed**. New accounts
  start all three `false`. The confirm flows that flip them are not exposed yet (see §9).

#### `PUT /api/auth/me` → `200` (same shape)

Body: `{ "firstName": "...", "lastName": "...", "phone": "...", "dateOfBirth": "..." }` —
`firstName`, `lastName`, `phone` required; `dateOfBirth` optional (past date). **Email is not
editable** (it is the login identifier; a verified-change flow will come later). **Changing the
phone resets `phoneVerified` to `false`** — the new number must be re-confirmed. Company facts are
edited on the company endpoint, not here.

#### `POST /api/auth/me/password` → `204`

```json
{ "currentPassword": "old-one", "newPassword": "new-one-8chars-min" }
```

`400` with a localized `detail` when `currentPassword` is wrong. On success **every session is
logged out** — take the user to the login screen. Rate-limited.

### System settings (the person's display & locale preferences)

#### `GET /api/auth/me/settings` → `200`

```json
{
  "theme": "SYSTEM",
  "fontScale": 100,
  "defaultHomePage": "home",
  "timezone": "Africa/Cairo",
  "dateFormat": "DD_MM_YYYY",
  "mapLat": null,
  "mapLng": null,
  "country": "EG",
  "currency": "EGP"
}
```

- A user who never saved settings gets exactly these **defaults** (map location unset).
- `country` and `currency` are **read-only derived facts** (the company's ship-from country and
  the platform currency) — display them, but they are not part of the PUT body.

#### `PUT /api/auth/me/settings` → `200` (same shape)

Full replace — send the complete settings state:

```json
{
  "theme": "DARK",
  "fontScale": 110,
  "defaultHomePage": "shipments",
  "timezone": "Africa/Cairo",
  "dateFormat": "DD_MM_YYYY",
  "mapLat": 30.0444,
  "mapLng": 31.2357
}
```

| Field | Rules |
|---|---|
| `theme` | `SYSTEM` \| `LIGHT` \| `DARK` |
| `fontScale` | one of `80, 90, 100, 110, 120` |
| `defaultHomePage` | free string (max 50) — FE owns its route names; the backend stores it verbatim |
| `timezone` | a valid IANA zone id (checked server-side) |
| `dateFormat` | `DD_MM_YYYY` \| `MM_DD_YYYY` \| `YYYY_MM_DD` |
| `mapLat` / `mapLng` | optional; −90..90 / −180..180 |

Violations return the standard `400` validation body (§3) with per-field `errors`.

### Company (the tenant)

No id in the path — it's always the caller's own company.

#### `GET /api/company` → `200`

```json
{
  "id": "15828830-...",
  "identifier": 10042,
  "name": "My Store",
  "logoUrl": null,
  "size": "FROM_11_TO_50",
  "industry": "E-commerce",
  "website": "https://my.store",
  "shipFromCountry": "EG",
  "monthlyShipmentVolume": "VOL_50_200",
  "createdAt": "2026-07-17T15:00:25.346797Z",
  "updatedAt": "2026-07-17T15:00:25.346797Z"
}
```

`identifier` is the human-facing account number — display it as `"{name}-{identifier}"` where
tryout-style account labels are needed. It never changes.

#### `PUT /api/company` → `200` (same shape) — **OWNER only** (`403` for agents)

```json
{
  "name": "My Store",
  "size": "FROM_11_TO_50",
  "industry": "E-commerce",
  "website": "https://my.store",
  "shipFromCountry": "EG",
  "monthlyShipmentVolume": "VOL_50_200"
}
```

Full replace: `name`, `shipFromCountry`, `monthlyShipmentVolume` required; `size`, `industry`,
`website` nullable. `website` must start with `http://` or `https://`. `logoUrl` and
`identifier` cannot be edited (logo upload is a future endpoint).

### Subscription

#### `GET /api/subscription` → `200`

```json
{
  "id": "b7de192d-...",
  "planId": "fcd08803-...",
  "planCode": "LAUNCH",
  "planName": "Launch",
  "shipmentsPerMonth": 1000,
  "price": 6110.00,
  "billingPeriod": "YEARLY",
  "startsAt": "2026-07-17T15:01:13.852736Z",
  "endsAt": "2027-07-17T15:01:13.852736Z",
  "status": "ACTIVE"
}
```

- Every company **always** has exactly one active subscription — this endpoint never legitimately
  404s.
- The values are a **snapshot of the deal as it was struck**: if the platform later edits the
  plan's pricing, this response still shows what *this* company signed up for. `planName` is
  localized by `Accept-Language`.
- On the FREE plan: `price` is `0.00`, `billingPeriod` and `endsAt` are `null` (open-ended).
- When a paid period runs out, the company is automatically dropped back to FREE within a day of
  `endsAt`.
- There is **no self-serve plan change yet** — plans are assigned by the platform team. A "want
  to upgrade? contact us" UI is the right shape for now.

---

## 7. Admin console endpoints

All under `/api/admin/**`; require an **admin** token. What an admin may do depends on their
role — `SUPER_ADMIN` can do everything, `SUPPORT` is read-only — and a disallowed operation gets
`403`. Build the console off the `role` field from `GET /api/admin/auth/me` (hide/disable what
the role can't do), and treat `403` as the source of truth.

### Session

Same contract as merchant auth, same token handling (§1), same rate limits:

- `POST /api/admin/auth/login` → token response
- `POST /api/admin/auth/refresh` → token response
- `POST /api/admin/auth/logout` → `204`
- `GET /api/admin/auth/me` → `{ "id", "fullName", "email", "role", "status" }`
- `GET /api/admin/ping` → liveness/permission probe (`{"message": "pong", ...}`)

### Plan catalog

| Endpoint | Allowed roles | Notes |
|---|---|---|
| `GET /api/admin/plans` | SUPER_ADMIN, SUPPORT | all plans incl. `ARCHIVED` |
| `GET /api/admin/plans/{id}` | SUPER_ADMIN, SUPPORT | |
| `POST /api/admin/plans` | SUPER_ADMIN | `201`; `409` on duplicate `code` |
| `PUT /api/admin/plans/{id}` | SUPER_ADMIN | edits everything except `code`; send the full tier list, it replaces the old one |
| `DELETE /api/admin/plans/{id}` | SUPER_ADMIN | `204`; **archives** (soft delete); `409` for the default plan |
| `POST /api/admin/plans/{id}/activate` | SUPER_ADMIN | brings an archived plan back |

Create/update body (localized fields are full locale maps and **must** contain non-blank `en`
and `ar`):

```json
{
  "code": "LAUNCH",
  "name": { "en": "Launch", "ar": "الانطلاق" },
  "description": { "en": "For growing stores", "ar": "للمتاجر النامية" },
  "highlighted": true,
  "customPricing": false,
  "sortOrder": 1,
  "tiers": [
    { "shipmentsPerMonth": 50, "monthlyPrice": 59.00, "yearlyPrice": 599.00, "sortOrder": 0 }
  ],
  "features": [
    { "label": { "en": "Users", "ar": "المستخدمون" }, "type": "NUMBER", "number": 3 }
  ]
}
```

Rules the API enforces (surface them in the form): `code` is `[A-Z0-9_]+`, max 50, immutable
after creation; `customPricing: true` ⇔ `tiers: []`; otherwise at least one tier; no two tiers
with the same `shipmentsPerMonth`; prices max 2 decimals; each feature must carry the value its
`type` demands (`NUMBER`→`number`, `BOOLEAN`→`enabled`, `TEXT`→`text`, `UNLIMITED`→nothing).

The admin response echoes the full locale maps plus `id`, `status`, `isDefault`, `createdAt`,
`updatedAt`, and tier `id`s. `isDefault: true` marks the plan new registrations land on — it
cannot be archived, and the flag is not editable through the API.

### Company subscriptions

| Endpoint | Allowed roles |
|---|---|
| `POST /api/admin/companies/{companyId}/subscription` | SUPER_ADMIN |
| `GET /api/admin/companies/{companyId}/subscriptions` | SUPER_ADMIN, SUPPORT |

**Assign a plan** (`201`, returns the subscription in the §6 shape):

```json
{ "planId": "fcd08803-...", "shipmentsPerMonth": 1000, "billingPeriod": "YEARLY" }
```

- `shipmentsPerMonth` must match one of the plan's tiers exactly (it selects the tier; `400`
  otherwise).
- Effect is **immediate**: the company's current subscription becomes `REPLACED`, the new one
  starts now and ends one calendar month/year later. Assigning `FREE` is how you "downgrade"
  someone manually — that stay comes back open-ended (`billingPeriod` and `endsAt` are `null`)
  no matter which `billingPeriod` was sent.
- `404` unknown company; `400` archived plan or `customPricing` plan (custom deals aren't
  supported yet — the error message says so).

**History** returns the §6 subscription shape as an array, newest first — exactly one `ACTIVE`,
the rest `REPLACED`/`EXPIRED`. Renders directly as a timeline.

### Companies directory

| Endpoint | Allowed roles |
|---|---|
| `GET /api/admin/companies` | SUPER_ADMIN, SUPPORT |
| `GET /api/admin/companies/{companyId}` | SUPER_ADMIN, SUPPORT |

**List** query parameters (all optional):

| Param | Values | Default |
|---|---|---|
| `search` | matches company **name** (case-insensitive, anywhere) or **account number** (prefix) | — |
| `page` | zero-based page index | `0` |
| `size` | rows per page, capped at `100` | `20` |
| `sort` | `CREATED_AT` \| `NAME` \| `IDENTIFIER` | `CREATED_AT` |
| `direction` | `ASC` \| `DESC` | `DESC` |

An unknown `sort`/`direction` value is a `400`. The response is a paged envelope — the same shape
every future list endpoint will use:

```json
{
  "content": [
    {
      "id": "15828830-...",
      "identifier": 10042,
      "name": "Rawafid Store",
      "logoUrl": null,
      "size": "FROM_11_TO_50",
      "industry": "E-commerce",
      "website": "https://rawafid.store",
      "shipFromCountry": "EG",
      "monthlyShipmentVolume": "VOL_50_200",
      "planCode": "FREE",
      "createdAt": "2026-07-18T12:00:00Z",
      "updatedAt": "2026-07-18T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 42,
  "totalPages": 3
}
```

`planCode` is each company's **current** plan — render it as the plan column and link the row to
the subscription endpoints above. **Detail** returns one row in the same shape (`404` unknown id).
A search miss is an empty `content`, not an error.

### Users directory

| Endpoint | Allowed roles |
|---|---|
| `GET /api/admin/users` | SUPER_ADMIN, SUPPORT |
| `GET /api/admin/users/{userId}` | SUPER_ADMIN, SUPPORT |
| `GET /api/admin/companies/{companyId}/users` | SUPER_ADMIN, SUPPORT |

**List** takes the same paging contract as the companies directory (`page`, `size` capped at
`100`, `direction`), with its own `search` and `sort`:

| Param | Values | Default |
|---|---|---|
| `search` | matches the user's **name** (first, last, or "first last", case-insensitive, anywhere) or **email** | — |
| `sort` | `CREATED_AT` \| `NAME` \| `EMAIL` | `CREATED_AT` |

Rows come in the same paged envelope, each row the §6 `me` shape plus `createdAt`:

```json
{
  "id": "c714e80a-...",
  "companyId": "15828830-...",
  "firstName": "Saeed",
  "lastName": "Eldeeb",
  "fullName": "Saeed Eldeeb",
  "dateOfBirth": "1995-04-12",
  "email": "owner@store.com",
  "emailVerified": false,
  "phone": "+201234567890",
  "phoneVerified": false,
  "verified": false,
  "role": "OWNER",
  "status": "ACTIVE",
  "createdAt": "2026-07-18T12:00:00Z"
}
```

**Detail** returns one user in the same shape (`404` unknown id). **Company team** returns a
plain array (not paged — a team is small), oldest member first, `404` for an unknown company;
link it from the company detail screen.

### User moderation

| Endpoint | Allowed roles |
|---|---|
| `PATCH /api/admin/users/{userId}` | SUPER_ADMIN |

Every field optional — send only what should change (`200`, returns the user in the directory
shape):

```json
{ "emailVerified": true, "phoneVerified": true, "status": "ACTIVE" }
```

- `emailVerified` / `phoneVerified` — attest or revoke each channel independently; the `verified`
  badge computes itself (both `true` ⇒ `true`).
- `status` — `SUSPENDED` blocks login **and revokes every session immediately** (the user's
  refresh tokens die; their current access token outlives it by at most its TTL). `ACTIVE`
  reinstates.
- If the user later changes their phone, `phoneVerified` drops back to `false` — the attestation
  belonged to the old number.
- `404` unknown user; `403` for SUPPORT (read-only role); `400` for an unknown `status` value.

---

## 8. Suggested flows

**Merchant onboarding**
`GET /api/public/plans` (pricing page) → `POST /api/auth/register` → `POST /api/auth/login` →
store both tokens → `GET /api/auth/me` + `GET /api/company` + `GET /api/subscription` to
populate the shell.

**Session keep-alive**
On `401` → `POST /api/auth/refresh` with the stored refresh token → replace **both** tokens →
retry once → on failure, login screen.

**Account settings page**
Person section = `GET/PUT /api/auth/me`; company section = `GET/PUT /api/company` (hide the edit
form unless `role === "OWNER"`); password section = `POST /api/auth/me/password`, then force
re-login. Email shown read-only. System preferences (theme, font scale, timezone, date format,
default page, map start point) = `GET/PUT /api/auth/me/settings`.

**Billing page**
`GET /api/subscription` for the current deal; `endsAt` drives the "renews/expires on" line
(`null` = no expiry). Upgrade CTA = contact link for now.

---

## 9. Not built yet (don't design against these)

- **Shipments** — the core domain, coming next.
- Self-serve checkout/payments; plan changes are admin-assigned.
- Quota enforcement (the subscription's `shipmentsPerMonth` is not enforced anywhere yet).
- Logo upload (`logoUrl` is always `null` for now).
- Email/phone **self-serve verification** — the `emailVerified` / `phoneVerified` / `verified`
  flags are live on `/api/auth/me` and admins can set them, but the flows where the *user*
  confirms a code sent to their email/phone are still to come.
- Email change, password reset ("forgot password").
- Team members (`AGENT` role exists but there is no invite/management API).
- Admin company search by **owner email** (search covers name and account number only for now).
