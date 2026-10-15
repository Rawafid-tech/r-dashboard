# Collecting each order from its own warehouse (pickup locations per sender location) — FE contract

**Status: deployed to staging (PR #46, 2026-10-09)** and tested there against Bosta's staging API.
Listing the account's pickup locations, refusing an id Bosta doesn't have, mapping a sender location,
and booking two orders (one `MAPPED`, one `DEFAULT`, 3.8 seconds) all worked, and each shipment
recorded its pickup. The payloads below were captured from a local run against the sandbox
carrier, not written by hand. Bosta's look the same, with Bosta's own ids (`LTnG2XwZ_B`) and names
("Hunger").

**The problem this fixes.** Until now a carrier connection had **one** pickup location (the
`pickupLocationId` picked on the connect form), and every order booked through it was collected
from there, whatever sender location the order said. A merchant with a Nasr City warehouse and a
Giza store had couriers going to the wrong one.

**Now:** on each connection the merchant can say "orders from *Giza store* are collected from the
carrier's *Giza* pickup location". Any sender location not mapped keeps using the connection's own
pickup location (the **default**), so a merchant with one warehouse needs to set nothing up.

---

## Changes to the earlier drops

Everything else in those drops still holds. These lines are out of date:

| Drop | Where | Was | Now |
|---|---|---|---|
| `2026-09-26-shipments.md` | §2 "What's sent" | "The pickup location is the **connection's** (a merchant shipping from two warehouses uses two connections)" | The pickup location is the one **mapped to the order's sender location** on the connection, else the connection's own (§1 below). One connection is enough for several warehouses |
| `2026-09-26-shipments.md` | shipment response | no pickup field | new `pickup: {locationId, name}` (nullable): where the carrier was told to collect it (§3) |
| `2026-09-26-shipments.md` | `GET /api/shipments/preview` response | no pickup field | new `pickup: {locationId, name, source}` (nullable), same as the bulk preview row (§2) |
| `2026-10-08-bulk-booking.md` | §1, the paragraph under the quota footer | "**From** is the sender location… Bosta actually collects from the pickup location chosen on the *connection*… which can differ. This is shown as information only." | Each row has a new `pickup` field saying where the carrier will collect it, and whether it was `MAPPED` or the `DEFAULT` (§2) |
| `2026-09-26-shipping-partners.md` | connection response | no name for the chosen pickup location | new `pickupLocationName` (nullable) beside `options.pickupLocationId` |
| `2026-09-26-shipping-partners.md` | edit errors (`PUT /api/carrier-connections/{id}`) | a new key is refused only for open shipments on another account (409) | also **422** when the new key's account lacks a pickup location some sender location is mapped to. The response names it in `pickupLocationId`. Detail: "This key opens an account without a pickup location your sender locations are mapped to. Change or remove those pickup locations first." Arabic: "هذا المفتاح يفتح حسابًا لا يحتوي على موقع استلام مرتبط بأحد مواقع المرسل لديك. غيّر مواقع الاستلام هذه أو احذفها أولًا." |
| `2026-09-26-shipments.md` | preview `problems[].code` | `RECEIVER_PHONE`, `ADDRESS_LINE`, `COD_TOO_HIGH` | plus **`PICKUP_LOCATION`**: the pickup location is no longer on the carrier account (§4) |

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| Shipping partners → a connection → **Pickup locations** (new tab or section) | `GET /api/carrier-connections/{id}/pickup-locations` (§1) |
| One row per sender location, with a dropdown of the carrier's pickup locations | sender locations: `GET /api/sender-locations` (existing). Dropdown options: `locations` from §1 |
| **Save** | `PUT /api/carrier-connections/{id}/pickup-mappings` (§1) |
| *With My Rates* modal row: "Collected from …" | the row's new `pickup` (§2) |
| Shipment details: "Collected from …" | the shipment's new `pickup` (§3) |

**Permissions:** reading needs `carrierConnection:read` and saving needs `carrierConnection:manage`,
the same as the rest of the shipping-partners screen. The owner always passes.

---

## 1. Pickup locations on a connection

### `GET /api/carrier-connections/{id}/pickup-locations` → `200`

This asks the carrier **now**, using the saved key, so it can take a few seconds. Show a spinner.
The merchant does not have to type the key again: before this, the list only came from **Test
Connection**.

```json
{
  "locations": [
    { "id": "SBX-1", "name": "Sandbox warehouse", "address": "1 Test Street, Nasr City, Cairo", "isDefault": true },
    { "id": "SBX-2", "name": "Sandbox store", "address": "2 Test Street, Dokki, Giza", "isDefault": false }
  ],
  "defaultLocationId": "SBX-1",
  "mappings": [
    { "senderLocationId": "04819ec3-b097-44b1-ac09-3dbe26ed673a", "pickupLocationId": "SBX-2",
      "pickupLocationName": "Sandbox store", "onAccount": true }
  ]
}
```

- `locations`: the carrier account's pickup locations. `isDefault` is the **carrier's** default
  for the account, as on the connect form.
- `defaultLocationId`: the **connection's** pickup location (`options.pickupLocationId`), used for
  every sender location not in `mappings`. Show it as the dropdown's placeholder, for example
  "Default: Sandbox warehouse".
- `mappings`: only the sender locations the merchant mapped. Pair them with
  `GET /api/sender-locations` by `senderLocationId`. A sender location missing from here is on the
  default.
- `onAccount: false` means the carrier no longer lists that pickup location (the merchant deleted
  it in the carrier's dashboard). Bookings from that sender location will be **refused** until it
  is mapped again. Show a warning on that row.

### `PUT /api/carrier-connections/{id}/pickup-mappings` → `200`

**Replaces the whole set.** Send every mapping the screen shows, not only the changed one. Leave a
sender location out (or set its dropdown back to "Default") to put it back on the default. `[]`
clears them all.

```json
{ "mappings": [ { "senderLocationId": "04819ec3-b097-44b1-ac09-3dbe26ed673a", "pickupLocationId": "SBX-2" } ] }
```

The answer has the same shape as the `GET`.

- At most 100 mappings.
- Inactive sender locations can be mapped: their old orders keep them.
- The carrier is asked first. Nothing is saved unless every row passes.

| Status | When | `detail` (en) | Extra field |
|---|---|---|---|
| 422 | a pickup location the carrier account doesn't have | "This pickup location is not on your account with the shipping partner" | `pickupLocationId` |
| 422 | a sender location that isn't yours (or doesn't exist) | "This sender location was not found" | `senderLocationId` |
| 422 | the same sender location twice | "Each sender location can have only one pickup location" | `senderLocationId` |
| 422 | a carrier with no pickup location at all (none today: Bosta and the sandbox both have one) | "This shipping partner does not take a pickup location, so it cannot be set per sender location" | — |
| 422 | the saved key is now rejected | "The shipping partner rejected these credentials…" (existing) | — |
| 502 | the carrier doesn't answer | "The shipping partner is not responding…" (existing) | — |
| 400 | a missing `senderLocationId` or a blank `pickupLocationId` | validation error (existing format) | — |
| 404 | not your connection | "Connection not found" (existing) | — |

Use the extra field to mark the row the error belongs to. Arabic, captured:
`"detail": "لا يمكن تحديد أكثر من موقع استلام لموقع المرسل الواحد"`. The other two new messages in
Arabic are "موقع المرسل غير موجود" and "شريك الشحن هذا لا يستخدم موقع استلام، لذلك لا يمكن تحديده
لكل موقع مرسل".

---

## 2. The booking screen shows where each order is collected from

`POST /api/shipments/preview` (bulk) rows and `GET /api/shipments/preview` (single) both gain
`pickup`:

```json
{
  "orderId": "201642bb-1abc-46ce-a396-68fefa3830e7",
  "from": { "senderLocationId": "04819ec3-b097-44b1-ac09-3dbe26ed673a", "name": "Giza store",
            "governorate": { "code": "EG-GZ", "nameEn": "Giza", "nameAr": "الجيزة", "id": "01071234-9337-5780-82bf-206165ccadfc" } },
  "connection": { "id": "628f799d-…", "name": "Sandbox two warehouses", "carrierCode": "sandbox", "…": "…" },
  "pickup": { "locationId": "SBX-2", "name": "Sandbox store", "source": "MAPPED" },
  "bookable": true
}
```

- `source: "MAPPED"` means the order's sender location is mapped on this connection.
- `source: "DEFAULT"` means it isn't, so the connection's own pickup location is used.
- `pickup` is `null` until a company is chosen for the row, and for a carrier with no pickup
  location.
- `name` can be `null` on a connection saved before this change, until it is edited or its mappings
  are saved once. Fall back to `locationId`.

**Suggested UI:** show "Collected from *Sandbox store*" under *from*. If the company has **more than
one** sender location and the row says `DEFAULT`, add a small warning ("Not mapped: collected from
the connection's default") with a link to the connection's Pickup locations. This is a warning
only: a `DEFAULT` row still books.

---

## 3. The shipment remembers it

Every shipment response (`GET /api/shipments`, `GET /api/shipments/{id}`, and the `shipment` in
`POST /api/shipments` and `POST /api/shipments/bulk`) gains `pickup`:

```json
{ "id": "a42e2c3e-04fd-4cb5-aa96-a0dd6c69fb9f", "status": "BOOKED",
  "pickup": { "locationId": "SBX-2", "name": "Sandbox store" }, "…": "…" }
```

This is copied at booking. Changing the mappings later doesn't rewrite it. It is `null` on
shipments booked before this change.

---

## 4. When a mapped pickup location disappears

If the merchant deletes a pickup location in the carrier's own dashboard after mapping it, nothing
is sent to the carrier for it (Bosta emails the merchant about every booking it refuses):
- `GET …/pickup-locations` shows that mapping with `onAccount: false`.
- The preview row gets the problem `{"code": "PICKUP_LOCATION", "message": "The pickup location on
  this connection is no longer on your shipping partner account. Choose another under Shipping
  partners."}` and `bookable: false`. Link that row to the connection's Pickup locations.
- Booking it anyway is refused with the same message (422), before the carrier is asked to book.
  The order stays pending.

Rawafid keeps the account's pickup-location list for **5 minutes**. So for up to 5 minutes after a
deletion in the carrier's dashboard, the preview may not show the problem yet. Booking still refuses
it whenever the list is older than that. Opening the Pickup locations screen refreshes it.

Fix it by mapping the sender location again, or removing its mapping.

**Changing the key to another account:** if any sender location is mapped to a pickup location the
new account doesn't have, the edit is refused (422, `pickupLocationId` names it). Remap or clear
the mappings first.

---

## 5. Trying it

- **Local (sandbox carrier):** connect with key `valid-anything` and pick `SBX-1`. The account
  also has `SBX-2`. Create two sender locations, map one to `SBX-2`, then preview and book an order
  from each.
- **Staging:** the sandbox is off there. Use a Bosta connection, whose account lists its own pickup
  locations. The shared Bosta test account has only **one** ("Hunger"), so every dropdown offers just
  that one. Mapping still works, and the rows show `MAPPED` vs `DEFAULT`. To see two different
  pickup locations, add a second one in the Bosta staging dashboard.
