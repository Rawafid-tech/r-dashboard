# Booking several orders at once ("With My Rates") + the Create Shipment wizard — FE contract

**Status: deployed to staging (PR #45, 2026-10-08)** and tested there against Bosta's staging API.
A batch of three, two booked on Bosta and one needing a district, answered in 4.1 seconds. The
payloads below were captured from a local run against the sandbox carrier, not written by hand.
Bosta's rows look the same, with `carrierCode: "bosta"`.

This turns on two things:
- **Pending orders → Create Shipment → With My Rates**: a modal listing the selected orders. Each row
  has from → to, a delivery company, the box count and weight. The footer shows the plan allowance
  used/left, and **Create Shipment** books them all.
- The **Create Shipment** wizard (Address → Shipment details → book): it creates the order, then
  opens the same modal with that one order.

Rawafid only books on the merchant's **own** carrier contracts, so there are **no prices**.
- Hide the modal's *Price* column.
- The wizard has no *Shipping Rates* step with carrier prices.
- Leave out the *Automatic* option next to *With My Rates*. That menu has a single entry, or goes
  straight to the modal.

---

## Changes to the earlier drops

Almost everything here is new. Booking one order the old way (`GET /api/shipments/preview` +
`POST /api/shipments`, `2026-09-26-shipments.md`) is unchanged and still works. These are the lines
in earlier drops that are now out of date:

| Drop | Where | Was | Now |
|---|---|---|---|
| `2026-09-26-shipments.md` | §0 "Still hidden" | "…, bulk booking, and pickup scheduling" | bulk booking is built (this file); pickup scheduling is still hidden |
| `2026-10-08-tracking.md` | §0 "Still hidden" | "…, pickup scheduling, bulk booking, …" | bulk booking is built (this file) |
| `2026-10-08-tracking.md` | status line, §4, §6 | "on staging the webhook is still switched off" | **switched on for staging on 2026-10-08.** Bosta accepted it on a real booking. Bosta's test system never moves a delivery, though, so states on staging still come from the 30-minute poll. Nothing changes in the UI |
| `2026-09-26-orders.md` | §2 Edit | edit = the whole order with `PUT /api/orders/{id}` | still true; there is also a **box-only** edit, `PUT /api/orders/{id}/packages` (§3 below) |

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| Pending orders, multi-select (or a row's ⋯) → **Create Shipment → With My Rates** → the modal | `POST /api/shipments/preview` with every selected order (§1) |
| Modal row: **Select Delivery Company** | `GET /api/carrier-connections?active=true` (existing) for the list. On change, post the preview again |
| Modal row: from → to, **Box Count**, **Box Weight** | from the preview row (§1) |
| Modal row: ✏️ next to Box Count | `GET /api/orders/{id}` for the current boxes, then `PUT /api/orders/{id}/packages` (§3), then preview again |
| Modal row: 🗑 | drop the row on the FE; nothing to call |
| Modal row: district picker (only for an area the carrier didn't recognise) | `GET /api/shipments/districts?connectionId=&governorateId=&search=` (existing). Put the pick in the row's `districtId` |
| Footer: *Shipments to be used* / *Available* | `quota.needed` / `quota.remaining` from the preview |
| Footer: **Create Shipment** | `POST /api/shipments/bulk` (§2) |
| **Create Shipment** wizard steps 1–2 | `POST /api/orders` (existing; `2026-09-26-orders.md`) |
| Wizard step 3 | the modal above, with the one new order |

**Permissions:** both new shipment endpoints need `shipment:manage`, like single booking. The box edit
needs `order:manage`. The owner always passes.

---

## 1. `POST /api/shipments/preview` → `200`

This is read-only: it asks the carrier nothing and books nothing. Post it again whenever a row
changes (its company, its district, its boxes). It's a POST only because the list goes in the body.

```json
{
  "lines": [
    { "orderId": "b35e65e4-…", "connectionId": "1fd2987b-…" },
    { "orderId": "ec14eb8b-…", "connectionId": "1fd2987b-…" },
    { "orderId": "994ea74b-…" }
  ]
}
```

- **Rows:** 1 to 50. Each order can appear only once; a repeat gives a 422 (§4).
- **`connectionId`:** optional. Leave it out until the merchant picks a company for that row.
- **`districtId`:** optional. Send it only after the merchant picks one for that row (see
  `address.method` below).

Response (real; the first row's order had its boxes edited to two first):

```json
{
  "lines": [
    {
      "orderId": "b35e65e4-d179-4c09-abcb-e57cec3fb3e1",
      "order": {
        "id": "b35e65e4-d179-4c09-abcb-e57cec3fb3e1",
        "orderNumber": "ORD-100001",
        "receiverName": "محمد سعيد",
        "receiverPhone": "01012345678",
        "area": "مدينة نصر",
        "codAmount": 450.00
      },
      "from": {
        "senderLocationId": "a511cd0b-3434-4ab1-bc43-3fbe87ae81ed",
        "name": "Main",
        "governorate": { "id": "de98a17e-…", "code": "EG-C", "nameEn": "Cairo", "nameAr": "القاهرة" }
      },
      "to": {
        "governorate": { "id": "de98a17e-…", "code": "EG-C", "nameEn": "Cairo", "nameAr": "القاهرة" },
        "area": "مدينة نصر"
      },
      "packagesCount": 2,
      "totalWeightKg": 5.000,
      "connection": {
        "id": "1fd2987b-9aa2-4311-815a-de648e73833c",
        "name": "Local sandbox",
        "carrierCode": "sandbox",
        "carrierNameEn": "Sandbox carrier",
        "carrierNameAr": "شركة شحن تجريبية",
        "active": true
      },
      "address": {
        "method": "DISTRICT",
        "district": {
          "id": "0f0f259e-…", "externalId": "SBX-D-NASR",
          "nameEn": "Nasr City", "nameAr": "مدينه نصر",
          "zoneNameEn": "Nasr City", "zoneNameAr": "مدينه نصر",
          "cityNameEn": "Cairo", "cityNameAr": "القاهره"
        },
        "suggestions": []
      },
      "problems": [],
      "bookable": true,
      "error": null
    },
    {
      "orderId": "ec14eb8b-a64c-4fa3-8f05-7fdf475daf06",
      "order": { "id": "ec14eb8b-…", "orderNumber": "ORD-100002", "receiverName": "محمد سعيد",
                 "receiverPhone": "01012345678", "area": "المندره", "codAmount": 450.00 },
      "from": { "senderLocationId": "a511cd0b-…", "name": "Main",
                "governorate": { "id": "de98a17e-…", "code": "EG-C", "nameEn": "Cairo", "nameAr": "القاهرة" } },
      "to": {
        "governorate": { "id": "6d13f16d-…", "code": "EG-ALX", "nameEn": "Alexandria", "nameAr": "الإسكندرية" },
        "area": "المندره"
      },
      "packagesCount": 1,
      "totalWeightKg": 1.500,
      "connection": { "id": "1fd2987b-…", "name": "Local sandbox", "…": "…" },
      "address": {
        "method": "NONE",
        "district": null,
        "suggestions": [
          { "id": "eb01dfe7-…", "externalId": "SBX-D-MANDARA-N", "nameEn": "ElMandarah Bahri", "nameAr": "المندره بحري",
            "zoneNameEn": "ElMontazah", "zoneNameAr": "المنتزه", "cityNameEn": "Alexandria", "cityNameAr": "الاسكندريه" },
          { "id": "bdc1529a-…", "externalId": "SBX-D-MANDARA-S", "nameEn": "ElMandarah Qebli", "nameAr": "المندره قبلي",
            "zoneNameEn": "Qesm ElRaml", "zoneNameAr": "قسم الرمل", "cityNameEn": "Alexandria", "cityNameAr": "الاسكندريه" }
        ]
      },
      "problems": [],
      "bookable": false,
      "error": null
    },
    {
      "orderId": "994ea74b-0ac0-49ee-9067-19e45785d6f9",
      "order": { "id": "994ea74b-…", "orderNumber": "ORD-100003", "…": "…" },
      "from": { "…": "…" },
      "to": { "…": "…" },
      "packagesCount": 1,
      "totalWeightKg": 1.500,
      "connection": null,
      "address": null,
      "problems": [],
      "bookable": false,
      "error": null
    }
  ],
  "quota": { "planCode": "FREE", "limit": 50, "used": 0, "remaining": 50, "needed": 1 }
}
```

Rows come back in the order you sent them. For each row:

| Field | Show it as |
|---|---|
| `order.orderNumber` | the row title (`1. ORD-100001`) |
| `from.governorate` → `to.governorate` | *Cairo → Alexandria*. Use `nameAr` or `nameEn` to match the UI language; both are always present. `from.name` is the sender location's name if you want it as a tooltip |
| `packagesCount` | **Box Count** |
| `totalWeightKg` | **Box Weight** (the sum of all boxes) |
| `connection` | the row's selected company; `null` until one is chosen |
| `address.method` | `DISTRICT` / `ZONE` / `HEAD`: matched, nothing to do. `CHOSEN`: the `districtId` you sent. `NONE`: the carrier doesn't know this area. Show `address.suggestions` plus the district picker, then preview again with the pick as `districtId` |
| `problems[]` | what the carrier would refuse (`code` + localized `message`), e.g. a landline instead of a mobile. Link to the order's edit |
| `bookable` | `true` = this row would be sent. Mark rows that aren't |
| `error` | With `order: null`: the order itself can't be booked (deleted, another company's, cancelled, already booked). Show `error.message` and offer 🗑. With an `order`: only the chosen company failed (e.g. the connection was disabled, `carrier.booking.connectionUnavailable`). The row still shows the order, from/to and boxes, so let the merchant pick another company |

**Footer:**
- *Shipments to be used* = `quota.needed`, the rows that are `bookable` right now.
- *Available* = `quota.remaining`.
- If `needed > remaining`, booking still goes ahead: it books the **first** rows that fit, in the
  order you send them, and refuses the rest (§2). Warn before submitting, and put the urgent orders
  first.
- `quota: null` means there is no active subscription, so nothing can be booked; link to Billing.

**From** is the sender location saved on the order. Bosta actually collects from the pickup location
chosen on the *connection* (`2026-09-26-shipping-partners.md`), which can differ. This is shown as
information only.

---

## 2. `POST /api/shipments/bulk` → `200`

```json
{
  "lines": [
    { "orderId": "b35e65e4-…", "connectionId": "1fd2987b-…" },
    { "orderId": "ec14eb8b-…", "connectionId": "1fd2987b-…" },
    { "orderId": "a04a9fc7-…", "connectionId": "1fd2987b-…", "districtId": null }
  ]
}
```

- **Rows:** 1 to 50, each order once.
- **`connectionId`:** **required** on every row. Unlike the preview, a missing one is a `400`.
- **`districtId`:** as in single booking.

**How it books:**
- Each row is booked exactly as `POST /api/shipments` would book it, a few at a time.
- One row's refusal never stops the others.
- The response is always **200**, with one result per row, in the order you sent them.
- Rows past the month's allowance left **when the batch starts** are refused by position (the last
  ones) with `shipment.quotaReached`.
- **Time:** a full batch of 50 takes about 25 seconds when Bosta answers normally. When Bosta is
  slow, the batch stops starting new rows after 15 seconds and returns those rows unsent
  (`shipment.bulk.notAttempted`, below). The answer always arrives within about a minute. Keep the
  button busy until it does.

Response (real: one booked, one needing a district, one the carrier refused):

```json
{
  "results": [
    {
      "orderId": "b35e65e4-d179-4c09-abcb-e57cec3fb3e1",
      "outcome": "BOOKED",
      "shipment": {
        "id": "0a1388c0-e288-41b3-b773-9e9d3213976b",
        "status": "BOOKED",
        "order": { "id": "b35e65e4-…", "orderNumber": "ORD-100001" },
        "receiverName": "محمد سعيد",
        "receiverPhone": "01012345678",
        "connection": { "id": "1fd2987b-…", "name": "Local sandbox", "carrierCode": "sandbox", "…": "…" },
        "trackingNumber": "1791468181627",
        "carrierState": { "code": "10", "label": "Pickup requested" },
        "district": { "id": "0f0f259e-…", "externalId": "SBX-D-NASR", "nameEn": "Nasr City",
                      "nameAr": "مدينه نصر", "method": "DISTRICT" },
        "codAmount": 450.00,
        "failure": null, "issue": null, "attempts": 0,
        "bookedAt": "2026-10-08T14:03:21.406678Z",
        "pickedUpAt": null, "deliveredAt": null, "returnedAt": null, "cancelledAt": null,
        "lastUpdateAt": null, "timeline": null,
        "createdAt": "2026-10-08T14:03:21.398635Z",
        "updatedAt": "2026-10-08T14:03:21.406680Z"
      },
      "error": null
    },
    {
      "orderId": "ec14eb8b-a64c-4fa3-8f05-7fdf475daf06",
      "outcome": "REJECTED",
      "shipment": null,
      "error": {
        "code": "shipment.districtRequired",
        "message": "The shipping partner does not recognise this area. Choose the district from its list.",
        "status": 422,
        "details": {
          "suggestions": [
            { "id": "eb01dfe7-…", "externalId": "SBX-D-MANDARA-N", "nameEn": "ElMandarah Bahri", "nameAr": "المندره بحري", "…": "…" },
            { "id": "bdc1529a-…", "externalId": "SBX-D-MANDARA-S", "nameEn": "ElMandarah Qebli", "nameAr": "المندره قبلي", "…": "…" }
          ]
        }
      }
    },
    {
      "orderId": "a04a9fc7-30ba-47ac-b44a-de961f106f41",
      "outcome": "REJECTED",
      "shipment": null,
      "error": {
        "code": "carrier.booking.accountNotReady",
        "message": "Your account with the shipping partner cannot create shipments yet. Activate a shipping plan in the partner's dashboard, then try again.",
        "status": 422,
        "details": { "shipmentId": "3b27a7e3-2608-416d-9835-bed6323cbd27", "reason": "REJECTED" }
      }
    }
  ],
  "booked": 1,
  "rejected": 2
}
```

**`outcome`:**

| Outcome | Meaning | Do |
|---|---|---|
| `BOOKED` | the carrier has it. `shipment` is the same object `POST /api/shipments` returns with 201 | close the row; offer **Print labels** for all booked ones (`POST /api/shipments/labels`, one connection per batch) |
| `BOOKING` | sent, but the carrier's answer was lost (the single endpoint's 202). It is confirmed or failed within minutes | show "confirming…"; it appears on the Shipments list either way |
| `REJECTED` | not booked; see `error` | keep the row open with `error.message`. The order is still `PENDING`, so the merchant can fix it and send that row again |

**`error`** carries the same body the single booking returns for that order:
- `code`: the message code
- `message`: localized via `Accept-Language`
- `status`: the HTTP status the single endpoint would have used
- `details`: the same extra properties that endpoint would have added

The `details` you'll meet:

| `error.code` | `details` | Fix in the modal |
|---|---|---|
| `shipment.districtRequired` | `suggestions` | district picker, then resend that row with `districtId` |
| `shipment.quotaReached` | `limit` | past the month's allowance (these are always the last rows); upgrade |
| `shipment.bulk.notAttempted` (status 503) | — | **nothing was sent** for this row: the shipping partner was too slow to reach it in time. The order is still `PENDING`; send the row again. en: "The shipping partner is slow right now, so this order was not sent. Send it again." ar: "شريك الشحن بطيء الآن، لذلك لم يُرسل هذا الطلب. أرسله مرة أخرى." |
| a `carrier.booking.*` code | `reason`, sometimes `shipmentId` | `shipmentId` is the FAILED shipment the carrier refused; it shows on the Failed tab |
| `carrier.booking.receiverPhone` etc. (would-be-refused) | `problems` | edit the order |
| `shipment.orderNotFound` / `shipment.orderNotBookable` | — | drop the row (deleted, another company's, cancelled, or already booked) |

Retrying a REJECTED row is just another `POST /api/shipments/bulk` with that row, or
`POST /api/shipments` for one. Verified: after picking a district for the rejected row above,
resending it together with another order booked both.

---

## 3. `PUT /api/orders/{orderId}/packages` → `200`

This is the ✏️ next to Box Count. It replaces **only** the boxes (1 to 20) and leaves the rest of the
order untouched. Each box has the same fields as in `POST /api/orders`.

```json
{
  "packages": [
    { "boxName": "صندوق هدايا", "lengthCm": 30, "widthCm": 20, "heightCm": 10, "weightKg": 1.5 },
    { "lengthCm": 40, "widthCm": 30, "heightCm": 20, "weightKg": 3.5 }
  ]
}
```

The response is the whole order (the same shape as `GET /api/orders/{id}`), with `totalWeightKg`
recomputed. From the real response:

```json
{
  "id": "b35e65e4-d179-4c09-abcb-e57cec3fb3e1",
  "status": "PENDING",
  "packages": [
    { "boxName": "صندوق هدايا", "lengthCm": 30.00, "widthCm": 20.00, "heightCm": 10.00, "weightKg": 1.500 },
    { "boxName": null, "lengthCm": 40.00, "widthCm": 30.00, "heightCm": 20.00, "weightKg": 3.500 }
  ],
  "totalWeightKg": 5.000,
  "…": "the rest of the order, unchanged"
}
```

**What the modal shows:**
- It shows a count and a total weight, but the order stores **one entry per box with its own
  dimensions**.
- So the edit dialog lists the boxes (from `GET /api/orders/{id}`), each with its box type and
  weight, plus **Add box** and **Remove box**.
- It sends the whole list.
- There is no "×3 of the same box" shortcut on the API. Send three entries.

**Refusals** (the same as a full edit):
- `409` when the order is booked, delivered or cancelled. Real text: "This order is booked with a
  shipping partner. Cancel its shipment first."
- `404` for another company's order.
- `400` for an empty list or a bad box.

---

## 4. Errors

These are the request-level errors. Row-level problems are not errors: the request answers 200 and
the problem is in the row (§1 `error`, §2 `REJECTED`).

| Status | When | Message (en / ar, real) |
|---|---|---|
| `400` | no rows, more than 50, or (bulk) a row without `connectionId` | validation problem detail |
| `422` | the same order on two rows | "Each order can appear only once in a booking" / "لا يمكن تكرار الطلب نفسه في الحجز" |
| `403` | missing `shipment:manage` (or `order:manage` for the box edit) | — |

A preview row can also carry `shipment.bulk.lineUnavailable` (status 500) if it failed in a way no
rule explains. Nothing was claimed or booked. en: "This order could not be checked right now. Try
again." ar: "تعذّر فحص هذا الطلب الآن. حاول مرة أخرى."

One more row-level message for booking, which we have not been able to trigger in testing. It shows up only if a
row fails in a way no rule explains, and the booking may or may not have been made:
`shipment.bulk.lineFailed`, status 500. en: "This order could not be booked. Check its shipments
before trying again." ar: "تعذّر حجز هذا الطلب. راجع شحناته قبل المحاولة مرة أخرى." Link the row to
`GET /api/shipments?orderId=`.

---

## 5. The Create Shipment wizard

| Step | What |
|---|---|
| 1 Address Details | the receiver and address part of **Add Order** |
| 2 Shipment Details | boxes, products, COD: the rest of **Add Order** |
| *Next* | `POST /api/orders` (the full body, `2026-09-26-orders.md` §1) → the new order id |
| 3 | open the With My Rates modal with that one order (§1–§2) |

**Leaving and going back:**
- If the merchant closes the modal without booking, the order stays `PENDING` in Pending Orders, like
  any order added by hand.
- *Previous* from step 3 edits that order with `PUT /api/orders/{id}`. Don't create a second one.

**Leave out of the wizard:**
- *Short Address Code* and *Secondary Address Number*: Saudi fields, as `2026-09-26-orders.md`
  already says.
- The prices step.

---

## 6. Trying it

**On staging**, use a Bosta connection. The sandbox carrier is switched off there. An area name Bosta
doesn't know gives the "choose a district" row. Its `suggestions` can be empty when nothing is
similar, so the district picker is the fallback.

**On a local run (dev only)**, on a sandbox connection, `2026-09-26-shipments.md` §7 applies per row: the receiver's first name
chooses what happens. A batch with orders for `محمد`, `Unready` and an Alexandria order in area
`المندره` reproduces the response in §2 exactly: booked, refused by the carrier, and needs a
district.
