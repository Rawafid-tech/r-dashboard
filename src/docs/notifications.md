# Notifications (the bell) and notification settings — FE contract

**Status: built, not yet merged.** The payloads below were captured from a local run against the
sandbox carrier (an order whose receiver refuses it: picked up → problem → on its way back →
returned), not written by hand.

**What it is.** When a shipment's status changes, everyone on the merchant's team who may see
shipments is told:
- in the app, as an entry in their notifications list (the bell);
- by email, for the changes someone has to act on.

Each person picks, per kind of change, whether they want it in the app, by email, both or neither.

**Who is told:** the owner, plus every staff member whose role grants `shipment:read`. Suspended
members are not told, and neither are invitations not yet accepted. Nobody is told about their own
actions: cancelling a shipment yourself, or a booking refused while you are on the booking screen
(you already see that 422).

---

## Changes to the earlier drops

None. Everything here is new. The shipment and order APIs are unchanged.

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| Bell icon with the unread badge (in the top bar) | `GET /api/notifications/unread-count` (§2). Poll it every 30–60 s and when the tab regains focus: there are no live push updates yet |
| Bell dropdown / Notifications page | `GET /api/notifications` (§1) |
| Clicking an entry | `POST /api/notifications/{id}/read` (§2), then open `link` (`SHIPMENT` → the shipment's details page) |
| "Mark all as read" | `POST /api/notifications/read-all` (§2) |
| Settings → **Notifications** (one row per kind, two toggles: *In app*, *Email*) | `GET` / `PUT /api/notification-preferences` (§3) |

**Permissions:** none. Every signed-in user has their own list and their own settings, and nobody
can see anyone else's.

---

## 1. The list

### `GET /api/notifications?unread=false&page=0&size=20` → `200`

Newest first. `unread=true` lists only the unread ones. `size` is at most 100.

```json
{
  "content": [
    {
      "id": "453160e7-5d32-41ba-b73c-873578efe1cb",
      "topic": "SHIPMENT_ISSUE",
      "title": "Order ORD-100001 needs attention",
      "body": "The carrier reported a problem with the delivery. Customer refused the shipment",
      "params": { "reason": "Customer refused the shipment", "orderNumber": "ORD-100001", "trackingNumber": "1791557639973" },
      "link": { "type": "SHIPMENT", "id": "8deb0a1d-eb16-4908-a71b-36bee771448e" },
      "read": false,
      "createdAt": "2026-10-09T14:54:10.060465Z"
    },
    {
      "id": "2bc1b856-cd2f-4129-a5fa-430cebf4b94d",
      "topic": "SHIPMENT_RETURNED",
      "title": "Order ORD-100001 is back with you",
      "body": "The carrier returned the parcel to you.",
      "params": { "reason": "", "orderNumber": "ORD-100001", "trackingNumber": "1791557639973" },
      "link": { "type": "SHIPMENT", "id": "8deb0a1d-eb16-4908-a71b-36bee771448e" },
      "read": false,
      "createdAt": "2026-10-09T14:54:20.056383Z"
    }
  ],
  "page": 0, "size": 10, "totalElements": 4, "totalPages": 1
}
```

(This sample shows two of the four entries, and not in order: the real response was newest first.)

- `title` and `body` are ready to show, in the request's language (`Accept-Language`). They are built
  when you read them, so switching the app to Arabic switches old entries too. Arabic for the first
  entry above: `"title": "الطلب ORD-100001 يحتاج إلى متابعة"`, and for the second
  `"title": "عاد الطلب ORD-100001 إليك"`, `"body": "أعادت شركة الشحن الشحنة إليك."`.
- `params` holds the same values if you'd rather build your own layout (for example, the order number
  as a link). `reason` is the carrier's own words, so it may be in either language, or empty.
- `link` is what the entry is about. Today it is always `{"type": "SHIPMENT", "id": <shipment id>}`.
  Route it to the shipment details page. Treat an unknown `type` as "no link".
- Use `topic` for the icon or colour:

