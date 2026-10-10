# Shipments (booking an order with a shipping partner) — FE contract

**Status: deployed to staging (PR #43, 2026-09-26)** and tested there against Bosta's staging API
(125/125 checks). Every payload below was captured from real deliveries booked on **Bosta's staging
API**, not written by hand.

This turns on **Create Shipment**. A merchant books a *pending* order through one of their shipping
partner connections, prints the airway bill, and can cancel before pickup. **Tracking is not built
yet**: after booking, a shipment stays `BOOKED` until it is cancelled. Picked up, in transit,
delivered and returned arrive with status sync in the next drop.

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| Order row **Create Shipment** → pick a connection → confirm dialog | `GET /api/shipments/preview?orderId=&connectionId=` |
| Confirm dialog's **district picker** (only when the area didn't match) | `GET /api/shipments/districts?connectionId=&governorateId=&search=` |
| Confirm → **Book** | `POST /api/shipments` |
| Shipments screen, tabs **Booked / Cancelled / Failed** (+ Booking, usually 0) and badges | `GET /api/shipments?status=…` · `GET /api/shipments/counts` |
| An order's shipments (order detail) | `GET /api/shipments?orderId=` |
| Row **Print label** / multi-select **Print labels** | `GET /api/shipments/{id}/label` · `POST /api/shipments/labels` |
| Row **⋯ → Cancel shipment** | `POST /api/shipments/{id}/cancel` |
| Connection picker in the dialog | `GET /api/carrier-connections?active=true` (existing) |

**Unhide now:** *Create Shipment* on pending orders, and a Shipments screen with the four tabs above.
**Still hidden:** *Awaiting Pickup / Currently Shipping / On Hold / Delivered / Returned*, Track,
Notify, bulk booking, and pickup scheduling.

**Permissions:** page `page:shipments`. `shipment:read` covers the list, detail, counts and labels;
`shipment:manage` covers preview, the district picker, booking and cancelling. The owner always has
both. Note that booking doesn't need `order:read`, but your Orders screen does.

**Orders side:** a booked order has the new status **`BOOKED`**, and editing or cancelling it returns
`409`. Cancelling its shipment (or a failed booking) puts it back to `PENDING`. Add a **Booked** tab
to Orders if you want one; `GET /api/orders/counts` already includes `BOOKED`.

---

## 1. The flow

1. The merchant clicks **Create Shipment** on a pending order and picks a connection.
2. Call **preview** (no carrier call, safe to call on every change) and show the result:
   - `address.method` = `DISTRICT` / `ZONE` / `HEAD`: we matched the order's area. Show
     `address.district` (e.g. "الحي السادس (مدينه نصر)").
   - `address.method` = `NONE`: the area matched nothing we're sure of. Show `address.suggestions`
     (possibly empty) plus the **district picker**, and call preview again with `districtId`. It then
     says `CHOSEN`.
   - `problems[]`: things the carrier would refuse, such as a phone that isn't an Egyptian mobile.
     Show their `message`s and link to **edit the order**.
   - `quota`: `used` / `limit` this month. `remaining = 0` means upgrade.
   - Enable **Book** only when `bookable` is `true`.
