# Exchanges (the same items swapped at the customer's door) — FE contract

**Status: deployed to staging (PR #54, 2026-10-16)** and tested there against Bosta's staging API: preview, refund refused (1063, both languages), an exchange booked (tracking `6413644136`, type 30, COD 50), its label, a return refused while it was open, simulated Bosta webhooks 21→22→23→41→46 to completed with the three notices, both shirts still returnable after, and a second one cancelled at Bosta (1066). The payloads below were captured from a local run
against the sandbox carrier, not written by hand. A probe of Bosta's staging API (before the build)
confirmed what the carrier side relies on: a type 30 delivery is accepted with a price difference
or with none, it prints, it is found by our reference and cancelled; a refund on it is refused with
Bosta's 1063, as on a return. Then the built code was run locally against Bosta's staging API:
the preview matched the address (ElHay 06, Nasr City), a refund was refused (1063, our 422 in both
languages), an exchange collecting 50 was booked (tracking `6715707960`: type 30 "Exchange", COD
50, the item in both `specs` and `returnSpecs`), its label printed, and cancelling it removed it at
Bosta. Bosta's staging never moves a parcel, so the states in §5 are from its documentation.

**What it is.** A customer got the wrong size, or a faulty unit. The merchant books an *exchange*
of the delivered order. In one trip the courier:
1. takes the replacement from the merchant's pickup location (where the order shipped from);
2. hands it to the customer and collects the delivered items back;
3. brings them back to the merchant.

**The same items** go out and come back: this is a replacement, not a swap for another product.
Optionally the courier **collects** a price difference from the customer, *or* hands them a
**refund** — one of the two, never both.

- An exchange is a **shipment** of kind `EXCHANGE`. It shows up in the shipments list, has a
  timeline, and is cancelled like any shipment.
- **The order stays `DELIVERED`** the whole time, whatever happens to the exchange.
- **Returns and exchanges share the order.** One return *or* exchange at a time, and the order's
  value can be refunded only once in total, across both. An exchange takes **no items for good**:
  the customer still holds as many as it collected (the replacement), so they can be returned or
  exchanged later. Only a return uses items up.
- An exchange takes **one** slot of the plan's monthly shipments.
- An exchange **has a label** (for the parcel that goes out), unlike a return.
- No approval step: the merchant books it directly.

---

## Changes to the earlier drops

Everything else in those drops still holds. These lines are out of date:

| Drop | Where | Was | Now |
|---|---|---|---|
| `2026-10-16-returns.md` | rules | "One return at a time per order" | one return **or exchange** at a time; the item and refund limits are shared with exchanges |
| `2026-10-16-returns.md` | preview `refundable` | less what earlier **returns** refunded | less what earlier returns **and exchanges** refunded (`returnable` is unchanged: exchanges take no items for good) |
| `2026-10-16-returns.md` | `existingReturn` | a return already open | a return **or an exchange** already open; its `kind` says which |
| `2026-10-16-returns.md` | 409 order not delivered | "Only a delivered order can be returned" / "لا يمكن إرجاع إلا الطلبات التي تم توصيلها" | "Only a delivered order can be returned or exchanged" / "لا يمكن إرجاع أو استبدال إلا الطلبات التي تم توصيلها" |
| `2026-10-16-returns.md` | 409 already open | "This order already has a return on its way. …" / "يوجد مرتجع لهذا الطلب في الطريق بالفعل. ألغِه قبل حجز مرتجع آخر." | "This order already has a return or an exchange on its way. Cancel it before booking another." / "يوجد مرتجع أو استبدال لهذا الطلب في الطريق بالفعل. ألغِه قبل حجز آخر." |
| `2026-10-16-returns.md` | 422 item twice | "Each item can be listed only once in a return" / "…أكثر من مرة في المرتجع" | "Each item can be listed only once" / "لا يمكن إدراج المنتج نفسه أكثر من مرة" |
| `2026-10-16-returns.md` | 422 quantity | "More of this item than can still be returned: 2 left" / "الكمية أكبر مما يمكن إرجاعه: المتبقي 2" | "More of this item than can still be taken back: 2 left" / "الكمية أكبر مما يمكن استرجاعه: المتبقي 2" |
| `2026-10-16-returns.md` | 422 refund not allowed | "…refund customers on returns. …" / "…في المرتجعات. …" | "…refund customers on returns or exchanges. …" / "…في المرتجعات أو الاستبدال. …" |
| `2026-10-09-notifications.md` | topics table, preferences | 11 topics | **14**: plus `SHIPMENT_EXCHANGE_SWAPPED`, `SHIPMENT_EXCHANGE_COMPLETED`, `SHIPMENT_EXCHANGE_FAILED` (§6) |
| `2026-10-08-tracking.md` | timeline `state` values | `AWAITING_PICKUP` … `IGNORED` | plus **`SWAPPED`**: on an exchange, the delivered items collected from the customer (§5) |
| `2026-09-26-shipments.md` | `kind`, `GET /api/shipments?kind=`, `/districts?kind=` | `DELIVERY` \| `RETURN_PICKUP` | plus **`EXCHANGE`** (§4) |

The return endpoints themselves are unchanged.

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| **Exchange** button on a delivered order, next to **Return** | open the modal with `GET /api/shipments/exchange-preview?orderId=` (§1) |
| Modal: item rows with a quantity stepper (0 … `returnable`) | `order.items` from the preview |
| Modal: reason, notes for the courier | fields of the POST (§2) |
| Modal: money — *None* / *Collect from customer* / *Refund to customer*, one amount | `collectAmount` **or** `refundAmount` (§2) |
| Modal: "Customer moved?" collapsible address/phone fields | `address` (§2) |
| Modal: shipping partner dropdown | `connections`, pre-selected `connection` (§1) |
| **Book exchange** | `POST /api/shipments/exchanges` (§2) |
| Shipments list: an **Exchanges** filter or tab | `GET /api/shipments?kind=EXCHANGE` (§4) |
| Shipment details of an exchange | `GET /api/shipments/{id}`; show `exchange`, **Print label** works (§3) |

Hide the Exchange button unless the order is `DELIVERED`. If the preview's `existingReturn` is set,
show "A return or exchange is already on its way" with a link to that shipment instead of the
form.

**Permissions:** `shipment:manage` to preview and book, `shipment:read` to see exchanges — the same
as returns; the owner always passes.

---

## 1. Preview

### `GET /api/shipments/exchange-preview?orderId=&connectionId=&districtId=` → `200`

The same shape as the return preview. `connectionId` and `districtId` are optional; call it again
when the merchant changes the dropdown or picks a district. It asks the carrier nothing and books
nothing.

```json
{
  "order": {
    "id": "4823fbc2-17d4-4f0a-977d-1bc40cf3d1bc",
    "orderNumber": "ORD-100001",
    "receiverName": "Courier سعيد",
    "receiverPhone": "01012345678",
    "area": "مدينة نصر",
    "addressLine": "12 شارع مصطفى النحاس، مدينة نصر",
    "orderValue": 450.0,
    "refundable": 450.0,
    "items": [
      { "id": "fb71aaeb-170a-4232-a63f-da73a824a844", "name": "قميص قطن", "sku": "SHIRT-1",
        "unitPrice": 200.0, "quantity": 2, "returnable": 2 },
      { "id": "8b10e10c-d926-4259-b0b1-67ea560401f5", "name": "جوارب", "sku": null,
        "unitPrice": 50.0, "quantity": 1, "returnable": 1 }
    ]
  },
  "connections": [
    { "id": "fd45d397-2570-4451-92e6-caa43c8e60a5", "name": "Sandbox main", "carrierCode": "sandbox",
      "carrierNameEn": "Sandbox carrier", "carrierNameAr": "شركة شحن تجريبية", "active": true },
    { "id": "511e0880-2bf6-448d-8de0-cf1d115cc0f5", "name": "Sandbox no refunds", "carrierCode": "sandbox",
      "carrierNameEn": "Sandbox carrier", "carrierNameAr": "شركة شحن تجريبية", "active": true }
  ],
  "connection": { "id": "fd45d397-2570-4451-92e6-caa43c8e60a5", "name": "Sandbox main", "…": "…" },
  "pickup": { "locationId": "SBX-1", "name": "Sandbox warehouse", "source": "DEFAULT" },
  "address": {
    "method": "DISTRICT",
    "district": { "id": "0f0f259e-1b59-42e9-b3f3-2a9d27d22b27", "externalId": "SBX-D-NASR",
                  "nameEn": "Nasr City", "nameAr": "مدينه نصر", "zoneNameEn": "Nasr City",
                  "zoneNameAr": "مدينه نصر", "cityNameEn": "Cairo", "cityNameAr": "القاهره" },
    "suggestions": []
  },
  "problems": [],
  "quota": { "planCode": "FREE", "limit": 50, "used": 1, "remaining": 49 },
  "existingReturn": null,
  "bookable": true
}
```

- **`connections`** are the company's connections whose carrier does exchanges (Bosta, the
  sandbox). **`connection`** is the one checked: the merchant's choice, else the one the order was
  delivered through, else the first.
