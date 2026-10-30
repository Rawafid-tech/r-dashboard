# 2026-10-23 — Mega Technology carriers

The drops shipped on 2026-10-23, one part each. Section numbers (§) restart in every part; a
reference such as `2026-10-23-mega-technology-carriers.md` Part 1 §2 names the part first.

- **Part 1 — Mega Technology carriers (Aman and nine more)**

---

# Part 1 — Mega Technology carriers (Aman and nine more)

> Builds on `2026-10-17-accurate-carriers-logos-returns.md` Part 1 (Accurate carriers: admin-added
> partners, `carrierFields`, `capabilities`) and Part 3 (the `returns` switch).

**Status: deployed to staging (PRs #58–#61, 2026-10-23).** On staging Aman is added and enabled with its sync account (273 areas, all but one group placed), and a test merchant booked one real test shipment through it: Nasr City (Aman area 34922), collected from a Mohandessin sender location (34933), waybill `AMN78661`, state *Pickup Request*. Cancel and print were refused as expected. **Five more were added later the same day** (no code change), enabled, synced and connect-tested, with nothing booked: Eissa Express (`eissa-express`, 412 areas), MAR Express (`mar-express`, 425), Quick and Faster (`quick-and-faster`, 364), Quick Connect (`quick-connect`, 469, one routing group unplaced) and Hashtag Express (`hashtag-express`, 235). They have no logo yet (`logoUrl: null`). Arrive, Flash Express, ShopShip and Track Express are added **disabled**, so merchants don't see them: their test accounts were refused, so they have no areas yet. A second shared platform. About ten
Egyptian carriers (Aman, Arrive, Eissa, Flash Express, Hashtag, Mar Express, Quick & Faster, Quick
Connect, ShopShip, Track Express) run the same backend, built by **Mega Technology** (mega-technology.info; its API is `/api/shipment.php`). Like Accurate,
an admin adds each one from a form and merchants connect, book and track as with any partner. **No
FE change per carrier**: the connect form comes from `fields`, the admin form from `carrierFields`,
the buttons from `capabilities`.

What is different from Accurate, and what the screens must handle:

- **The sender is the sender location.** These carriers are told who sends every parcel and from
  which of *their* areas. That is the order's sender location, its area matched against the
  carrier's area list, the same way the customer's address is. **A sender location whose area the
  carrier does not list cannot be booked**: the preview reports a new problem, `SENDER_AREA`.
- **Whole pounds only.** The carrier's amount field takes no piastres. An amount to collect like
  `450.50` is a new preview problem, `COD_NOT_WHOLE`.
- **No cancel, no print, no exchanges, no refunds.** `capabilities` says so (`cancel: false`,
  `labels: false`, `exchanges: false`, and the new `refunds: false`). Returns follow the per-carrier
  switch, off until an admin turns them on, and are booked **without a refund**.
- **Admin form secrets.** The carrier row holds a *sync account* (a user and password the platform
  needs even to list its areas). Those fields are `SECRET`: sent like text, **never returned**.

---

## Changes to the earlier drops

| Drop | Where | Was | Now |
|---|---|---|---|
| `2026-10-17-accurate-carriers-logos-returns.md` Part 1 §2 / Part 3 §2 | `carrierFields[].kind` | `TEXT` / `BOOLEAN` | also `SELECT` (one of `options`) and `SECRET` (a password: send it like text, never shown back) |
| `2026-10-17-accurate-carriers-logos-returns.md` Part 1 §2 | `GET /api/admin/carriers` rows | `settings` held everything | `settings` never holds a `SECRET` field; new `secretsSet: boolean` says whether they are saved |
| `2026-10-17-accurate-carriers-logos-returns.md` Part 1 §2 | `PATCH /api/admin/carriers/{code}` `settings` | the whole set, replacing the saved one | the same, except a `SECRET` field **left out keeps its saved value** (the screen never has it to send back) |
| `2026-09-26-carriers-regions-orders-shipments.md` Part 4, `2026-10-09-pickup-locations-notifications.md` Part 1 | the booking preview's `problems[].code` | `RECEIVER_PHONE`, `ADDRESS_LINE`, `COD_TOO_HIGH`, `PICKUP_LOCATION` | also `COD_NOT_WHOLE`, `SENDER_AREA` and `REFUND_NOT_ALLOWED` |
| `2026-10-09-pickup-locations-notifications.md` Part 1 | the preview's `pickup.source` | `MAPPED` / `DEFAULT` | also `SENDER_LOCATION` |
| `2026-10-17-accurate-carriers-logos-returns.md` Part 1 §1 | `capabilities` on partners and connections | `labels`, `cancel`, `tracking`, `returns`, `exchanges` | also **`refunds`**: whether a return or exchange through it may hand the customer money. `true` for Bosta and Accurate whenever `returns` or `exchanges` is; always `false` on Mega Technology carriers. Hide the refund field when it is `false` |

---

## 1. Merchant screens

**Connect form.** `GET /api/carriers` lists a Mega Technology partner with two `fields`, both secret:

```json
{ "code": "aman", "fields": [
    { "key": "user",     "kind": "SECRET", "required": true, "label": "API user (not your dashboard login)" },
    { "key": "password", "kind": "SECRET", "required": true, "label": "API password" } ],
  "capabilities": { "labels": false, "cancel": false, "tracking": true, "returns": false, "exchanges": false, "refunds": false } }
```

Show the label as it is: merchants often try their dashboard login, which these carriers refuse.
That refusal is the usual credentials error (`422`).

**Booking preview** (`GET /api/shipments/preview`, and the bulk preview):

- `pickup` is the sender location, as the carrier knows it:
  `{ "locationId": "202", "name": "Giza store", "source": "SENDER_LOCATION" }`. Here `locationId` is the
  carrier's area id and `name` is the sender location's own name. Show "Collected from: Giza store"
  and nothing to pick, because there is no per-connection pickup mapping for these carriers.
- `problems` may hold these, each with its localized `message`:

  | code | when | what the merchant does |
  |---|---|---|
  | `SENDER_AREA` | the order's sender location has an area this carrier does not list | fix the area on the sender location, or ship from another one. `pickup` is `null` and `bookable` is `false` |
  | `COD_NOT_WHOLE` | the amount to collect has piastres | round it to a whole number |

  A `POST /api/shipments` that would hit either is refused with `422` and the same message. Nothing
  is sent to the carrier.

**Shipment screen.**
- Hide **Cancel** and **Print** (`capabilities.cancel` and `.labels` are `false`). The endpoints
  answer `422` if called anyway.
- States arrive by polling only. The timeline's carrier code is the platform's own number where it
  has one (`4` *out for delivery*, `5` *delivered*…), with the Arabic name as the label.

**Returns.** When an admin has turned a carrier's returns on (`capabilities.returns: true`), the
return flow of `2026-10-16-returns-exchanges.md` Part 1 works as for any partner, **except for the refund**: with
`capabilities.refunds: false`, hide the refund field. A return sent with `refundAmount` anyway is
refused with `422` (problem `REFUND_NOT_ALLOWED`, localized message) before any shipment is saved,
and nothing reaches the carrier.

---

## 2. Admin screens

`GET /api/admin/carrier-platforms` now lists a second platform, `MEGA`:

```json
{ "platform": "MEGA", "carrierFields": [
    { "key": "baseUrl",      "kind": "TEXT",    "required": true,  "defaultValue": null },
    { "key": "bookAction",   "kind": "SELECT",  "required": false, "defaultValue": "addBulkShipments" },
    { "key": "sectorsBody",  "kind": "SELECT",  "required": false, "defaultValue": "form" },
    { "key": "returns",      "kind": "BOOLEAN", "required": false, "defaultValue": false },
    { "key": "syncUser",     "kind": "SECRET",  "required": true,  "defaultValue": null },
    { "key": "syncPassword", "kind": "SECRET",  "required": true,  "defaultValue": null } ] }
```

The response does not list a `SELECT` field's options yet, so hard-code these two:
- `bookAction`: `addBulkShipments` or `addShipment`;
- `sectorsBody`: `form` or `json`.

Most carriers keep both defaults. These are support settings, so put them under an "Advanced"
fold.

**Create** (`POST /api/admin/carriers`, `platform: "MEGA"`):

```json
{ "code": "aman", "platform": "MEGA", "nameEn": "Aman", "nameAr": "أمان",
  "settings": { "baseUrl": "https://aman-shipping.com/api/shipment.php",
                "syncUser": "…", "syncPassword": "…" } }
```

- `baseUrl` must be `https://…/api/shipment.php` exactly, with no trailing slash and no query.
- The sync account is an **API** user of that carrier, not a dashboard login.
- The response, and every later `GET /api/admin/carriers`, carries `"secretsSet": true` and no sync
  fields in `settings`.

**Edit** (`PATCH`):
- Render the `SECRET` inputs empty, with a "saved — leave blank to keep" hint when `secretsSet` is
  true.
- Send only what was typed; a blank or left-out secret keeps the saved one.
- Changing the settings or the secrets re-downloads the carrier's areas.

**Errors.** These are the same as for Accurate:
- `400` with `field` naming the setting, for a missing or invalid value (a missing `syncPassword`,
  for example);
- `409` for a duplicate code.

**Area sync** (`POST /api/admin/carriers/{code}/regions/sync`, for any platform):
- `422`, `carrier.syncAccountRejected`: the carrier refused the account the areas are downloaded
  with. Point the admin at the carrier's settings; retrying will not help. Before this, a refused
  login came back as the `502` below, which read as an outage.
- `502`, `carrier.unavailable`: the carrier is down or answered nonsense. Retry later.
- A create or edit never fails for either reason: the carrier is saved, and the sync by hand shows
  what is wrong.

---

## 3. Known limits

- **A booking whose answer is lost cannot be found again.** These carriers have no lookup by our id,
  and Aman books a second parcel for a repeated order id. Such a shipment ends `FAILED` after the
  usual recovery window with failure code `shipment.notConfirmed` ("could not confirm this booking.
  Check its dashboard before booking it again"), never `shipment.notReceived` ("book it again"), and
  the team is notified. Show that message prominently on a failed shipment: the parcel may exist at
  the carrier.

- **A cancel is refused with its own message** (PR #60, `carrier.cancel.notSupported`: "This
  shipping partner cannot cancel a shipment through Rawafid. Ask the shipping partner to cancel
  it."). Still hide **Cancel** by `capabilities.cancel`.
- **Waybill numbers can come back.** Once a parcel is removed on Aman's side, its number goes to the next booking (seen on staging: `AMN78661` was a removed local test parcel's number first).
  Show and search shipments by our id (or order number) first, the waybill second.

## 4. Not built yet

- **Status pushes.** These carriers can push status changes, set up per carrier on their side.
  Until that is built, shipments are kept current by polling only.
- **Exchanges** on these carriers.
- **Refunds on returns.** Not offered until one is proven on a live account.
- **Arrive, Flash Express, ShopShip and Track Express** are on staging but disabled. Each is turned
  on by an admin, with no deploy, once its carrier gives a working API account: a `PATCH` with the
  new sync account (which re-downloads the areas), then `PUT {"enabled": true}`.
