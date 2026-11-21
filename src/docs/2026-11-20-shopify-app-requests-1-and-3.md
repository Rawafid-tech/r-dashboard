# Shopify app: requests 1 and 3

Reply from the Rawafid backend, 20 November 2026. It covers request 1 (API keys) and request 3
(external reference and idempotency). Requests 4, 5, 6 and 7 come later. ~~Request 2 is next.~~ Request 2 is built, in its own note.

**Status: live on staging (https://rawafid.softizone.net) since 20 November 2026.** Staging keys start `rwf_test_`.

## What changed from your request

- **Keys belong to a sales channel.** Instead of `/api/integrations/keys`, the merchant connects a
  **sales channel** at `/api/integrations/channels`: platform `SHOPIFY`, the store domain, and an
  optional order prefix. The channel holds one key.
  - The channel survives a key rotation, so orders stay linked after a reconnect.
  - Each store can be connected to a company only once at a time.
- **No `externalStoreId` field.** The key already identifies the store, so `externalStoreId` isn't
  needed. Uniqueness is per company, per channel, per `externalId`.
- **Error codes are lower camel case**, in a `code` property next to `detail`. For example
  `apiKey.revoked`, not `API_KEY_REVOKED`.

## Using a key

- Send it as `Authorization: Bearer <key>` or `X-Api-Key: <key>`.
- Keys look like `rwf_test_…` on staging and `rwf_live_…` in production: the prefix plus 43 base62
  characters.
- A key doesn't expire and survives password changes. It stops only when the merchant switches it
  off, rotates it or deletes it, or when the app disconnects.
- It acts as the company, with these permissions:
  - `order:read`, `order:manage`;
  - `shipment:read`, `shipment:manage`;
  - `wallet:read`;
  - `senderLocation:read`, `shippingBox:read`, `carrierConnection:read`.
- **Every endpoint in your list works with it**, plus `GET /api/public/**` and `GET /api/carriers`.
  The exception is `GET /api/auth/me`; use
  `GET /api/integrations/channels/current` instead (below).
- Anything outside the list answers `403` with code `apiKey.notAllowed`.

| Status | `code` | Meaning | What the app does |
| --- | --- | --- | --- |
| 401 | `apiKey.invalid` | no such key: a typo, or rotated away | ask the merchant for the new key |
| 401 | `apiKey.disabled` | switched off by the merchant | tell them to switch it back on |
| 401 | `apiKey.revoked` | channel deleted, or the app disconnected | reconnect |
| 403 | `apiKey.notAllowed` | endpoint not open to keys | (a bug on our side or yours) |
| 429 | `apiKey.tooManyRequests` | over 600 requests a minute for this key | wait `Retry-After` seconds |

### Who is this key

`GET /api/integrations/channels/current` answers:

```json
{
  "companyId": "…",
  "companyName": "EreYehia Store",
  "channel": { "id": "…", "platform": "SHOPIFY", "name": "…", "storeDomain": "my-store.myshopify.com",
               "orderPrefix": "SH-", "enabled": true, "keyHint": "rwf_live_Ab3x",
               "createdAt": "…", "lastUsedAt": "…" }
}
```

- `GET /api/company` also works with the key, and its `id` is the company id.
- `DELETE /api/integrations/channels/current` revokes the key making the call. Use it for your
  Disconnect button.

## Orders (request 3)

`POST /api/orders` with a key accepts two optional fields:

```json
{ "externalId": "gid://shopify/Order/6123456789", "externalName": "#1001", "...": "the usual order" }
```

- **`source` is set from the channel**, so don't send it. It comes back as `"SHOPIFY"`.
- **Idempotent.** The same `externalId` again answers `200` with the existing order, unchanged.
  A new order answers `201`.
  - This holds under concurrency too: two simultaneous creates of one Shopify order make one order.
- **Order number.**
  - If you leave `orderNumber` blank, we use `externalName` without the `#`, with the channel's prefix
    in front. With prefix `SH-`, `#1001` becomes `SH-1001`.
  - If you send `orderNumber`, it gets the prefix too.
  - A number already taken in the company is still `409 order.numberTaken`.
- **Every order returns** `source`, `externalId`, `externalName` and
  `channel {id, name, platform}`. List rows carry `source`, `externalName` and `channel`.
- **Filters on `GET /api/orders`:** `source`, `externalId`, `channelId`, and an **exact**
  `orderNumber`, case-insensitive. The exact `orderNumber` is the stopgap you asked for.
- An edit (`PUT`) never changes `externalId` or `externalName`; they're ignored there. A number
  typed on edit is used as given, with no prefix added.
- A typed `orderNumber` too long once prefixed (more than 50 characters) is
  `400 order.numberTooLongWithPrefix`.
- **Disconnect and reconnect keep the link.** Connecting the same store again after a disconnect
  brings back the same channel with a new key. Re-sent orders answer `200` with the existing
  order.

## Until request 2 lands

> Request 2 is now built: see `2026-11-20-shopify-app-request-2.md`. Pasting a key stays as the
> fallback.

The merchant creates the key in the Rawafid dashboard under **Sales channels → Shopify → Connect**,
with the store domain, and pastes it into the app. It replaces the email and password login.