3. **Book** with the same `orderId`, `connectionId` and `districtId` (if one was picked).
   - `201`: booked. Show the tracking number and offer **Print label**.
   - `202`: the carrier didn't answer in time. The shipment is `BOOKING`, and we find out within
     minutes whether it went through: usually within 5, and up to about 15 before one that never
     arrived turns `FAILED` (the carrier's search can lag its create, so we ask more than once).
     Show "confirming…" and poll `GET /api/shipments/{id}`.
     Don't book again: the order stays frozen until we know.

We check everything we can **before** sending, because Bosta emails the merchant a copy of every
booking it refuses. Nothing refused in preview is ever sent.

---

## 2. `GET /api/shipments/preview?orderId=&connectionId=[&districtId=]`

Real response:

```json
{
  "order": { "id": "adff2f83-ce36-4e66-ac63-888dc4b553cd", "orderNumber": "ORD-100001",
             "receiverName": "Rawafid Test", "receiverPhone": "01000000000",
             "area": "مدينة نصر", "codAmount": 450.00 },
  "connection": { "id": "f2677deb-1c19-4f7b-b7eb-a8de21c6c3c5", "name": "Bosta staging",
                  "carrierCode": "bosta", "carrierNameEn": "Bosta", "carrierNameAr": "بوسطة",
                  "active": true },
  "address": {
    "method": "ZONE",
    "district": { "id": "e78f5716-a1b2-46f2-895c-89372087a465", "externalId": "vJrVlW-OjHO",
                  "nameEn": "ElHay 06 (Nasr City)", "nameAr": "الحي السادس (مدينه نصر)",
                  "zoneNameEn": "Nasr City", "zoneNameAr": "مدينه نصر",
                  "cityNameEn": "Cairo", "cityNameAr": "القاهره" },
    "suggestions": []
  },
  "problems": [],
  "quota": { "planCode": "FREE", "limit": 50, "used": 0, "remaining": 50 },
  "bookable": true
}
```

- `quota` is `null` when the company has no active subscription (expired past grace). Nothing can be
  booked: send them to Subscription.
- A problem looks like `{ "code": "RECEIVER_PHONE", "message": "The receiver's phone must be an
  Egyptian mobile number for this shipping partner" }`. The codes are `RECEIVER_PHONE`, `ADDRESS_LINE`
  (too short: add street and building) and `COD_TOO_HIGH` (over 30,000 EGP).
- Same `404` / `409` / `422` as booking for an order that isn't pending, or a connection that isn't
  usable (§6).

---

## 3. `GET /api/shipments/districts?connectionId=&governorateId=&search=`

The carrier's districts that it **delivers to** in that governorate, up to 100, matched on Arabic or
English names (spelling-tolerant: "حدائق" finds Bosta's "حداءق"). Real row (`search=المعادي`):

```json
[{ "id": "0d08062a-f1fb-4297-ba60-c13fa5c2afbf", "externalId": "uefxoWkWSfdT2BRyLNC9J",
   "nameEn": "Maadi Gardens Compound Katameya", "nameAr": "كمبوند معادي جاردنز القطاميه",
   "zoneNameEn": "ElKhalifa", "zoneNameAr": "الخليفه",
   "cityNameEn": "Cairo", "cityNameAr": "القاهره" }]
```

Show `nameAr — zoneNameAr` (or the English pair). Send the picked `id` as `districtId`.

---

## 4. `POST /api/shipments`

```json
{ "orderId": "adff2f83-ce36-4e66-ac63-888dc4b553cd",
  "connectionId": "f2677deb-1c19-4f7b-b7eb-a8de21c6c3c5",
  "districtId": null }
```

Real `201`:

```json
{
  "id": "005a108f-2416-4269-a7f7-bbadcdeae130",
  "status": "BOOKED",
  "order": { "id": "adff2f83-ce36-4e66-ac63-888dc4b553cd", "orderNumber": "ORD-100001" },
  "receiverName": "Rawafid Test",
  "receiverPhone": "01000000000",
  "connection": { "id": "f2677deb-1c19-4f7b-b7eb-a8de21c6c3c5", "name": "Bosta staging",
                  "carrierCode": "bosta", "carrierNameEn": "Bosta", "carrierNameAr": "بوسطة",
                  "active": true },
  "trackingNumber": "3379791194",
  "carrierState": { "code": "10", "label": "Pickup requested" },
  "district": { "id": "e78f5716-a1b2-46f2-895c-89372087a465", "externalId": "vJrVlW-OjHO",
                "nameEn": "ElHay 06 (Nasr City)", "nameAr": "الحي السادس (مدينه نصر)",
                "method": "ZONE" },
  "codAmount": 450.00,
  "failure": null,
  "bookedAt": "2026-09-26T19:50:17.807589Z",
  "cancelledAt": null,
  "createdAt": "2026-09-26T19:50:15.264511Z",
  "updatedAt": "2026-09-26T19:50:17.807599Z"
}
```

- **What's sent:**
  - `cod` is the order's COD amount, or 0 for prepaid (both confirmed on Bosta staging).
  - Weight is the order's total, and the item count is the sum of line quantities.
  - Notes are the delivery notes, landmark, street and order number.
  - The pickup location is the **connection's** (a merchant shipping from two warehouses uses two
    connections).
- **`carrierState`** is Bosta's own label, verbatim, shown as secondary text. Our `status` is what
  tabs and actions key on.
- **`district.method`:** `DISTRICT` / `ZONE` / `HEAD` means matched from the area text; `CHOSEN` means
  picked by the merchant.
- **Refused:** the carrier refusing (for example, the merchant's Bosta account has no active bundle)
  returns `422` with `shipmentId` and `reason: "REJECTED"`. That shipment is `FAILED` with a `failure`
  message, and the order is back to `PENDING` to fix and book again.

---

## 5. List, detail, cancel, labels

- **List:** `GET /api/shipments` returns a standard `PageResponse` of the shape above.
  - Filters: `status` (`BOOKING` | `BOOKED` | `FAILED` | `CANCELLED`), `connectionId`, `orderId`,
    `from` / `to` (created time; `to` exclusive), and `search` (order number, tracking number,
    receiver name or phone).
  - Sort: `CREATED_AT` (default) or `BOOKED_AT`, plus `direction`, `page` and `size` (≤ 100).
- **Counts:** `GET /api/shipments/counts` returns every status, zeros included:
  `{"BOOKING":0,"BOOKED":3,"FAILED":0,"CANCELLED":1}`.
- **Detail:** `GET /api/shipments/{id}`. A failed shipment carries
  `"failure": { "code": "carrier.booking.accountNotReady", "message": "…" }` in the request's language.
- **Cancel:** `POST /api/shipments/{id}/cancel` returns the shipment `CANCELLED` with `cancelledAt`.
  - It cancels at Bosta and puts the order back to `PENDING`.
  - Cancelling again returns it unchanged.
  - Bosta only allows this **before the parcel is routed**. After that you get `409` with
    `reason: "NOT_ALLOWED"`, and the shipment stays `BOOKED`.
- **Label:** `GET /api/shipments/{id}/label` returns `application/pdf` (inline, `label-<tracking>.pdf`).
  - Open it in a new tab or print it.
  - The size (A6 label printer or A4) and language come from the connection's settings.
  - Only for `BOOKED` shipments.
- **Batch labels:** `POST /api/shipments/labels` with `{"shipmentIds": [...]}` returns one PDF, in the
  order given. It takes 1 to 50 `BOOKED` shipments of **one** connection, so group a multi-select by
  connection.

---

## 6. Errors

| Status | When | `detail` (en) |
|---|---|---|
| 400 | bad batch: empty, over 50, or mixed connections | "Choose between 1 and 50 shipments booked through the same connection" |
| 404 | unknown shipment, or another company's | "Shipment not found" |
| 404 | unknown order, or another company's | "Order not found" |
| 409 | order not pending (cancelled, or already booked) | "Only a pending order can be booked. This one is cancelled or already booked." |
| 409 | month's allowance used up; the body has `limit` | "You have booked all 50 shipments your plan allows this month. Upgrade your plan to book more." |
| 409 | no active subscription | "Your subscription has ended. Renew it to book shipments." |
| 409 | cancel while still `BOOKING` | "The shipping partner has not confirmed this shipment yet. Try again in a few minutes." |
| 409 | cancel a `FAILED` one | "Only a booked shipment can be cancelled" |
| 409 | the carrier won't cancel now (`reason: NOT_ALLOWED`) | "The shipping partner no longer allows cancelling this shipment: it has already been picked up or routed" |
| 409 | label for a shipment that isn't booked | "Only booked shipments have labels" |
| 422 | area didn't match; the body has `suggestions[]` | "The shipping partner does not recognise this area. Choose the district from its list." |
| 422 | the carrier would refuse; the body has `problems[]` (codes) | the first problem's message |
| 422 | the picked `districtId` isn't a deliverable one of that governorate | "Choose a district from the shipping partner's list for this governorate" |
| 422 | connection not yours, switched off, or its carrier is disabled (`reason: CONNECTION_UNAVAILABLE`) | "Choose one of your active shipping partner connections" |
| 422 | the carrier refused it (`reason: REJECTED`, `shipmentId`) — e.g. no Bosta bundle | "Your account with the shipping partner cannot create shipments yet. Activate a shipping plan in the partner's dashboard, then try again." |
| 422 | the carrier rejected the saved key (`reason: CREDENTIALS`) | "The shipping partner rejected this connection's API key. Update it under Shipping partners; cancelling shipments needs a key with full access." |

All localized by `Accept-Language` (`ar` has every one). The allowance counts bookings made this
**calendar month in Cairo time**. A shipment cancelled before pickup doesn't count, and neither does a
failed one.

On the **Shipping partners** screen, two connection edits now answer `409` while shipments depend on
the connection: deleting one that has booked anything, and saving a key of a *different* Bosta
account while it has `BOOKING`/`BOOKED` shipments (a rotated key of the same account is fine). See
the corrections in `2026-09-26-shipping-partners.md`.

---

## 7. Developing without a Bosta account (dev only)

The `sandbox` carrier books too. The **receiver's first name** chooses the outcome:

| First name | Result |
|---|---|
| `Refused` | 422: the carrier doesn't know the address |
| `Unready` | 422: the account can't book yet |
| `Outage` | 202 `BOOKING`, then `FAILED` after about 15 minutes (never arrived) |
| `Lost` | 201: the answer was lost, then found again by its reference |
| `Slow` | 202 `BOOKING`, then `BOOKED` a few minutes later |
| `Echo` | 201: answered as a duplicate, then found by its reference |
| `Garbled` | 202 `BOOKING`, then `BOOKED` a few minutes later |
| `Collected` | 201, but cancelling returns 409 `NOT_ALLOWED` |
| anyone else | 201 |

Sandbox labels are placeholder PDFs, not real airway bills.
