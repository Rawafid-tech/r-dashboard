# Shipment tracking (after booking) — FE contract

**Status: deployed to staging (PR #44, 2026-10-08).** Every payload below was captured from a local
run against the sandbox carrier (2026-10-08), not written by hand. **Bosta's side of tracking has
not been seen live yet**: its webhook payload and state codes come from Bosta's documentation, and
on staging the webhook is still switched off (see §6). Until it's on, shipments move by polling only,
so a state can take up to about 30 minutes to show.

This turns on the tabs `2026-09-26-shipments.md` kept hidden: **Awaiting Pickup, Currently
Shipping, Delivered, Returned**. After booking, a shipment now follows the carrier: picked up, out
for delivery, failed attempts, delivered, or back to the merchant. The order follows how it ended.

---

## Changes to the earlier drops

Everything below overrides what `2026-09-26-shipments.md` and `2026-09-26-orders.md` say. Nothing
else in them changed.

**From `2026-09-26-shipments.md`:**

| Where | Was | Now |
|---|---|---|
| Intro | "Tracking is not built yet: after booking, a shipment stays `BOOKED`" | built — this file |
| §0 "Still hidden" | Awaiting Pickup / Currently Shipping / On Hold / Delivered / Returned | unhide all but *On Hold* (§0 below) |
| Meaning of `BOOKED` | booked | **awaiting pickup**; later states follow (§1) |
| §5 list `status` filter | `BOOKING` \| `BOOKED` \| `FAILED` \| `CANCELLED`, one value | nine values, and it can repeat (§1) |
| §5 counts | four statuses | all nine (§1) |
| §5 cancel | "Bosta only allows this before the parcel is routed" (409 `NOT_ALLOWED`) | still true, **and** we now refuse up front any status but `BOOKED` (409, §5 below) — hide *Cancel shipment* unless `BOOKED` |
| §5 label / batch labels | only `BOOKED` | every status from `BOOKED` on; not `BOOKING`, `FAILED`, `CANCELLED` |
| §6 "cancel a `FAILED` one" | "Only a booked shipment can be cancelled" | "Only a shipment awaiting pickup can be cancelled" — for any status but `BOOKED` |
| §6 "label for a shipment that isn't booked" | "Only booked shipments have labels" | "This shipment has no label: it was never booked, or was cancelled" |
| §6 last paragraph (Shipping partners) | a different Bosta account's key is `409` while the connection has `BOOKING`/`BOOKED` shipments | …or `IN_TRANSIT`/`RETURNING` ones — anything still with the carrier |
| Response shape | — | new fields on every shipment, and `timeline` on the detail (§2) |
| §7 sandbox | booking names only | plus `Courier`, `Bounce`, `Vanish` (§7 below) |

**From `2026-09-26-orders.md`:**

| Where | Was | Now |
|---|---|---|
| Statuses | `PENDING` \| `BOOKED` \| `CANCELLED` | plus **`DELIVERED`** and **`RETURNED`** (§3) |
| §0 "Hide for now" | Awaiting Pickup / … / Delivered / Returned tabs | Orders gets **Delivered** and **Returned** tabs |
| §3 list `status` param | three values | five |
| §3 counts | `{"PENDING":1,"BOOKED":0,"CANCELLED":1}` | `{"PENDING":0,"BOOKED":0,"DELIVERED":1,"RETURNED":1,"CANCELLED":0}` (real) |
| §2 edit / cancel | 409 when cancelled or booked | also 409 when `DELIVERED`; a `RETURNED` order edits and cancels like `PENDING` |
| *Create Shipment* | on `PENDING` orders | on `PENDING` **and `RETURNED`** orders |

`2026-09-26-shipping-partners.md` is unchanged: keep its *Webhook URL* field hidden (§6 below says
why).

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| Shipments tabs + badges (table in §1) | `GET /api/shipments?status=…` (repeatable) · `GET /api/shipments/counts` |
| Shipment detail: status, dates, **timeline** | `GET /api/shipments/{id}` |
| Row badge for a failed delivery attempt | `issue` on every shipment row |
| Orders tabs **Delivered** / **Returned** + badges | `GET /api/orders?status=DELIVERED` · `?status=RETURNED` · `GET /api/orders/counts` |

**Unhide now:** the four tabs above on Shipments, the timeline on the shipment detail, and the
Delivered / Returned tabs on Orders.
**Still hidden:** *On Hold*, *Track* (a public tracking page), *Notify*, pickup scheduling, bulk
booking, returns/exchanges booked by the merchant.

No new permissions: tracking is read with `shipment:read`.

---

## 1. Statuses

A shipment's `status` now has nine values. Our `status` is what tabs and actions key on; the
carrier's own `carrierState` stays secondary text.

| `status` | Meaning | Tab | Can cancel | Label |
|---|---|---|---|---|
| `BOOKING` | waiting on the carrier's answer (minutes) | Booking (usually 0) | no (409) | no |
| `BOOKED` | **awaiting pickup** | Awaiting Pickup | **yes** | yes |
| `IN_TRANSIT` | collected, on its way to the receiver | Currently Shipping | no | yes |
| `RETURNING` | delivery didn't happen; on its way back | Currently Shipping | no | yes |
| `DELIVERED` | the receiver has it — final | Delivered | no | yes |
| `RETURNED` | back with the merchant — final | Returned | no | yes |
| `LOST` | lost or damaged by the carrier | Returned | no | yes |
| `FAILED` | the carrier refused or never received the booking | Failed | no | no |
| `CANCELLED` | called off before pickup | Cancelled | — | no |

- A tab that spans two statuses repeats the param: `GET /api/shipments?status=IN_TRANSIT&status=RETURNING`.
  No `status` means every status.
- `GET /api/shipments/counts` has every status, zeros included. Real:

```json
{"BOOKING":0,"BOOKED":0,"IN_TRANSIT":0,"RETURNING":0,"DELIVERED":1,"RETURNED":1,"LOST":0,"FAILED":0,"CANCELLED":0}
```

Sum the pairs for the two-status tabs.

- **Cancel** is now only for `BOOKED` (awaiting pickup). Anything later returns `409` "Only a
  shipment awaiting pickup can be cancelled". Hide *Cancel shipment* unless `status` is `BOOKED`.
- **Labels** print for every status from `BOOKED` on. `BOOKING`, `FAILED` and `CANCELLED` return 409
  "This shipment has no label: it was never booked, or was cancelled".

---

## 2. The shipment, with tracking

`GET /api/shipments/{id}` — real response for a shipment that had a failed attempt and was then
delivered:

```json
{
  "id": "47e76def-1017-46d7-9e0a-eb6538de975a",
  "status": "DELIVERED",
  "order": { "id": "762cd32b-b450-4adc-bd17-9f07f8fcddfb", "orderNumber": "ORD-100001" },
  "receiverName": "محمد سعيد",
  "receiverPhone": "01012345678",
  "connection": { "id": "953ed7a8-c2d6-45e7-8196-12bd8a10df5d", "name": "Local sandbox",
                  "carrierCode": "sandbox", "carrierNameEn": "Sandbox carrier",
                  "carrierNameAr": "شركة شحن تجريبية", "active": true },
  "trackingNumber": "1791464286306",
  "carrierState": { "code": "45", "label": "Delivered" },
  "district": { "id": "0f0f259e-1b59-42e9-b3f3-2a9d27d22b27", "externalId": "SBX-D-NASR",
                "nameEn": "Nasr City", "nameAr": "مدينه نصر", "method": "DISTRICT" },
  "codAmount": 450.0,
  "failure": null,
  "issue": null,
  "attempts": 1,
  "bookedAt": "2026-10-08T12:58:18.655399Z",
  "pickedUpAt": "2026-10-08T12:58:18.668Z",
  "deliveredAt": "2026-10-08T13:01:18.668Z",
  "returnedAt": null,
  "cancelledAt": null,
  "lastUpdateAt": "2026-10-08T13:01:18.668Z",
  "timeline": [
    { "state": "DELIVERED", "carrierState": { "code": "45", "label": "Delivered" },
      "issue": null, "occurredAt": "2026-10-08T13:01:18.668Z", "source": "WEBHOOK" },
    { "state": "IN_TRANSIT", "carrierState": { "code": "41", "label": "Out for delivery" },
      "issue": null, "occurredAt": "2026-10-08T13:00:18.668Z", "source": "WEBHOOK" },
    { "state": "EXCEPTION", "carrierState": { "code": "47", "label": "Exception" },
      "issue": { "code": "1", "reason": "العميل غير موجود بالعنوان" },
      "occurredAt": "2026-10-08T12:59:18.668Z", "source": "WEBHOOK" },
    { "state": "IN_TRANSIT", "carrierState": { "code": "21", "label": "Picked up from business" },
      "issue": null, "occurredAt": "2026-10-08T12:58:18.668Z", "source": "WEBHOOK" }
  ],
  "createdAt": "2026-10-08T12:58:18.642612Z",
  "updatedAt": "2026-10-08T12:58:18.713814Z"
}
```

New fields (on every shipment, list rows included, except `timeline`):

- **`issue`** — `{code, reason}` while the carrier reports a failed attempt (receiver out, refused,
  postponed, phone off…). **`reason` is the carrier's own text, verbatim**: its language and wording,
  not ours. Show it as a warning badge on the row. It clears itself at the next ordinary state. It
  also appears if the carrier cancels a parcel it has already collected (`code: "48"`, "Terminated"):
  that one needs the merchant to contact the carrier.
- **`attempts`** — delivery attempts so far, as the carrier counts them.
- **`pickedUpAt`, `deliveredAt`, `returnedAt`** — set when reached. A `LOST` shipment has none of
  the last two.
- **`lastUpdateAt`** — when the carrier last reported on it. Null until the first report after
  booking.
- **`timeline`** — **only on `GET /api/shipments/{id}`** (it is `null` on list rows). Every state the
  carrier reported, newest first:
  - `state` is ours: `AWAITING_PICKUP`, `IN_TRANSIT`, `RETURNING`, `EXCEPTION`, `DELIVERED`,
    `RETURNED`, `LOST`, `CANCELLED`, or `IGNORED` (a carrier step that changes nothing here; you may
    hide those). Use it for the icon and the wording.
  - `carrierState` is the carrier's code and its name, as secondary text. Prefer our `state`: Bosta
    names its code 41 "Out for delivery" on the way back too (see the `RETURNING` row below).
  - `source` is `WEBHOOK` (the carrier told us) or `POLL` (we asked). For `POLL`, `occurredAt` is
    when we asked, not when it happened.
  - An entry can be older than the one above it in rare cases (a carrier's message arriving late).
    Keep the server's order.

A returned shipment's timeline (real, from polling):

```json
[
  { "state": "RETURNED", "carrierState": { "code": "46", "label": "Returned to business" },
    "issue": null, "occurredAt": "2026-10-08T12:59:15.019Z", "source": "POLL" },
  { "state": "RETURNING", "carrierState": { "code": "41", "label": "Out for delivery" },
    "issue": null, "occurredAt": "2026-10-08T12:59:00.010Z", "source": "POLL" },
  { "state": "EXCEPTION", "carrierState": { "code": "47", "label": "Exception" },
    "issue": { "code": "8", "reason": "Customer refused the shipment" },
    "occurredAt": "2026-10-08T12:58:45.017Z", "source": "POLL" },
  { "state": "IN_TRANSIT", "carrierState": { "code": "21", "label": "Picked up from business" },
    "issue": null, "occurredAt": "2026-10-08T12:58:30.016Z", "source": "POLL" }
]
```

---

## 3. What happens to the order

| Shipment ends | Order becomes | The merchant can |
|---|---|---|
| `DELIVERED` | **`DELIVERED`** — final | nothing: edit and cancel return 409 |
| `RETURNED` or `LOST` | **`RETURNED`** | edit it, **Create Shipment** again, or cancel it — exactly like `PENDING` |
| `CANCELLED` by the carrier before pickup | `PENDING` | as before |

- `GET /api/orders/counts` now has all five: real
  `{"PENDING":0,"BOOKED":0,"DELIVERED":1,"RETURNED":1,"CANCELLED":0}`.
- Show **Create Shipment** on `RETURNED` orders as well as `PENDING` ones.
- Editing or cancelling a `DELIVERED` order: `409` "This order was delivered and can no longer be
  changed." (ar: "تم توصيل هذا الطلب ولم يعد من الممكن تعديله.").
- An order booked again after a return is `BOOKED` again; its old shipment stays `RETURNED` in the
  order's shipment list (`GET /api/shipments?orderId=`).

---

## 4. How fresh it is

- The carrier pushes each change to us (the webhook) and the screen shows it on the next fetch.
  There's no push to the browser: refetch on focus, or every minute or so on an open detail.
- When a push doesn't come, we ask the carrier every **30 minutes** about shipments we haven't heard
  of in 30 minutes. So the worst case is about an hour; the usual case is the next fetch.
- **On staging today the webhook is off** (§6), so everything moves by the 30-minute poll.

---

## 5. Errors (new or changed)

| Status | When | `detail` (en) |
|---|---|---|
| 409 | cancel a shipment that is not `BOOKED` (in transit, delivered, failed…) | "Only a shipment awaiting pickup can be cancelled" |
| 409 | label for `BOOKING`, `FAILED` or `CANCELLED` | "This shipment has no label: it was never booked, or was cancelled" |
| 409 | edit or cancel a `DELIVERED` order | "This order was delivered and can no longer be changed." |

All localized by `Accept-Language`; `ar` has every one (e.g. the cancel one is
"يمكن إلغاء الشحنة قبل استلامها من شريك الشحن فقط").

---

## 6. The Shipping partners screen

Nothing to add. The webhook is set up **automatically on every booking** (each one tells Bosta where
to push and with what token), so keep the connect form's *Webhook URL* field hidden: the merchant
never pastes one into Bosta's dashboard.

On staging it stays switched off until a live Bosta booking has confirmed Bosta accepts it. Until
then, tracking is by polling only (§4).

---

## 7. Developing without a Bosta account (dev only)

The sandbox carrier now also tracks. Three more receiver first names, on top of the booking ones in
`2026-09-26-shipments.md` §7, each move **one step per poll** (every 30 minutes on a deployed server;
a local run can shorten it with `RAWAFID_SHIPMENTS_TRACKING_CRON` and `RAWAFID_SHIPMENTS_TRACKING_STALE`):

| First name | Steps | Order ends |
|---|---|---|
| `Courier` | picked up → out for delivery → **delivered** | `DELIVERED` |
| `Bounce` | picked up → failed attempt (refused) → returning → **returned** | `RETURNED` |
| `Vanish` | picked up → **lost** | `RETURNED` |
| anyone else | stays awaiting pickup | — |
