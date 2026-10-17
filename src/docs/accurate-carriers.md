# Carriers on a shared platform (Accurate: Arco and 20 more) — FE contract

**Status: deployed to staging (PR #55, 2026-10-17).** On staging, Arco is added and enabled, and
the other 21 Egyptian Accurate carriers are added **disabled**, under English names until each is
partnered. All their areas synced except Quicks, which publishes none. A staging merchant saw Arco
with its form and `capabilities`, and its connect test passed with a real Arco login (34/34
checks).
 The payloads below were captured from a local run against
**Arco's live API**, read-only: the admin added Arco, its delivery areas synced from Arco's public
zone list, and a merchant ran the connect **test** with a real Arco login. That test only logs in and
reads the account. **Nothing was booked at Arco**: the login belongs to a real merchant. Booking,
tracking, pushes and cancelling were tested end to end against a local stand-in of the same API.

**What it is.** About 20 Egyptian carriers run on one shared software platform, **Accurate**:
Arco, Telegraph, Enjad, Pro Zone, Alexander, Qimmah, 2go, Future, Tala Express, 4 Speed, Reach,
Flottex, Best, Ar Supply, Red Express, Roc Express, Aldahab, 3al Sare3, Circle, ast and others. They
all speak the same API, each on its own address. Rawafid now speaks it once:

- **An admin adds such a carrier from a form, with no release.** Each one is a row, holding the
  carrier's address and its id on the platform.
- **Merchants see it like any partner.** It appears in *More connections*, with a connect form built
  from `fields` as today, and is booked, tracked and cancelled the same way.
- **Two things differ for an Accurate carrier.** It **prints nothing**, because the carrier prints its
  own sticker at pickup. And it has **no returns or exchanges yet**.

To hide the actions a partner lacks, every carrier and every connection now says what it supports in
**`capabilities`**. Bosta's flags are all `true`; for every carrier now, read the flags instead of
assuming.

---

## Changes to the earlier drops

Everything else in those drops still holds. These lines are out of date:

| Drop | Where | Was | Now |
|---|---|---|---|
| `2026-09-26-shipping-partners.md` | `GET /api/carriers` | Bosta is the only real partner; the form is Bosta's | More partners appear. Same `fields` mechanism; the Accurate form is `username`, `password` (both SECRET), `serviceId`, `allowToOpen`. Each item gains `capabilities` |
| `2026-09-26-shipping-partners.md` | the connection response | no `capabilities` | gains `capabilities`, the partner's flags |
| `2026-09-26-shipments.md` | *Print label* / *Print labels* | every booked delivery prints | only when the connection's `capabilities.labels` is `true`. Otherwise hide the button; the endpoint answers `422` "prints its own labels" |
| `2026-10-16-returns.md`, `2026-10-16-exchanges.md` | the *Return* / *Exchange* action | offered on every delivered order | the preview already lists only the connections that can do it; when none can, hide the action. `capabilities.returns` / `.exchanges` tell you per connection |
| `2026-09-26-carrier-regions-admin.md` | carriers | seeded, only enabled/disabled from the console | carriers on a shared platform are added, edited and deleted from the console (§2 here). `unmappedCities` on such a carrier lists its billing lines (e.g. `فاتورة مرتجعات`); that is expected, not a fault |

---

## 1. Merchant screens

### 1.1 `GET /api/carriers` — an Accurate partner in *More connections*

The same list as before. Each item gains `capabilities`. Captured with Arco added:

```json
{
  "code": "arco",
  "nameEn": "Arco",
  "nameAr": "أركو",
  "fields": [
    { "key": "username", "kind": "SECRET", "required": true, "label": "Username", "defaultValue": null, "options": [] },
    { "key": "password", "kind": "SECRET", "required": true, "label": "Password", "defaultValue": null, "options": [] },
    { "key": "serviceId", "kind": "TEXT", "required": false, "label": "Shipping service number", "defaultValue": "1", "options": [] },
    { "key": "allowToOpen", "kind": "BOOLEAN", "required": false, "label": "Allow opening the package", "defaultValue": true, "options": [] }
  ],
  "capabilities": { "labels": false, "cancel": true, "tracking": true, "returns": false, "exchanges": false }
}
```

- **The form is the same code as Bosta's:** render `fields` in order. SECRET values go in
  `credentials`, the rest in `options`.
  - `username` is a SECRET on purpose: changing it re-checks the account like a new password does.
  - Arco usernames are usually the merchant's phone number.
- **`serviceId`:** leave it at `1` unless the carrier gave the merchant another one. A number the
  account does not have is refused at connect time (`422`).
- **`capabilities`:**

  | Flag | `false` means |
  |---|---|
  | `labels` | no Print / Print labels for this partner's shipments |
  | `cancel` | no Cancel |
  | `tracking` | no status updates, so the shipment stays `BOOKED` |
  | `returns` | the partner is never offered for a return |
  | `exchanges` | the partner is never offered for an exchange |

### 1.2 `POST /api/carriers/{code}/test` and `POST /api/carrier-connections`

These are unchanged. With a real Arco login, the test answers with the account itself as the one
pickup point: an Accurate carrier collects from the address it holds for the merchant.

```json
{ "pickupLocations": [ { "id": "403", "name": "jiwan 2", "address": "الجيزة - المهندسين", "isDefault": true } ] }
```

Errors on test, connect and edit:

| Status | When | Message |
|---|---|---|
| `422` | a wrong login | the usual *"The shipping partner rejected these credentials…"* |
| `422` | the login works, but it is not a merchant account (e.g. a carrier staff login) | *"The shipping partner accepted this login, but the account cannot ship yet. Use your merchant account's login, or ask the shipping partner to activate it."* (ar: «قبل شريك الشحن بيانات الدخول، لكن الحساب لا يمكنه الشحن بعد…») |
| `400` | a `serviceId` the account does not have | `"field": "serviceId"`, the usual invalid-field message; put it beside that input, not the password |
| `409` | changing the login on a connection with open shipments to a **different** carrier account | the existing *connectionAccountLocked* message. A new password for the **same** account is accepted |

If the carrier later stops accepting the connection's settings, booking answers `422` *"The
shipping partner does not accept this connection's settings. Check them in Shipping Partners."*
(ar: «شريك الشحن لا يقبل إعدادات هذا الربط. راجعها في شركاء الشحن.»).

The connection response gains `capabilities` (the partner's flags, as in §1.1):

```json
{ "id": "…", "carrier": { "code": "arco", "nameEn": "Arco", "nameAr": "أركو" }, "name": "Arco main",
  "active": true, "credentialHint": null, "options": { "serviceId": "1", "allowToOpen": true },
  "pickupLocationName": "jiwan 2", "verifiedAt": "…",
  "capabilities": { "labels": false, "cancel": true, "tracking": true, "returns": false, "exchanges": false },
  "createdAt": "…", "updatedAt": "…" }
```

`credentialHint` is the last four characters of the first secret, which here is the username.
It shows when the username is 12 or more characters long; an 11-digit phone number shows none.

### 1.3 Booking, statuses, cancel

These are unchanged:
- the preview and the district match work as for Bosta (Accurate's areas are synced the same way);
- booking, the statuses (`BOOKED` → `IN_TRANSIT` → `DELIVERED`, or `RETURNING` → `RETURNED`),
  the timeline, notifications and cancel all behave the same.

The timeline's `carrierCode` shows Accurate's own codes:

| Code | Meaning |
|---|---|
| `PKR` | pickup requested |
| `RITS` | at the carrier's warehouse |
| `OTD` | out for delivery |
| `DEX` | could not deliver; an issue, and the carrier retries |
| `DTR` | delivered |
| `RTRN` | returned to the merchant |

`GET /api/shipments/{id}/label` on such a shipment is `422`:

```json
{ "detail": "This shipping partner prints its own labels when it collects the shipment, so there is nothing to print here", "status": 422 }
```

In Arabic: «شريك الشحن هذا يطبع ملصقاته بنفسه عند استلام الشحنة، لذا لا يوجد ما يُطبع هنا». Hide the
button rather than showing this.

---

## 2. Admin console: adding a carrier

Permissions are the carrier catalog's: `carrier:carrier:read` to look, `carrier:carrier:manage` to
change.

### 2.1 `GET /api/admin/carrier-platforms` — the platforms carriers can be added on

```json
[ { "platform": "ACCURATE", "carrierFields": [ { "key": "baseUrl", "required": true }, { "key": "clientId", "required": true } ] } ]
```

Build the *Add carrier* form from `carrierFields`:

| Field | What to enter | Example |
|---|---|---|
| `baseUrl` | the carrier's API address; must start with `https://` and end with `/graphql` | `https://arco.lg.accuratess.com:8443/graphql` |
| `clientId` | the carrier's id on the platform (lowercase letters, digits, dashes) | `arco` |

Bosta is not listed: it is a platform with one carrier, so it cannot be added.

### 2.2 `POST /api/admin/carriers` → `201`

```json
{ "code": "arco", "platform": "ACCURATE", "nameEn": "Arco", "nameAr": "أركو",
  "settings": { "baseUrl": "https://arco.lg.accuratess.com:8443/graphql", "clientId": "arco" },
  "sortOrder": 100, "enabled": true }
```

`sortOrder` (default 100) and `enabled` (default true) are optional. The answer is the admin
carrier row, which now includes `settings`:

```json
{ "id": "63ccd61a-…", "code": "arco", "platform": "ACCURATE", "nameEn": "Arco", "nameAr": "أركو",
  "enabled": true, "running": true, "sortOrder": 100,
  "settings": { "baseUrl": "https://arco.lg.accuratess.com:8443/graphql", "clientId": "arco" },
  "updatedAt": "2026-10-17T13:15:55.998887Z" }
```

**Delivery areas.** The carrier's areas download straight after creation, which takes about 2 s for
Arco. If the carrier does not answer, it is still added; use **Sync now** (the regions console) to
retry. Arco's sync, as captured:

```json
{ "added": 0, "updated": 0, "retired": 0, "total": 378, "unmappedCities": [] }
```

**Errors:**

| Status | When | Body |
|---|---|---|
| `400` | a setting is missing or malformed | `"field": "baseUrl"` or `"clientId"`, to put beside the input. Message: *"This setting is missing or has a value the platform does not accept"* |
| `409` | the code is taken | *"Another shipping partner has this code"* |
| `409` | the `clientId` is taken on the platform | *"Another shipping partner on this platform has this client id"* (ar: «يوجد شريك شحن آخر على هذه المنصة بنفس معرّف العميل») |
| `422` | the platform cannot have carriers added (Bosta) | *"Shipping partners cannot be added on this platform"* |

### 2.3 `PATCH /api/admin/carriers/{code}` → `200`

```json
{ "nameEn": "Arco Express", "sortOrder": 7 }
```

- Any of `nameEn`, `nameAr`, `settings`, `sortOrder`; fields left out keep their value.
- New `settings` re-download the areas.
- The code and platform never change.

### 2.4 `DELETE /api/admin/carriers/{code}` → `204`

Allowed only while no merchant has connected the carrier. Afterwards it is `409`, *"Merchants have
connected this shipping partner, so it cannot be deleted. Disable it instead."*, and the existing
enable switch (`PUT /api/admin/carriers/{code}` `{ "enabled": false }`) is the way to take it away.
Bosta cannot be deleted (`422`).

### 2.5 Delivery areas of an Accurate carrier

These use the same regions console (`2026-09-26-carrier-regions-admin.md`). Accurate carriers name
their areas in their own pricing zones (`القاهرة`, `اطراف القاهرة`, `منطقة غرب`), which Rawafid
places in our governorates. When synced locally, all 21 live Egyptian carriers placed every real
place. What is left in `unmappedCities`, so expected and safe to ignore:
- billing lines, such as `فاتورة مرتجعات`, `بيك اب` and `السعودية`;
- the odd zone whose name exists in two governorates, such as ast's `المنصورة` with a single area.

Quicks currently publishes no areas at all, so its sync answers `502`.

---

## 3. Not built yet
- Printing for Accurate carriers. The carrier prints its own sticker at pickup.
- Returns and exchanges on Accurate carriers.
- Status pushes from Accurate are built, but switched on per deployment. Until they are, Accurate
  shipments update by the half-hourly poll. Nothing on screen changes either way.
