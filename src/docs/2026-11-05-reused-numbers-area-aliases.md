# 2026-11-05 — Reused tracking numbers, and areas matched by other names

Two drops shipped on 2026-11-05. Section numbers (§) belong to each part.

- **Part 1 — A reused tracking number, and a booking held for support**
- **Part 2 — `ALIAS` match method**

---

# Part 1 — A reused tracking number, and a booking held for support

> Builds on `2026-10-23-mega-technology-carriers.md` Part 1 (admin `carrierFields`) and
> `2026-10-08-tracking-bulk-booking.md` Part 1 (the timeline).

**Status: deployed to staging (PR #71).** The flow was tested only against a stand-in carrier,
because a real reuse can't be triggered on purpose. Aman has `reusesNumbers` on.

Aman gives a cancelled parcel's tracking number to a later booking.
- **Old shipment still `BOOKED` here:** Rawafid hadn't heard of the cancel yet, so the old shipment is
  now cancelled automatically and the new one books normally.
- **Otherwise the new booking is held for support** instead of failing, because the parcel does exist
  at the carrier. This covers an old parcel already collected, and a carrier not known to reuse
  numbers.

| Drop | Was | Now |
|---|---|---|
| `2026-10-23-mega-technology-carriers.md` Part 1 | `MEGA` has six `carrierFields` | Seven: `reusesNumbers` (§1) |
| `2026-10-08-tracking-bulk-booking.md` Part 1 | timeline `source` is `WEBHOOK` or `POLL` | Also `BOOKING` (§2) |
| `2026-09-26-carriers-regions-orders-shipments.md` | `failure` only on a `FAILED` shipment | Also on a `BOOKING` one held for support (§3) |

## 1. Admin carrier form

`GET /api/admin/carrier-platforms` lists one more `MEGA` field:
`{ "key": "reusesNumbers", "kind": "BOOLEAN", "required": false, "defaultValue": false }`.
- Show it under "Advanced", labelled "Reuses tracking numbers of cancelled parcels".
- Only Aman is known to reuse numbers; leave it off for the others.

## 2. Timeline

A shipment cancelled because its number went to a later booking gets one entry:

```json
{ "state": "CANCELLED", "carrierState": { "code": "NUMBER_REUSED", "label": null },
  "issue": null, "occurredAt": "…", "source": "BOOKING" }
```

- `label` is null, so write your own text, e.g. "Cancelled: the shipping partner gave its tracking
  number to a later shipment".
- The shipment becomes `CANCELLED` and its order goes back to `PENDING`.
- The team gets the usual `SHIPMENT_CANCELLED_BY_CARRIER` notification.

## 3. A booking held for support

`POST /api/shipments` (and each bulk line) can answer `409 shipment.trackingNumberTaken`, with
`shipmentId` in the body. The English message is "The shipping partner gave this shipment a tracking
number another of your shipments still holds. It stays in booking until support checks both with the
shipping partner."
- The shipment stays `BOOKING`, and its order stays `BOOKED`, so it can't be booked twice.
- Its `failure` is `{ "code": "shipment.trackingNumberTaken", "message": "…" }`.
- Show a `BOOKING` shipment that has a `failure` as "Held for support" with the message, not as
  "Booking…".

---

# Part 2 — `ALIAS` match method

> Builds on `2026-09-26-carriers-regions-orders-shipments.md` (address matching, `address.method`,
> `district.method`).

**Status: deployed to staging (PR #73).** After a re-sync, staging holds the other names for:

| Carrier | Areas | Other names |
|---|---|---|
| Aman | 22 | 40 |
| Eissa | 23 | 41 |
| Hashtag | 7 | 7 |
| Quick and Faster | 2 | 2 |
| Quick Connect | 4 | 5 |

The Mega Technology carriers list other names for many areas: "روكسي" for مصر الجديدة, "العتبة" or
"رمسيس" for وسط البلد, "ناهيا" for كرداسة. An order whose area is one of those names now matches that
area instead of ending as `NONE`.

| Drop | Was | Now |
|---|---|---|
| `2026-09-26-carriers-regions-orders-shipments.md` (`method` table, preview, `district.method`) | `DISTRICT` / `ZONE` / `HEAD` / `CHOSEN` / `NONE` | also `ALIAS` |
| `2026-10-08-tracking-bulk-booking.md` Part 1 (bulk preview `address.method`) | the same five | also `ALIAS` |

## 1. `ALIAS`

`address.method` on the preview (single and bulk) and `district.method` on a shipment can now be
`ALIAS`: the area text is another name the carrier lists for that district.
- Treat it like `DISTRICT`: it's matched and needs nothing from the merchant.
- Show `address.district` as usual, so the merchant sees which area it became: typed "روكسي", shown
  "مصر الجديدة".
- It's tried last, only when no name matches, and only when exactly one of the carrier's areas in
  the governorate has that name. Otherwise the result stays `NONE`.
