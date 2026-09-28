# Orders (the merchant's order book) — FE contract

**Status: deployed to staging (PRs #40 + #41, 2026-09-26)** and smoke-tested there (32/32 checks).
Every payload below was captured from a local run (2026-09-26), not written by hand.

This is the **Orders** screen: taking an order by hand (Add Order), the list with its tabs, editing
and cancelling. **No carrier is involved yet** — booking an order with a shipping partner
("Create Shipment"), labels and tracking come in the next drop.

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| Tabs **Pending** / **Cancelled** / **All** + badges | `GET /api/orders?status=…` · `GET /api/orders/counts` |
| Filters row (order date, pickup location, destination, value min/max, payment method, search) | query params on `GET /api/orders` (§3) |
| **Add Order** step 1 (receiver + address) and step 2 (order details, products, boxes) → Save | `POST /api/orders` — one request, sent at the end |
| Row click / **Edit** | `GET /api/orders/{id}` then `PUT /api/orders/{id}` |
| Row **⋯ → Cancel** | `POST /api/orders/{id}/cancel` |
| Pickup location dropdown | `GET /api/sender-locations?status=ACTIVE` (existing) |
| Governorate dropdown / district type-ahead | `GET /api/public/geo/governorates` · `GET /api/public/geo/areas` (existing) |
| Product picker in the products table | `GET /api/products?search=` (existing) — copy its fields into the line |
| Box type picker | `GET /api/shipping-boxes` (existing) — copy its dimensions into the package |

**Hide for now** (nothing behind them yet): *Create Shipment*, *Awaiting Pickup / Currently Shipping
/ On Hold / Delivered / Returned* tabs, *Print*, *Notify*, *Tools*, *Map View*, *Upload Multiple
Orders*, *Brands*, per-line *Tax*, and *Adjust Declared Package Value*.

**Not for Egypt** (drop them from the form): *Short Address Code* and *Secondary Address Number*
(Saudi national-address fields). ZIP is optional.

**Permissions:** page `page:orders`; `order:read` for the list/detail/counts, `order:manage` for
create/edit/cancel. The owner always passes both.

---

## 1. `POST /api/orders` → `201`

Real request:

```json
{
  "orderNumber": "",
  "receiver": {
    "firstName": "محمد", "lastName": "سعيد",
    "phone": "01012345678", "altPhone": "01198765432", "email": "customer@example.com"
  },
  "address": {
    "countryCode": "EG",
    "governorateId": "de98a17e-dc31-5a16-9d9c-6401a3c6a273",
    "area": "مدينة نصر",
    "addressLine": "12 شارع مكرم عبيد، مدينة نصر",
    "street": "شارع مكرم عبيد", "buildingNumber": "12", "floor": "3", "apartment": "7",
    "landmark": "بجوار مسجد الرحمن"
  },
  "payment": { "method": "COD", "orderValue": 450 },
  "invoiceNumber": "INV-2026-0911",
  "description": "ملابس",
  "deliveryNotes": "اتصل قبل الوصول",
  "items": [
    { "name": "قميص قطن - أزرق", "sku": "SH-BL-M", "unitPrice": 200, "quantity": 2 },
    { "name": "جوارب", "unitPrice": 50, "quantity": 1 }
  ],
  "packages": [
    { "boxName": "صندوق هدايا", "lengthCm": 30, "widthCm": 20, "heightCm": 10, "weightKg": 1.5 }
  ]
}
```

Real response:

```json
{
  "id": "a12fc4b2-bad6-4614-9aa3-2a8d5dec72b7",
  "orderNumber": "ORD-100001",
  "status": "PENDING",
  "source": "MANUAL",
  "orderDate": "2026-09-26T15:06:34.265305Z",
  "senderLocation": { "id": "9310ba6a-c545-4bfb-b567-3f870f0e99f1", "name": "Main warehouse" },
  "receiver": { "firstName": "محمد", "lastName": "سعيد", "phone": "01012345678",
                "altPhone": "01198765432", "email": "customer@example.com" },
  "address": {
    "countryCode": "EG",
    "governorate": { "id": "de98a17e-dc31-5a16-9d9c-6401a3c6a273", "code": "EG-C",
                     "nameEn": "Cairo", "nameAr": "القاهرة" },
    "area": "مدينة نصر",
    "addressLine": "12 شارع مكرم عبيد، مدينة نصر",
    "street": "شارع مكرم عبيد", "buildingNumber": "12", "floor": "3", "apartment": "7",
    "landmark": "بجوار مسجد الرحمن", "postalCode": null, "latitude": null, "longitude": null
  },
  "payment": { "method": "COD", "currency": "EGP", "orderValue": 450.00, "codAmount": 450.00 },
  "invoiceNumber": "INV-2026-0911",
  "description": "ملابس",
  "deliveryNotes": "اتصل قبل الوصول",
  "items": [
    { "name": "قميص قطن - أزرق", "sku": "SH-BL-M", "unitPrice": 200.00, "quantity": 2,
      "lineTotal": 400.00 },
    { "name": "جوارب", "sku": null, "unitPrice": 50.00, "quantity": 1, "lineTotal": 50.00 }
  ],
  "itemsTotal": 450.00,
  "packages": [
    { "boxName": "صندوق هدايا", "lengthCm": 30.00, "widthCm": 20.00, "heightCm": 10.00,
      "weightKg": 1.500 }
  ],
  "totalWeightKg": 1.500,
  "cancelledAt": null,
  "createdAt": "2026-09-26T15:06:34.271011Z",
  "updatedAt": "2026-09-26T15:06:34.271011Z"
}
```

Field rules:

- **`orderNumber`** — blank or omitted → the next `ORD-100001`, `ORD-100002`, … for your company.
  Typed → kept as typed; must be unused in your company, case-insensitively (409).
- **`orderDate`** — omitted → now.
- **`senderLocationId`** — omitted → your **default** sender location. Must be one of your
  **active** locations (422 otherwise). A company with no sender location at all gets 422 on every
  create — send the merchant to add one first.
- **`receiver`** — `firstName` and `phone` required. Phones are digits with an optional leading `+`,
  8–15 long.
- **`address`** — `countryCode` (only `EG` today), `governorateId`, `area`, `addressLine` required.
  **`area` is free text**: offer the areas type-ahead, but whatever the merchant types is kept. Send
  latitude and longitude together or not at all.
- **`payment`**:
  - `method` = `COD` | `PREPAID`, `orderValue` required, `currency` defaults to `EGP`.
  - `COD`: `codAmount` is what the courier collects. Omitted → `orderValue`. Must end up **above
    zero** — a COD order worth 0 is refused; make it PREPAID.
  - `PREPAID`: **do not send** `codAmount` (400 if you do).
- **`items`** — optional, up to 100. Each line is **a copy**: when the merchant picks a catalog
  product, fill `name`, `sku`, `unitPrice` from it; the order keeps that copy even if the product
  changes later. Lines can also be typed with no product at all. `lineTotal` and `itemsTotal` are
  computed.
- **`packages`** — **at least one**, up to 20. Dimensions in cm (≤ 999.99, 2 decimals), weight in kg
  (≤ 999.999, 3 decimals). When a box preset is picked, copy its dimensions and send its name as
  `boxName`. `totalWeightKg` is the sum. "Boxes count" on the screen = the number of packages you
  send.

Numbers come back at their column scale (`450.00`, `1.500`, coordinates `30.044400`) — format them
for display yourself. Timestamps are kept to **microseconds**: an `orderDate` sent as
`…T10:00:00.123456789Z` comes back, and reads back, as `…T10:00:00.123456Z`.

---

## 2. Edit, get, cancel

- **`GET /api/orders/{id}`** → the same shape as §1.
- **`PUT /api/orders/{id}`** → same body as create; **replaces the whole order**, lines and packages
  included (send them all). Blank `orderNumber`, omitted `senderLocationId`, omitted `orderDate` keep
  the current values. `409` once cancelled.
- **`POST /api/orders/{id}/cancel`** → the order with `"status": "CANCELLED"` and `cancelledAt`.
  Cancelling again returns it unchanged (not an error). A cancelled order stays readable and cannot
  be edited. There is **no delete**.

---

## 3. List — `GET /api/orders`

Standard `PageResponse`. Params (all optional):

| param | meaning |
|---|---|
| `status` | `PENDING` \| `CANCELLED` (omit for All) |
| `search` | order number, receiver name, phone or alt phone (contains) |
| `governorateId` | destination |
| `senderLocationId` | pickup location |
| `paymentMethod` | `COD` \| `PREPAID` |
| `from`, `to` | order date, ISO-8601 instants; `from` inclusive, `to` exclusive |
| `minValue`, `maxValue` | order value range |
| `page`, `size` (≤ 100), `sort` = `ORDER_DATE` (default) \| `CREATED_AT` \| `ORDER_VALUE`, `direction` (default `DESC`) | |

Real row:

```json
{
  "id": "a12fc4b2-bad6-4614-9aa3-2a8d5dec72b7",
  "orderNumber": "ORD-100001",
  "status": "PENDING",
  "orderDate": "2026-09-26T15:06:34.265305Z",
  "senderLocation": { "id": "9310ba6a-c545-4bfb-b567-3f870f0e99f1", "name": "Main warehouse" },
  "receiverName": "محمد سعيد",
  "receiverPhone": "01012345678",
  "governorate": { "id": "de98a17e-dc31-5a16-9d9c-6401a3c6a273", "code": "EG-C",
                   "nameEn": "Cairo", "nameAr": "القاهرة" },
  "area": "مدينة نصر",
  "paymentMethod": "COD",
  "currency": "EGP",
  "orderValue": 450.00,
  "codAmount": 450.00,
  "totalWeightKg": 1.500,
  "createdAt": "2026-09-26T15:06:34.271011Z"
}
```

Rows don't carry lines or packages — open the order for those.

**`GET /api/orders/counts`** → every status, zeros included: `{"PENDING": 1, "CANCELLED": 1}`. The
"All" badge is the sum.

---

## 4. Errors

| Status | When | `detail` (en) |
|---|---|---|
| 400 | bean validation — body has `errors[]` with `name` as a **path** (`receiver.phone`, `packages[0].weightKg`, `address.coordinatePairComplete`) | "Request validation failed" |
| 400 | unknown governorate / not in that country | "Choose a governorate from the list for the selected country" |
| 400 | country not served | "We do not deliver to this country yet" |
| 400 | COD amount missing/zero, or an amount on PREPAID | "A cash-on-delivery order needs an amount above zero to collect; a prepaid order has none" |
| 400 | no packages | "Add at least one package with its dimensions and weight" |
| 404 | unknown order, or another company's | "Order not found" |
| 409 | order number taken | "You already have an order with this number" |
| 409 | editing a cancelled order | "This order is cancelled and can no longer be changed" |
| 409 | someone else saved or cancelled the order between your read and your save — reload it and let them retry | "This order was changed by someone else at the same time. Reload it and try again." |
| 422 | pickup location not yours / inactive / none at all | "Choose an active pickup location from your sender locations" |

All localized by `Accept-Language` (`ar` has every one).