| `topic` | When | In app by default | Email by default |
|---|---|---|---|
| `SHIPMENT_PICKED_UP` | the carrier collected it | ✓ | — |
| `SHIPMENT_DELIVERED` | delivered to the receiver | ✓ | — |
| `SHIPMENT_RETURNED` | back with the merchant | ✓ | — |
| `SHIPMENT_RETURNING` | delivery failed, coming back | ✓ | ✓ |
| `SHIPMENT_ISSUE` | the carrier reported a problem with an attempt (receiver out, refused, postponed). Once per failed attempt | ✓ | ✓ |
| `SHIPMENT_LOST` | lost or damaged by the carrier | ✓ | ✓ |
| `SHIPMENT_CANCELLED_BY_CARRIER` | the carrier cancelled it before pickup; the order can be booked again. Never sent for a cancel the merchant asked for | ✓ | ✓ |
| `SHIPMENT_BOOKING_FAILED` | a booking the carrier never confirmed, found out later (the order can be booked again) | ✓ | ✓ |

Entries are deleted after **90 days**, read or not. An entry can arrive a little after the shipment's
status changed: they are written in the background, and one that failed is tried again within about
5 minutes.

---

## 2. Badge and read state

### `GET /api/notifications/unread-count` → `200`
```json
{ "unread": 4 }
```

### `POST /api/notifications/{id}/read` → `200`
Returns the entry (same shape as in §1) with `"read": true`. Calling it again on a read entry is fine.

| Status | When | `detail` |
|---|---|---|
| 404 | not yours, or doesn't exist | "Notification not found" / "الإشعار غير موجود" |

### `POST /api/notifications/read-all` → `200`
```json
{ "marked": 3 }
```
`marked` is how many were unread.

---

## 3. Settings

### `GET /api/notification-preferences` → `200`

Every topic, always all of them, in the order of the table in §1:

```json
{
  "topics": [
    { "topic": "SHIPMENT_PICKED_UP", "inApp": true, "email": false, "inAppByDefault": true, "emailByDefault": false },
    { "topic": "SHIPMENT_DELIVERED", "inApp": true, "email": false, "inAppByDefault": true, "emailByDefault": false },
    { "topic": "SHIPMENT_RETURNED", "inApp": true, "email": false, "inAppByDefault": true, "emailByDefault": false },
    { "topic": "SHIPMENT_RETURNING", "inApp": true, "email": true, "inAppByDefault": true, "emailByDefault": true },
    { "topic": "SHIPMENT_ISSUE", "inApp": true, "email": true, "inAppByDefault": true, "emailByDefault": true },
    { "topic": "SHIPMENT_LOST", "inApp": true, "email": true, "inAppByDefault": true, "emailByDefault": true },
    { "topic": "SHIPMENT_CANCELLED_BY_CARRIER", "inApp": true, "email": true, "inAppByDefault": true, "emailByDefault": true },
    { "topic": "SHIPMENT_BOOKING_FAILED", "inApp": true, "email": true, "inAppByDefault": true, "emailByDefault": true }
  ]
}
```

The `…ByDefault` fields are there for a "Reset to defaults" button. Row labels are the FE's own:
the API sends no label for a topic.

### `PUT /api/notification-preferences` → `200`

**Replaces the whole set.** Send every row the screen shows. A topic you leave out goes back to its
default. Every field is required.

```json
{ "topics": [
  { "topic": "SHIPMENT_PICKED_UP", "inApp": false, "email": false },
  { "topic": "SHIPMENT_DELIVERED", "inApp": true, "email": true }
] }
```

The answer has the same shape as the `GET`, with all eight topics.

| Status | When | `detail` | Extra field |
|---|---|---|---|
| 422 | the same topic twice | "Each notification topic can be listed only once" / "لا يمكن إدراج نوع الإشعار أكثر من مرة" | `topic` |
| 400 | a missing `inApp`/`email`, or an unknown `topic` | validation error (existing format) | — |

---

## 4. The email

The email is sent in the recipient's own language (their **Language** setting under *System
settings*), not the browser's.
- **Subject:** the entry's title, e.g. "Order ORD-100001 needs attention".
- **Body:** the entry's body and a **View shipment** button.
- **The button's link:** `{app base URL}/shipments/{shipment id}`. **The web app needs a route at
  `/shipments/:id`** that opens the shipment's details. Tell the backend if the route is different.

---

## 5. Trying it

- **Local:** use a sandbox connection and an order whose receiver's first name is `Bounce`. With
  the poll sped up (`RAWAFID_SHIPMENTS_TRACKING_CRON='*/5 * * * * *'`,
  `RAWAFID_SHIPMENTS_TRACKING_STALE=0s`), the order goes picked up → problem → on its way back →
  returned within about 20 s. You get 4 entries, and 2 emails in the app log.
- **Staging:** book on the Bosta connection. Entries appear as Bosta's webhooks arrive (or on the
  30-minute poll). Staging email goes wherever its mail provider is configured.