- **`returnable`** per item is how many can still be taken back: those ordered, less what earlier
  **returns** took. Exchanges don't reduce it. Cap the stepper there; hide a row at 0.
- **`order.refundable`** is the most a refund can be now: the order's value less what earlier
  returns and exchanges refunded. A *collect* amount has no such cap (only the carrier's 30,000).
- **`address`** is matched among the districts the carrier **both delivers to and collects
  from** — an exchange needs both. When `method` is `NONE`, show the district picker with
  `GET /api/shipments/districts?connectionId=&governorateId=&kind=EXCHANGE` and call the preview
  again with `districtId`. A district the carrier only serves one way is refused with 422.
- **`existingReturn`** is set when a return *or* an exchange is already on its way
  (`{shipmentId, status, kind}`). Then `bookable` is `false`.

| Status | When | `detail` |
|---|---|---|
| 409 | the order is not `DELIVERED` | "Only a delivered order can be returned or exchanged" / "لا يمكن إرجاع أو استبدال إلا الطلبات التي تم توصيلها" |
| 404 | not your order | (the order's not-found message) |
| 422 | `connectionId` can't do exchanges | "This shipping partner cannot exchange parcels. Choose another connection." / "شريك الشحن هذا لا يقوم بالاستبدال. اختر ربطًا آخر." |

---

## 2. Book

### `POST /api/shipments/exchanges` → `201` (or `202`)

```json
{
  "orderId": "4823fbc2-17d4-4f0a-977d-1bc40cf3d1bc",
  "items": [ { "orderItemId": "fb71aaeb-170a-4232-a63f-da73a824a844", "quantity": 1 } ],
  "reason": "Wrong size",
  "collectAmount": 50,
  "notes": "Bring size L",
  "address": { "addressLine": "5 شارع عباس العقاد، مدينة نصر", "phone": "01198765432" }
}
```

| Field | |
|---|---|
| `orderId` | required, a `DELIVERED` order |
| `connectionId` | optional; null uses the preview's default |
| `districtId` | only after a 422 `shipment.districtRequired`, as when booking |
| `items` | required, 1–100 lines `{orderItemId, quantity ≥ 1}`, each line once, at most `returnable` |
| `reason` | optional, ≤ 500 |
| `collectAmount` | optional, > 0: the courier collects it from the customer |
| `refundAmount` | optional, > 0, ≤ `refundable`: the courier hands it to the customer |
| `address` | optional; any of `addressLine` (6–500), `buildingNumber`, `floor`, `apartment`, `phone`. Each field left out keeps the order's own; the governorate and area are always the order's. A new `phone` also becomes the shipment's `receiverPhone` |
| `notes` | optional, ≤ 500, for the courier |

`201` with the shipment `BOOKED` (captured):

```json
{
  "id": "65e782c2-cf3e-4f5a-8e31-cee4734fe3cf",
  "status": "BOOKED",
  "kind": "EXCHANGE",
  "order": { "id": "4823fbc2-17d4-4f0a-977d-1bc40cf3d1bc", "orderNumber": "ORD-100001" },
  "receiverName": "Courier سعيد",
  "receiverPhone": "01198765432",
  "trackingNumber": "1792180752866",
  "carrierState": { "code": "10", "label": "Pickup requested" },
  "pickup": { "locationId": "SBX-1", "name": "Sandbox warehouse" },
  "codAmount": 50.0,
  "returnPickup": null,
  "exchange": {
    "reason": "Wrong size",
    "collectAmount": 50.0,
    "refundAmount": null,
    "items": [ { "orderItemId": "fb71aaeb-170a-4232-a63f-da73a824a844", "name": "قميص قطن",
                 "sku": "SHIRT-1", "quantity": 1 } ],
    "address": { "addressLine": "5 شارع عباس العقاد، مدينة نصر", "buildingNumber": null,
                 "floor": null, "apartment": null, "phone": "01198765432" },
    "swappedAt": null
  },
  "…": "…the other shipment fields as for any shipment"
}
```

`202` means the carrier did not answer: the shipment stays `BOOKING` and is confirmed or failed
within minutes. Poll `GET /api/shipments/{id}`, as for a booking.

| Status | When | `detail` (en / ar) | Extra |
|---|---|---|---|
| 409 | order not `DELIVERED` | "Only a delivered order can be returned or exchanged" / "لا يمكن إرجاع أو استبدال إلا الطلبات التي تم توصيلها" | — |
| 409 | a return or exchange is already on its way | "This order already has a return or an exchange on its way. Cancel it before booking another." / "يوجد مرتجع أو استبدال لهذا الطلب في الطريق بالفعل. ألغِه قبل حجز آخر." | — |
| 409 | the month's allowance is used up | (the booking's quota message) | `limit` |
| 422 | both amounts | "Enter either an amount to collect from the customer or a refund, not both" / "أدخل إما مبلغًا يُحصَّل من العميل أو مبلغًا يُرد إليه، وليس الاثنين" | — |
| 422 | an item not in the order | "This item is not in the order" | `orderItemId` |
| 422 | the same item twice | "Each item can be listed only once" / "لا يمكن إدراج المنتج نفسه أكثر من مرة" | `orderItemId` |
| 422 | more than can still be taken back | "More of this item than can still be taken back: 2 left" / "الكمية أكبر مما يمكن استرجاعه: المتبقي 2" | `orderItemId`, `returnable` |
| 422 | a refund above `refundable` | "The refund can't be more than what is left of the order's value, 450.00" | `refundable` |
| 422 | the connection can't do exchanges | "This shipping partner cannot exchange parcels. Choose another connection." | — |
| 422 | the area needs a district | as booking (`suggestions`) | `suggestions` |
| 422 | the carrier account may not give refunds | "Your shipping partner account isn't allowed to refund customers on returns or exchanges. Book it without a refund, or ask the shipping partner to enable refunds." / "حسابك لدى شريك الشحن غير مسموح له برد المبالغ للعملاء في المرتجعات أو الاستبدال. احجزه بدون مبلغ مسترد، أو اطلب من شريك الشحن تفعيل ذلك." | `reason: "REJECTED"`, `shipmentId` (a FAILED row) |

The refund refusal is real on Bosta staging (its error 1063): many Bosta accounts may not refund.
Suggest booking without the refund, or with the money left to the merchant to settle.

---

## 3. Labels

An exchange **prints**: `GET /api/shipments/{id}/label` and `POST /api/shipments/labels` work for
it from `BOOKED` on, as for a delivery. The label is for the replacement going out; the courier
collects the old items as they are.

---

## 4. The shipment response and the list

- **`kind`** is `EXCHANGE`.
- **`exchange`** is set on an exchange (null otherwise), and **`returnPickup`** is null:
  - `reason`, `collectAmount`, `refundAmount` (null when none), `items`;
  - `address`: the merchant's override, or null for the order's own;
  - **`swappedAt`**: when the courier collected the delivered items from the customer — or, when
    the carrier never reported that step, when it was received back. Null until then — and still
    null on a `RETURNED` exchange the customer **refused** (the replacement came
    back instead).
- **`codAmount`** is the `collectAmount`, or 0.
- **List:** `GET /api/shipments?kind=EXCHANGE`. No `kind` lists every kind.
- **Districts:** `GET /api/shipments/districts?…&kind=EXCHANGE` lists the districts the carrier
  both delivers to and collects from.

---

## 5. An exchange's statuses

| `status` | On an exchange it means | Suggested label |
|---|---|---|
| `BOOKING` | sent, waiting for the carrier's confirmation | Booking… |
| `BOOKED` | booked; the courier hasn't collected the replacement yet | Awaiting pickup |
| `IN_TRANSIT` | the replacement is on its way to the customer | On its way to the customer |
| `RETURNING` with `swappedAt` | **exchanged**: the old items are on their way back | Exchanged, coming back |
| `RETURNING` without `swappedAt` | refused: the replacement is on its way back | Coming back, not exchanged |
| `RETURNED` with `swappedAt` | the old items are back with the merchant: **done** | Exchanged |
| `RETURNED` without `swappedAt` | the customer **refused**: the replacement came back | Not exchanged |
| `CANCELLED` | cancelled by the merchant, or by the carrier before pickup | Cancelled |
| `LOST` | lost or damaged by the carrier | Lost |
| `FAILED` | the carrier refused the booking (`failure` says why) | Failed |

An exchange is never `DELIVERED`. `issue` works as on a delivery: a failed attempt ("customer
refused", "not at the address") shows there until the next state.

The **timeline** gains one `state`, **`SWAPPED`**: the carrier reported the old items collected
(Bosta's 23 "Picked up from consignee", and its 41 on an exchange, which is "heading to you" with
them). Captured, newest first:

```json
[
  { "state": "RETURNED", "carrierState": { "code": "46", "label": "Returned to business" }, "issue": null, "occurredAt": "2026-10-16T19:59:45.014Z", "source": "POLL" },
  { "state": "SWAPPED", "carrierState": { "code": "41", "label": "Out for delivery" }, "issue": null, "occurredAt": "2026-10-16T19:59:42.014Z", "source": "POLL" },
  { "state": "SWAPPED", "carrierState": { "code": "23", "label": "Picked up from consignee" }, "issue": null, "occurredAt": "2026-10-16T19:59:39.015Z", "source": "POLL" },
  { "state": "IN_TRANSIT", "carrierState": { "code": "22", "label": "Picking up from consignee" }, "issue": null, "occurredAt": "2026-10-16T19:59:36.019Z", "source": "POLL" },
  { "state": "IN_TRANSIT", "carrierState": { "code": "21", "label": "Picked up from business" }, "issue": null, "occurredAt": "2026-10-16T19:59:33.029Z", "source": "POLL" }
]
```

A refused one (captured): `IN_TRANSIT` (21, 22) → `EXCEPTION` (47, issue `{code: "8", reason:
"Customer refused the shipment"}`) → `RETURNING` (41, under Bosta's RTO type) → `RETURNED` (46),
`swappedAt: null`. Its status is `RETURNING` on the way back too: show "Coming back, not
exchanged" when `swappedAt` is null, "Exchanged, coming back" when it is set.

Show our `state`, not Bosta's label: Bosta names 41 "Out for delivery" on the way back too.

**Cancel** (`POST /api/shipments/{id}/cancel`) works while `BOOKED`. The order stays `DELIVERED`,
and another return or exchange can then be booked.

**Limits after it ends:** an exchange never uses up items — after it, the customer holds the
replacement, which can be returned or exchanged in turn. Its refund counts against `refundable`
once swapped (or while it is on its way); a refused, lost-before-the-swap, failed or cancelled one
refunded nothing.

**How a refusal is told:** only from the carrier reporting the way back under its return-to-origin
type (Bosta's RTO) before the swap. If the carrier never reported the swap but the exchange comes
back without that evidence, it counts as **done** (`swappedAt` = when it was received).

---

## 6. Notifications

Three new topics. `GET /api/notification-preferences` now returns **14** rows; add labels for them
on the settings screen.

| `topic` | When | In app by default | Email by default |
|---|---|---|---|
| `SHIPMENT_EXCHANGE_SWAPPED` | the customer got the replacement; the old items are coming back | ✓ | — |
| `SHIPMENT_EXCHANGE_COMPLETED` | the old items are back with the merchant | ✓ | — |
| `SHIPMENT_EXCHANGE_FAILED` | the customer refused it, or the carrier cancelled it before pickup | ✓ | ✓ |

The courier collecting the replacement from the merchant is the existing `SHIPMENT_PICKED_UP`; a
failed attempt is the existing `SHIPMENT_ISSUE`; lost is `SHIPMENT_LOST`. A cancel the merchant
asked for is never notified.

Captured inbox titles:

| Topic | en | ar |
|---|---|---|
| `SHIPMENT_EXCHANGE_SWAPPED` | The exchange of order ORD-100001 was made | تم استبدال الطلب ORD-100001 |
| `SHIPMENT_EXCHANGE_COMPLETED` | The exchanged items of order ORD-100001 are back with you | وصلت المنتجات المستبدلة من الطلب ORD-100001 إليك |
| `SHIPMENT_EXCHANGE_FAILED` | The exchange of order ORD-100003 did not happen | لم يتم استبدال الطلب ORD-100003 |

Bodies: "The courier handed the replacement to the customer and is bringing the exchanged items
back to you." / "The carrier delivered the items it collected from the customer to you. The exchange
is complete." / "The customer did not take the replacement, or the carrier could not carry it out.
Contact the customer, then book the exchange again." (ar in the API response.)

---

## 7. Trying it

- **Local:** a sandbox connection. Deliver an order, then exchange it. With the poll sped up
  (`RAWAFID_SHIPMENTS_TRACKING_CRON='*/3 * * * * *'`, `RAWAFID_SHIPMENTS_TRACKING_STALE=0s`) it
  goes picked up → on its way → swapped → back → received in about 15 s. An order whose receiver's
  first name is `Bounce` is refused: it comes back unswapped. A connection with the key
  `valid-norefund-…` refuses any refund.
- **Staging:** book on the Bosta connection. Bosta's staging never moves a parcel, so it stays
  `BOOKED` there; the states above come from its webhooks in production.
