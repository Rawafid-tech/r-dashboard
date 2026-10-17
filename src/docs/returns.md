# Returns (collecting a delivered order back from the customer) — FE contract

**Status: deployed to staging (PRs #49 and #50, 2026-10-16)** and tested there against Bosta's
staging API:
- The preview chose the Bosta connection and matched the customer's area (ElHay 06, Nasr City) among
  the districts Bosta collects from.
- A return with a refund was refused: Bosta's 1063, our 422 in both languages.
- A return without one was booked: Bosta tracking `6611733794`, "Pickup requested".
- Its label was refused, a second return was refused while it was open, and the `kind` filter listed
  it.
- Cancelling it removed it at Bosta.
- The order stayed `DELIVERED` throughout.

The payloads below were captured from a local run against the sandbox carrier (2026-10-16), not
written by hand.

**What it is.** A merchant whose customer wants to send back a **delivered** order books a
*return*: the courier goes to the customer, collects the items, and brings them back to the
merchant's pickup location (the same one the order shipped from). Optionally the courier hands the
customer a **refund** in cash at pickup.

- A return is a **shipment** of kind `RETURN_PICKUP`. It shows up in the shipments list, has a
  timeline, and is cancelled like any shipment.
- **The order stays `DELIVERED`** the whole time, whatever happens to the return.
- One return at a time per order. Once it ends or is cancelled, another can be booked for what is
  left: an item can't come back, nor the order be refunded, more than once in total.
- A return **counts** toward the plan's monthly shipments.
- A return **has no label**: the courier collects the parcel as it is.
- No approval step: the merchant books it directly.

---

## Changes to the earlier drops

Everything else in those drops still holds. These lines are out of date:

| Drop | Where | Was | Now |
|---|---|---|---|
| `2026-09-26-shipments.md` | shipment response | no `kind`, no return fields | new `kind` (`DELIVERY` \| `RETURN_PICKUP`) and `returnPickup` (null for a delivery) (§4) |
| `2026-09-26-shipments.md` | `GET /api/shipments` params | no kind filter | new `kind=DELIVERY` \| `RETURN_PICKUP`; none means both (§4) |
| `2026-09-26-shipments.md` | label errors | 409 for BOOKING, FAILED or CANCELLED | also **409** for any return (§3) |
| `2026-09-26-shipments.md` | cancel | "releases the order (PENDING)" | for a return, the order stays `DELIVERED` |
| `2026-10-08-tracking.md` | `RETURNED` status | "back with the merchant after a failed delivery" | on a return it means **received back**; see §5 for a return's statuses |
| `2026-10-09-notifications.md` | topics table, preferences | 8 topics | **11**: plus `SHIPMENT_RETURN_PICKED_UP`, `SHIPMENT_RETURN_RECEIVED`, `SHIPMENT_RETURN_FAILED` (§6) |
| `2026-10-09-notifications.md` | status line | "built, not yet merged" | deployed to staging (PR #48) |
| `2026-10-09-notifications.md` | `SHIPMENT_ISSUE` body | "The carrier reported a problem with the delivery. …" / "…مشكلة في التوصيل…" | "…a problem with the **shipment**. …" / "أبلغت شركة الشحن عن مشكلة في الشحنة. …": it also describes returns |
| `2026-10-09-notifications.md` | `SHIPMENT_BOOKING_FAILED` body | "…before booking the order again." / "…قبل حجز الطلب من جديد." | "…before booking it again." / "…قبل حجزه من جديد." |
| `2026-09-26-shipments.md` | `failure.message` of `shipment.notConfirmed` / `shipment.notReceived` | "…before booking the order again." / "Book the order again." | "…before booking it again." / "Book it again." (ar: "…قبل حجزه مرة أخرى." / "احجزه مرة أخرى.") |
| `2026-09-26-shipments.md` | `GET /api/shipments/districts` | districts the carrier delivers to | same by default; with `kind=RETURN_PICKUP`, the districts it **collects returns from** (§1) |

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| **Return** button on a delivered order (order details, or the Delivered tab row) | open the modal with `GET /api/shipments/return-preview?orderId=` (§1) |
| Modal: item rows with a quantity stepper (0 … ordered) | `order.items` from the preview |
| Modal: reason (free text), refund amount, notes for the courier | fields of the POST (§2) |
| Modal: "Customer moved?" collapsible address/phone fields | `pickupAddress` (§2) |
| Modal: shipping partner dropdown | `connections`, pre-selected `connection` (§1) |
| **Book return** | `POST /api/shipments/returns` (§2) |
| Shipments list: a **Returns** filter or tab | `GET /api/shipments?kind=RETURN_PICKUP` (§4) |
| Shipment details of a return | `GET /api/shipments/{id}`; show `returnPickup`, hide **Print label** |

Hide the Return button unless the order is `DELIVERED`. If the preview's `existingReturn` is set,
show "A return is already on its way" with a link to that shipment instead of the form.

**Permissions:** `shipment:manage` to preview and book, `shipment:read` to see returns. These are the
shipment permissions that already exist; the owner always passes.

---

## 1. Preview

### `GET /api/shipments/return-preview?orderId=&connectionId=&districtId=` → `200`

`connectionId` and `districtId` are optional. Call it again when the merchant changes the dropdown
(`connectionId`) or picks a district (`districtId`). It asks the carrier nothing and books nothing.

```json
{
  "order": {
    "id": "b69f3870-2884-47df-b2a3-2b19a0ab3320", "orderNumber": "ORD-100001",
    "receiverName": "Courier سعيد", "receiverPhone": "01012345678",
    "area": "مدينة نصر", "addressLine": "12 شارع مصطفى النحاس، مدينة نصر",
    "orderValue": 450.00,
    "refundable": 450.00,
    "items": [
      { "id": "2635de61-8b4c-42a8-9724-006e09e3db58", "name": "قميص قطن", "sku": "SHIRT-1", "unitPrice": 200.00, "quantity": 2, "returnable": 2 },
      { "id": "4a159f07-ec40-4eb2-97d6-6ea6f9250de9", "name": "جوارب", "sku": null, "unitPrice": 50.00, "quantity": 1, "returnable": 1 }
    ]
  },
  "connections": [
    { "id": "28f6f8b8-…", "name": "Sandbox main", "carrierCode": "sandbox", "carrierNameEn": "Sandbox carrier", "carrierNameAr": "شركة شحن تجريبية", "active": true },
    { "id": "1cd2cdd8-…", "name": "Sandbox no refunds", "carrierCode": "sandbox", "…": "…" }
  ],
  "connection": { "id": "28f6f8b8-…", "name": "Sandbox main", "…": "…" },
  "pickup": { "locationId": "SBX-1", "name": "Sandbox warehouse", "source": "DEFAULT" },
  "address": { "method": "DISTRICT", "district": { "id": "0f0f259e-…", "nameEn": "Nasr City", "nameAr": "مدينه نصر", "…": "…" }, "suggestions": [] },
  "problems": [],
  "quota": { "planCode": "FREE", "limit": 50, "used": 1, "remaining": 49 },
  "existingReturn": null,
  "bookable": true
}
```

- `order.items[].id` is what you send back as `orderItemId`. `quantity` is how many were ordered;
  **`returnable`** is how many can still come back: those ordered, less what earlier returns took
  (any return not cancelled or failed). Use `returnable` as the stepper's maximum, and hide a row at
  0.
- **`order.refundable`** is the most a refund can be now: `orderValue` less what earlier returns
  refunded.
- `connections`: the company's connections that can collect returns (today: Bosta, and the
  sandbox locally). Empty means no connection can do returns, so show "Connect a shipping partner
  that collects returns".
- `connection`: the one checked. It's the one in `connectionId` if you sent it, else **the
  connection the order was delivered through** (when it can collect returns), else the first one.
  `null` when `connections` is empty.
- `pickup`: where the parcel is **brought back to**. It's the pickup location mapped to the order's
  sender location, as for a delivery.
- `address`: where the customer's area lands among the districts the carrier **collects from**
  (a carrier may deliver to a district it doesn't collect from, and the other way round). `NONE`
  means pick a district from `GET /api/shipments/districts?connectionId=&governorateId=&kind=RETURN_PICKUP`
  (the same picker with `kind`, which lists districts it collects from), then preview again with
  `districtId`.
- `problems`: what the carrier would refuse (`RECEIVER_PHONE`, `ADDRESS_LINE`, `COD_TOO_HIGH` for a
  refund above 30,000).
- `existingReturn`: `{ "shipmentId": "e1fbe0ac-…", "status": "BOOKED", "kind": "RETURN_PICKUP" }`
  when a return is already on its way. Then `bookable` is `false`.
- `bookable`: whether returning everything still returnable on this connection would be sent.
  `false` when nothing is left to return.

After a return of 1 of the 2 shirts with a 200.00 refund was received, the same order previews
(captured):

```json
"order": { "orderValue": 450.00, "refundable": 250.00, "items": [
  { "name": "قميص قطن", "quantity": 2, "returnable": 1, "…": "…" },
  { "name": "جوارب", "quantity": 1, "returnable": 1, "…": "…" } ] }
```

| Status | When | `detail` (en / ar) |
|---|---|---|
| 409 | the order is not `DELIVERED` | "Only a delivered order can be returned" / "لا يمكن إرجاع إلا الطلبات التي تم توصيلها" |
| 404 | not your order | "Order not found" (existing) |
| 422 | `connectionId` can't collect returns | "This shipping partner cannot collect returns. Choose another connection." / "شريك الشحن هذا لا يستلم المرتجعات. اختر ربطًا آخر." |
| 422 | `connectionId` is not yours, or is switched off | "connectionUnavailable" message (existing) |

---

## 2. Book

### `POST /api/shipments/returns` → `201` (or `202`)

```json
{
  "orderId": "b69f3870-2884-47df-b2a3-2b19a0ab3320",
  "connectionId": null,
  "districtId": null,
  "items": [ { "orderItemId": "2635de61-8b4c-42a8-9724-006e09e3db58", "quantity": 1 } ],
  "reason": "Wrong size",
  "refundAmount": 200,
  "pickupAddress": { "addressLine": "5 شارع عباس العقاد، مدينة نصر", "phone": "01198765432" },
  "notes": "Call before coming"
}
```

| Field | Rules |
|---|---|
| `orderId` | required; a `DELIVERED` order |
| `connectionId` | optional; one of the preview's `connections`. Null uses the preview's default |
| `districtId` | only after a `shipment.districtRequired` 422, as for a delivery |
| `items` | 1–100 rows; each order line at most once; `quantity` 1 … its `returnable`. Only send rows with quantity > 0 |
| `reason` | optional, ≤ 500. Sent to the courier with the notes |
| `refundAmount` | optional, > 0, at most `refundable`, 2 decimals. Cash the courier hands the customer |
| `pickupAddress` | optional. Each field you leave out keeps the order's own: `addressLine` (6–500), `buildingNumber`, `floor`, `apartment`, `phone` (same format as the order's phone). The governorate and area are always the order's |
| `notes` | optional, ≤ 500, for the courier |

The answer is the shipment, the same shape as every shipment response (§4), `status: "BOOKED"`.
`202` with `status: "BOOKING"` means the carrier didn't answer in time. It's confirmed or failed
within minutes, exactly like a delivery booking.

**Errors**

| Status | When | `detail` (en) | Arabic | Extra field |
|---|---|---|---|---|
| 409 | order not `DELIVERED` | "Only a delivered order can be returned" | "لا يمكن إرجاع إلا الطلبات التي تم توصيلها" | — |
| 409 | a return is already on its way | "This order already has a return on its way. Cancel it before booking another." | "يوجد مرتجع لهذا الطلب في الطريق بالفعل. ألغِه قبل حجز مرتجع آخر." | — |
| 409 | the month's allowance is used up | existing `shipment.quotaReached` | | `limit` |
| 422 | an item not in the order | "This item is not in the order" | "هذا المنتج غير موجود في الطلب" | `orderItemId` |
| 422 | the same item twice | "Each item can be listed only once in a return" | "لا يمكن إدراج المنتج نفسه أكثر من مرة في المرتجع" | `orderItemId` |
| 422 | more than can still come back | "More of this item than can still be returned: 2 left" | "الكمية أكبر مما يمكن إرجاعه: المتبقي 2" | `orderItemId`, `returnable` |
| 422 | refund above what is left of the order's value | "The refund can't be more than what is left of the order's value, 450.00" | "لا يمكن أن يزيد المبلغ المسترد عن المتبقي من قيمة الطلب، 450.00" | `refundable` |
| 422 | the carrier account may not give refunds | "Your shipping partner account isn't allowed to refund customers on returns. Book it without a refund, or ask the shipping partner to enable refunds." | "حسابك لدى شريك الشحن غير مسموح له برد المبالغ للعملاء في المرتجعات. احجزه بدون مبلغ مسترد، أو اطلب من شريك الشحن تفعيل ذلك." | `reason: "REJECTED"`, `shipmentId` (a FAILED row) |
| 422 | connection can't collect returns | see §1 | | — |
| 422 | area needs a district, or the carrier would refuse | existing `shipment.districtRequired` (`suggestions`) / problems (`problems`) | | |
| 400 | missing `orderId`/`items`, empty `items`, bad phone, … | validation error (existing format) | | |

**Refunds are a per-account switch at Bosta.** Bosta's own test account isn't allowed refunds, and a
merchant's real account may not be either. On that 422, suggest booking again **without**
`refundAmount`. The refused attempt is kept as a `FAILED` return in the list, the same as a
refused delivery booking.

---

## 3. Labels

A return has no airway bill. Hide **Print label** for `kind: "RETURN_PICKUP"`, and leave returns out
of bulk label selection.

`GET /api/shipments/{id}/label` and `POST /api/shipments/labels` with a return answer **409**:
"A return has no label: the courier collects the parcel from the customer as it is" / "لا توجد
بوليصة للمرتجع: يستلم المندوب الشحنة من العميل كما هي".

---

## 4. The shipment response and the list

Every shipment response gains two fields:

```json
{
  "id": "e1fbe0ac-caa6-46c8-8c52-50026c9e8f03",
  "status": "RETURNED",
  "kind": "RETURN_PICKUP",
  "order": { "id": "b69f3870-…", "orderNumber": "ORD-100001" },
  "receiverName": "Courier سعيد",
  "receiverPhone": "01198765432",
  "trackingNumber": "1792165427465",
  "carrierState": { "code": "46", "label": "Returned to business" },
  "pickup": { "locationId": "SBX-1", "name": "Sandbox warehouse" },
  "codAmount": 0.00,
  "bookedAt": "2026-10-16T15:45:00.763231Z",
  "pickedUpAt": "2026-10-16T15:45:06.035Z",
  "returnedAt": "2026-10-16T15:45:12.045Z",
  "timeline": [
    { "state": "RETURNED", "carrierState": { "code": "46", "label": "Returned to business" }, "occurredAt": "…", "source": "POLL" },
    { "state": "IN_TRANSIT", "carrierState": { "code": "41", "label": "Out for delivery" }, "occurredAt": "…", "source": "POLL" },
    { "state": "IN_TRANSIT", "carrierState": { "code": "23", "label": "Picked up from consignee" }, "occurredAt": "…", "source": "POLL" },
    { "state": "AWAITING_PICKUP", "carrierState": { "code": "22", "label": "Picking up from consignee" }, "occurredAt": "…", "source": "POLL" }
  ],
  "returnPickup": {
    "reason": "Wrong size",
    "refundAmount": 200.00,
    "items": [ { "orderItemId": "2635de61-…", "name": "قميص قطن", "sku": "SHIRT-1", "quantity": 1 } ],
    "pickupAddress": { "addressLine": "5 شارع عباس العقاد، مدينة نصر", "buildingNumber": null, "floor": null, "apartment": null, "phone": "01198765432" }
  },
  "…": "…the other fields as before"
}
```

- `kind`: `DELIVERY` or `RETURN_PICKUP`. Show a "Return" badge on return rows.
- `returnPickup` is `null` for a delivery. Its `pickupAddress` is `null` when the order's own address
  was used. `receiverPhone` on the shipment is the phone actually sent to the courier.
- `codAmount` is always `0.00` on a return; the refund is `returnPickup.refundAmount`.
- `carrierState.label` is the carrier's label verbatim: Bosta labels 41 "Out for delivery" even on
  a return, where it means "on its way to you". Show the status (§5), not this label, as the
  headline.

`GET /api/shipments?kind=RETURN_PICKUP` lists returns only, and `kind=DELIVERY` lists deliveries
only. With no `kind` you get both. It combines with `status`, `orderId`, `search`, etc. To show an
order's returns on its page: `GET /api/shipments?orderId=…&kind=RETURN_PICKUP`. `GET
/api/shipments/counts` still counts both kinds together.

---

## 5. A return's statuses

| `status` | On a return it means | Suggested label |
|---|---|---|
| `BOOKING` | sent, waiting for the carrier's confirmation | Booking… |
| `BOOKED` | booked; the courier hasn't collected it yet (this includes "on the way to the customer") | Awaiting pickup |
| `IN_TRANSIT` | collected from the customer, on its way back | On its way back |
| `RETURNED` | **received** by the merchant: the end it was booked for | Received |
| `CANCELLED` | cancelled by the merchant, **or** the carrier gave up collecting it (Bosta stops after 3 failed tries) | Cancelled / Not collected |
| `LOST` | lost or damaged by the carrier | Lost |
| `FAILED` | the carrier refused the booking (`failure` says why) | Failed |

A return is never `RETURNING` or `DELIVERED`. `issue` works as on a delivery: a failed pickup attempt
("customer not at the address") shows there until the next state.

**Cancel** (`POST /api/shipments/{id}/cancel`) works while `BOOKED`, same as a delivery. The order
stays `DELIVERED`, and another return can then be booked.

---

## 6. Notifications

Three new topics. They appear in `GET /api/notification-preferences` automatically, which now
returns **11** rows. Add labels for them on the settings screen.

| `topic` | When | In app by default | Email by default |
|---|---|---|---|
| `SHIPMENT_RETURN_PICKED_UP` | the courier collected it from the customer | ✓ | — |
| `SHIPMENT_RETURN_RECEIVED` | it's back with the merchant | ✓ | — |
| `SHIPMENT_RETURN_FAILED` | the carrier gave up collecting it | ✓ | ✓ |

A failed pickup attempt is the existing `SHIPMENT_ISSUE`, and a lost return is the existing
`SHIPMENT_LOST`. Cancelling it yourself tells nobody. The link is the return shipment.

Captured titles (en / ar):
- RETURN_RECEIVED: "The return of order ORD-100001 is back with you" / "وصل مرتجع الطلب ORD-100001
  إليك"; body "The carrier delivered the returned parcel to you." / "سلّمت شركة الشحن الشحنة المرتجعة
  إليك."
- RETURN_PICKED_UP: "The return of order ORD-100001 was picked up" / "تم استلام مرتجع الطلب
  ORD-100001 من العميل"
- RETURN_FAILED: "The return of order ORD-100001 was not collected" / "لم يتم استلام مرتجع الطلب
  ORD-100001"

---

## 7. Trying it

- **Local (sandbox):**
  1. Book an order whose receiver's first name is `Courier`. With the poll sped up
     (`RAWAFID_SHIPMENTS_TRACKING_CRON='*/3 * * * * *'`, `RAWAFID_SHIPMENTS_TRACKING_STALE=0s`) it
     is delivered in about 10 s.
  2. Return it. The poll then moves the return through awaiting pickup → on its way back →
     received in about 12 s.
  3. A connection whose key starts with `valid-norefund-` refuses any refund, as Bosta's test
     account does.
- **Staging (Bosta):**
  - Bosta's test system never moves a parcel, so no order there ever becomes `DELIVERED` by
    itself. Ask the backend to mark a test order delivered.
  - Then book a return **without** a refund: the test account refuses refunds (1063, confirmed
    on staging).
  - Cancel it afterwards.
