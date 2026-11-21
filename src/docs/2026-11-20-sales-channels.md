# 2026-11-20 — Sales channels and API keys

The drop for sales channels, 2026-11-20. Section numbers (§) belong to this part.

- **Part 1 — Sales channels and their API keys** (the API keys screen, the sales channels cards)
- **Part 2 — Orders from a sales channel** (new order fields and filters)

~~**Status: built, not yet deployed.**~~ **Deployed to staging 2026-11-20 (PR #83)**, checked end to end there (keys, scope, channel orders, retry, rotate, switch off, delete, reconnect). Keys on staging start `rwf_test_`.

---

# Part 1 — Sales channels and their API keys

## §1 What it is

A **sales channel** is something that sends Rawafid orders on a company's behalf:

- a Shopify store;
- a WooCommerce store;
- a plain **API** client, such as the merchant's ERP or their own script.

Every channel holds **one API key**. The integration calls the normal API with that key instead of
a user's access token.

Two screens read the same list:

| Screen | Shows | Filter |
| --- | --- | --- |
| **Developers → API keys** | every channel: name, key hint, order prefix, on/off switch, created, last used, delete | none, or `platform=API` for plain keys only |
| **Sales channels** | a Shopify card and a WooCommerce card, each with its setup steps and the stores connected | `platform=SHOPIFY` / `platform=WOOCOMMERCE` |

The steps on each card (install the Rawafid app, paste the key) are FE copy. The backend has no
per-platform step data.

## §2 Endpoints

All of them are under `/api/integrations/channels` and use the merchant's access token.

| Endpoint | Permission | Notes |
| --- | --- | --- |
| `GET /api/integrations/channels?platform=&search=&page=&size=` | `integration:read` | `PageResponse<Channel>`, newest first. `search` matches the name or the store domain. |
| `GET /api/integrations/channels/{id}` | `integration:read` | `Channel` |
| `POST /api/integrations/channels` | `integration:manage` | `201` `ChannelWithKey`. **The only time the key is shown.** |
| `PATCH /api/integrations/channels/{id}` | `integration:manage` | `{ name?, orderPrefix?, enabled? }`, answers `Channel` |
| `POST /api/integrations/channels/{id}/key` | `integration:manage` | rotate: `200` `ChannelWithKey` with a new key. The old key stops at once. |
| `DELETE /api/integrations/channels/{id}` | `integration:manage` | `204`. The key is revoked and the channel leaves the list. |

Create body:

```json
{
  "platform": "SHOPIFY",
  "name": "Shopify: my-store.myshopify.com",
  "storeDomain": "my-store.myshopify.com",
  "orderPrefix": "SH-"
}
```

- `platform`: `API` | `SHOPIFY` | `WOOCOMMERCE`, required.
- `name`: required, up to 100.
- `storeDomain`: **required for SHOPIFY and WOOCOMMERCE**, and ignored for API. A pasted URL is
  fine: `https://My-Store.myshopify.com/admin` is stored as `my-store.myshopify.com`. A company can
  connect each store only once at a time.
- `orderPrefix`: optional. Letters, digits and `-`, up to 10. It goes in front of the store's order
  numbers **exactly as typed**, so `SH-` turns `#1001` into `SH-1001`. In PATCH, `""` removes it and
  `null` keeps it.

`Channel`:

```json
{
  "id": "…",
  "platform": "SHOPIFY",
  "name": "Shopify: my-store.myshopify.com",
  "storeDomain": "my-store.myshopify.com",
  "orderPrefix": "SH-",
  "enabled": true,
  "keyHint": "rwf_live_Ab3x",
  "createdAt": "2026-11-20T10:00:00Z",
  "lastUsedAt": "2026-11-20T10:05:00Z"
}
```

`ChannelWithKey` is `{ "apiKey": "rwf_live_…", "channel": Channel }`.

- Show `apiKey` in a copy box with a warning like "Copy it now, it won't be shown again". Don't keep
  it anywhere after the dialog closes.
- A lost key is replaced by **rotate**, not by deleting and re-creating. Rotate keeps the channel,
  so its orders stay linked to it.
- `keyHint` is what the list shows: `rwf_live_Ab3x••••`.
- `lastUsedAt` is null until the key is used, and is accurate to the minute.

Errors:

| Status | `code` | When |
| --- | --- | --- |
| 400 | `integration.channel.storeDomainRequired` | a store without its domain |
| 409 | `integration.channel.storeTaken` | this store is already connected to the company |
| 403 | `integration.channel.keyExceedsYourAccess` | create or rotate by someone who isn't the owner and lacks any of the key's permissions (§5). Hide Create/Rotate for them. |
| 404 | `integration.channel.notFound` | unknown, removed, or another company's id |

Every problem detail from these endpoints carries a stable `code` next to the localized `detail`.

## §3 The switch, rotate and delete

- **Switch off** (`PATCH {enabled: false}`): the key answers `401 apiKey.disabled` until it is
  switched back on. Nothing is lost.
- **Rotate**: a new key for the same channel. The old key answers `401 apiKey.invalid`.
- **Delete**: the channel leaves the list and its key answers `401 apiKey.revoked`. Its orders keep
  showing the channel's name.
- **Reconnecting a deleted store** (same platform and domain) brings back **the same channel** with
  a new key, the new name and the new prefix. The answer is `201` with the old `id`, so the orders
  it sent before still count as its own.

Suggested confirm copy for delete: "The store will stop sending orders until it is connected again."

## §4 Permissions

There is a new catalog page with two actions. The labels come from `GET /api/permissions` as usual.

| Code | en | ar |
| --- | --- | --- |
| `page:integrations` | Sales channels and API keys | قنوات البيع ومفاتيح API |
| `integration:read` | View sales channels and API keys | عرض قنوات البيع ومفاتيح API |
| `integration:manage` | Manage sales channels and API keys | إدارة قنوات البيع ومفاتيح API |

The owner passes both without holding them.

**Creating or rotating a key needs more than `integration:manage`.** A key holds the permissions in
§5, so whoever makes one must be the owner or hold all of them. Otherwise the answer is
`403 integration.channel.keyExceedsYourAccess`. Renaming, switching off and deleting need only
`integration:manage`.

## §5 What a key can do (for the docs page or tooltip)

- A key acts as its company, with a fixed set of permissions:
  - orders: read and manage;
  - shipments: read and manage;
  - wallet: read;
  - sender locations, shipping boxes and carrier connections: read.
- It reaches only those endpoints, plus `GET /api/company`, `GET /api/carriers`,
  `GET /api/public/**` and the key's own
  `GET`/`DELETE /api/integrations/channels/current`. Anything else answers
  `403 apiKey.notAllowed`. That includes users, roles, the company profile edit, wallet top-up and
  the channel list itself.
- It is sent as `Authorization: Bearer <key>` or `X-Api-Key: <key>`.
- It is limited to 600 requests a minute per key. Over that, it gets `429 apiKey.tooManyRequests`
  with `Retry-After` in seconds.

---

# Part 2 — Orders from a sales channel

## §6 New fields on every order

On `GET /api/orders/{id}` and on create, edit and cancel responses:

```json
{
  "source": "SHOPIFY",
  "channel": { "id": "…", "name": "Shopify: my-store.myshopify.com", "platform": "SHOPIFY" },
  "externalId": "gid://shopify/Order/6123456789",
  "externalName": "#1001"
}
```

On list rows: `source`, `channel` and `externalName`. `externalId` is detail-only.

- `source`: `MANUAL` | `API` | `SHOPIFY` | `WOOCOMMERCE`. Typed-in orders stay `MANUAL`, with
  `channel`, `externalId` and `externalName` all null.
- **Dashboard:** show a platform badge (Shopify, WooCommerce or API) and `externalName` on order rows
  and the order page when `channel` is set. The channel's name works as a tooltip. A deleted channel
  still shows its name.

## §7 New list filters

`GET /api/orders` gains:

- `source`;
- `channelId`;
- `externalId` (exact);
- `orderNumber`: **exact** and case-insensitive. This is not `search`, which is a "contains" match.

A **"Source" filter** (Manual / Shopify / WooCommerce / API) is the natural one for the list.

## §8 Creating with a key (integrations only, no dashboard change)

- `POST /api/orders` sent with a key takes the channel's platform as `source`.
- It may send `externalId` (up to 255) and `externalName` (up to 100).
- Sending the same `externalId` again answers **`200`** with the order already made, unchanged, not
  `201` with a copy.
- With a blank `orderNumber`, the number is `externalName` without its `#`, with the channel's prefix
  in front. Failing that, the next `ORD-` number is used.
- From a dashboard session, `externalId` or `externalName` answer
  `400 order.externalIdNeedsChannel`. The Add Order form must not send them.
- An edit never changes `externalId` or `externalName`.
  - From a dashboard session, sending either on edit is the same
    `400 order.externalIdNeedsChannel`.
  - A key sending them on edit has them ignored.
  - A number typed on edit is used as given, with no prefix added.
- A typed `orderNumber` that is too long once prefixed (more than 50 characters) answers
  `400 order.numberTooLongWithPrefix`.
