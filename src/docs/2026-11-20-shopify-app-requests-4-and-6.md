# Shopify app: requests 4 and 6 (webhooks, and shipments changed since a time)

Reply from the Rawafid backend, 20 November 2026. Request 1 and 3 are in
`2026-11-20-shopify-app-requests-1-and-3.md`, request 2 in `2026-11-20-shopify-app-request-2.md`.

**Status: live on staging (rawafid.softizone.net) since 20 November 2026.**

## What we need from you

- **Your webhook receiver URL** for staging, and later production (https). We register it on your
  Connect client together with a webhook secret, which we send you through a private channel. It is
  a different secret from your `client_secret`.

## Request 6: shipments changed since a time

```
GET /api/shipments?updatedSince=2026-11-20T10:00:00Z&sort=UPDATED_AT&direction=ASC&page=0&size=100
X-Api-Key: rwf_…
```

- `updatedSince` is inclusive (ISO 8601 instant). `sort=UPDATED_AT` is new; `direction` is `ASC` or
  `DESC` (default `DESC`). Paged as before, `size` at most 100, `id` breaks ties.
- Every shipment already returns `updatedAt`, `kind`, `status`, `trackingNumber`, `connection`
  (the carrier: `carrierCode`, `carrierNameEn`/`Ar`, `carrierLogoUrl`) and `issue`.
- **Sync like this:**
  1. Ask with `sort=UPDATED_AT&direction=ASC&page=0&size=100`.
  2. Move `updatedSince` to the last row's `updatedAt` and ask again with `page=0`, until a page
     comes back short. Don't step through `page=1, 2…`: shipments that change while you page move
     to the end and shift the later pages, so a row can fall between two pages.
  3. Start each sync about 2 minutes before where the last one ended. `updatedAt` is stamped when
     a change is made, a moment before it's committed, so a change can show up with a time just
     below one you've already passed.
  4. Drop repeats by `id` + `updatedAt`.
- A shipment's `updatedAt` also moves on our own bookkeeping (e.g. while a booking is being
  confirmed with the carrier). Treat a shipment you get back as "maybe changed", not "changed".
- No `source=SHOPIFY` filter: shipments don't carry the channel. With webhooks below you only need
  `updatedSince` as a safety net (e.g. every hour), not as the main sync.

## Request 4: shipment webhooks

Sent for every shipment of every company that connected **through the Connect button** (request 2)
and has at least one connected, switched-on store. A store connected by pasting a key sends
nothing; connecting it once through the button turns webhooks on. Rotating the store's key in the
Rawafid dashboard turns them off again until it's reconnected through the button, as do switching
the store off and disconnecting it. A company with several stores on
your app gets one request per change, not one per store.

```
POST <your webhook URL>
Content-Type: application/json
X-Rawafid-Timestamp: 1763632800
X-Rawafid-Event-Id: 6f1c…
X-Rawafid-Signature: sha256=<hex>

{"eventId":"6f1c…","event":"shipment.booked","companyId":"…","shipmentId":"…","occurredAt":"2026-11-20T10:00:00.123456Z"}
```

| `event` | When |
| --- | --- |
| `shipment.booked` | The carrier accepted the booking: right away (`201`), or later for one that answered `202` with status `BOOKING`, including bulk bookings |
| `shipment.booking_failed` | The booking failed, whether right away (`422`) or later |
| `shipment.status_changed` | Status, tracking number, issue, delivery attempts, failure, or an exchange's swap changed, including the merchant's own cancel |

- **Verify:** `hex(HMAC-SHA256(webhookSecret, "<X-Rawafid-Timestamp>.<raw body>"))` must equal the
  part after `sha256=`. Compare in constant time, over the raw bytes as received (don't re-serialise
  the JSON). Reject a timestamp more than 5 minutes from now.
- **Body:** ids only. Read the shipment with `GET /api/shipments/{shipmentId}` using the company's
  key. Fields may be added later; ignore unknown ones.
- **Answer** any 2xx within 10 seconds (5 to connect). Do the work after answering.
- **Retries:** anything else, or no answer, is retried after 1 min, 5 min, 15 min, 1 h, 3 h, 6 h and
  12 h, then dropped (about 22 hours in all). Each retry is signed again with a fresh timestamp.
- **Duplicates and order:** the same `eventId` can arrive twice (e.g. after a timeout on our side);
  drop repeats. Requests are not guaranteed to arrive in order, which is harmless because you re-read
  the shipment.
- Redirects are not followed.
