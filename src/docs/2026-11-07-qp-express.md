# 2026-11-07 — QP Express

The drop for QP Express, 2026-11-07. Section numbers (§) belong to this part.

- **Part 1 — QP Express**
- **Part 2 — `GOVERNORATE` match method**

---

# Part 1 — QP Express

> Builds on `2026-10-23-wingezz.md` Part 1 (an admin-added own-API carrier whose row holds a sync
> account, with no pickup to choose).

~~**Status: built, not yet deployed.**~~ **Status: deployed to staging (PR #80, 2026-11-07), row
`qp-express` added DISABLED** — merchants don't see it until it's enabled. Its 30 cities synced; "Metro"
and "Sinai outskirts" stay unplaced. Checked against a local stand-in, and read-only against the live
QP API (login, city list, a status read of an unknown parcel). Nothing has been booked on a live
account.

QP Express runs its own API (platform `QP_EXPRESS`). There is **no new API shape**: `fields` and
`capabilities` drive every screen, as for every other carrier.

What is different, and what the screens must handle:

- **Admin-added, like Wingezz.** `GET /api/admin/carrier-platforms` lists `QP_EXPRESS` with two
  carrier fields, `syncUser` and `syncPassword` (both `SECRET`, required): a QP login the backend uses
  to download the city list. They are never returned; the row shows `secretsSet: true`.
- **Connect with a login.** `username` and `password` are both `SECRET`. There is nothing else on the
  form: QP collects from the address it holds for the account, so there is no pickup to choose.
- **Capabilities.** `labels: false`, `cancel: false`, `tracking: true`, `returns: false`,
  `exchanges: false`, `refunds: false`, `pushUrl: false`. QP's API has no cancel and no label, so hide
  both actions; a parcel is cancelled on QP's dashboard.
- **Areas are whole governorates.** QP lists one entry per governorate and nothing finer, plus Sharm
  El Sheikh priced apart from the rest of South Sinai. An order's area therefore lands on its
  governorate as **`address.method: "GOVERNORATE"`** (Part 2), with no picking. An area named Sharm El
  Sheikh lands on Sharm (`DISTRICT`). QP's "outside coverage" entries are left out; a governorate QP
  doesn't list answers `NONE` as usual, with no suggestions.
- **Tracking is polled**, one read per parcel. QP's states: Pending → `BOOKED`, Out for delivery →
  `IN_TRANSIT`, Hold → an issue, Delivered → `DELIVERED`, Undelivered → `RETURNING`, Cancelled →
  `CANCELLED`.
- **Refusals.** An amount QP refuses answers the usual `422 carrier.booking.codAmount`; an unknown
  city the usual address refusal.

---

## 1. Merchant screens

**Connect form.** `GET /api/carriers` lists the QP row with two `fields`:

```json
{ "code": "qp-express", "fields": [
    { "key": "username", "kind": "SECRET", "required": true,
      "label": "Username (your QP Express integration login)" },
    { "key": "password", "kind": "SECRET", "required": true, "label": "Password" } ],
  "capabilities": { "labels": false, "cancel": false, "tracking": true, "returns": false,
                    "exchanges": false, "refunds": false, "pushUrl": false } }
```

Both travel in `credentials`. The Arabic labels come back under `Accept-Language: ar` as usual.
**Test Connection** logs in and reads the city list; it returns no `pickupLocations`. A wrong login
answers the usual `422`.

## 2. Admin screens

Add the carrier from the platform form (`platform: "QP_EXPRESS"`, `settings: {"syncUser": "…",
"syncPassword": "…"}`), then sync its areas with the usual
`POST /api/admin/carriers/{code}/regions/sync`. The admin match preview
(`GET /api/admin/carriers/{code}/regions/resolve`) shows `GOVERNORATE` for an area QP doesn't name.
The logo, enable switch and list work as for any other row.

---

# Part 2 — `GOVERNORATE` match method

> Builds on `2026-09-26-carriers-regions-orders-shipments.md` (address matching, `address.method`,
> `district.method`) and `2026-11-05-reused-numbers-area-aliases.md` Part 2 (`ALIAS`).

| Where | Was | Now |
|---|---|---|
| `2026-09-26-carriers-regions-orders-shipments.md` (`method` table, preview, `district.method`) | `DISTRICT` / `ZONE` / `HEAD` / `ALIAS` / `CHOSEN` / `NONE` | also `GOVERNORATE` |
| `2026-10-08-tracking-bulk-booking.md` Part 1 (bulk preview `address.method`) | the same six | also `GOVERNORATE` |

`address.method` on the preview (single and bulk), `district.method` on a shipment, and `method` on
the admin match preview can now be `GOVERNORATE`: the carrier lists only governorates (QP Express),
and the order's area was not one of its names, so the governorate's own entry is used.

- Treat it like `DISTRICT`: it's matched and needs nothing from the merchant. `address.district` is
  the carrier's entry for the governorate (e.g. "قاهره").
- No other carrier answers it.
