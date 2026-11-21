# 2026-11-20 — Connect with Rawafid

The approval page a store's app (the Rawafid Shopify app first) opens so the merchant can connect
their store without pasting an API key. It builds on the sales channels and API keys in
`2026-11-20-sales-channels.md`. Section numbers (§) belong to this file.

**Deployed to staging 2026-11-20 (PRs #84, #85)** and checked end to end there: client check,
approve, code exchange, reconnect, replay, disconnect. Staging has a test app registered; the real
Shopify app is registered once its redirect URLs arrive. Until then you can build the page against
any `client_id` and expect the `unknownClient` error path.

---

## §1 What it is

The Shopify app gets its API key **without the merchant pasting one**. It's the standard OAuth 2.0
authorization-code flow with PKCE:

1. In the Shopify app the merchant clicks **Connect with Rawafid**. A new browser tab opens
   `https://<dashboard>/connect?...` (§2).
2. **Your page.** If the merchant isn't signed in, they log in, or sign up. Then they land back on
   `/connect` with the same query.
3. The page shows what is asking and the Allow and Cancel buttons (§3).
4. On **Allow**, the page calls the backend, which answers with a URL. The page sends the browser
   there. The app's server then trades the code for the key (no FE part).

Pasting a key by hand (`2026-11-20-sales-channels.md` Part 1) stays as the fallback.

## §2 The route and its query

`GET /connect` with these query parameters, all from the app:

| Parameter | Meaning |
| --- | --- |
| `client_id` | which app is asking, e.g. `shopify-app` |
| `redirect_uri` | where to send the browser back |
| `state` | the app's value; pass it through untouched |
| `code_challenge` | PKCE; pass through |
| `code_challenge_method` | always `S256`; pass through |
| `store` | the Shopify domain, e.g. `my-store.myshopify.com`; show it on the page |

- **Keep the whole query through login, sign-up and email verification.** A new merchant must land
  back on `/connect` with the same query, for example via a `returnTo` you already use.
- Don't change, re-encode or drop any parameter. The backend matches `redirect_uri` character for
  character.

## §3 The page

**First call** (anonymous, so it can run before login):

```
GET /api/public/connect/client?client_id=<client_id>&redirect_uri=<redirect_uri>
200 → { "clientId": "shopify-app", "name": "Rawafid Shipping for Shopify", "platform": "SHOPIFY" }
```

- If it answers `400` (`integration.connect.unknownClient` or `integration.connect.redirectMismatch`),
  show an error page with the `detail` text. **Never redirect anywhere** in that case.
- Otherwise show:
  - **"{name} wants to connect to {store}"**;
  - what it will be able to do: create and update orders, book shipments and print labels, read the
    wallet balance;
  - **Allow** and **Cancel**.

**Who may allow.** The owner, or a user who has `integration:manage` and also every permission a key
holds:
- `order:read`, `order:manage`;
- `shipment:read`, `shipment:manage`;
- `wallet:read`;
- `senderLocation:read`, `shippingBox:read`, `carrierConnection:read`.

Check this from `GET /api/auth/me`. Anyone else sees **"Ask your company owner to connect"**
instead of the buttons. The backend refuses them anyway (`403`).

**Allow:**

```
POST /api/integrations/connect/authorize        (the user's access token)
{
  "clientId": "...", "redirectUri": "...", "state": "...",
  "codeChallenge": "...", "codeChallengeMethod": "S256", "store": "..."
}
200 → { "redirectUrl": "https://<app>/rawafid/callback?code=…&state=…" }
```

Send the values exactly as they came in the query. The snake_case names (`client_id`, ...) are
accepted too. Then send the browser to `redirectUrl`, for example with
`window.location.assign(redirectUrl)`.

**Cancel:** no backend call. Send the browser to `<redirect_uri>?error=access_denied&state=<state>`
(use `&` instead of `?` if `redirect_uri` already has a query, and URL-encode `state`). Only do this
after the first call returned `200`.

## §4 Errors from Allow

Problem details with `code`, in en and ar like everywhere else:

| Status | `code` | Show |
| --- | --- | --- |
| 400 | `integration.connect.unknownClient` | the error page |
| 400 | `integration.connect.redirectMismatch` | the error page |
| 400 | `integration.connect.badChallenge` | "Start again from the app" (`detail`) |
| 400 | `integration.connect.storeInvalid` | same |
| 403 | `integration.connect.companyMismatch` | `detail` |
| 403 | `integration.channel.keyExceedsYourAccess` | "Ask your company owner to connect" |
| 403 | (no code) | same: the user lacks `integration:manage` |

## §5 What changes elsewhere

- After a connect, the store appears on the Shopify card and in the API keys list, named
  `Shopify: my-store.myshopify.com`. Delete there disconnects it (`2026-11-20-sales-channels.md` Part 1 §2).
- **Connecting the same store again** keeps the same row but replaces its key, and switches it back
  on if it was off. It never answers `409` the way the manual create does.
- No new permission node. `integration:manage` covers it.
