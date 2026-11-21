# Shopify app: request 2 (Connect with Rawafid)

Reply from the Rawafid backend, 20 November 2026. It covers request 2, the Connect button. Requests 1
and 3 are in `2026-11-20-shopify-app-requests-1-and-3.md`.

**Status: live on staging (rawafid.softizone.net) since 20 November 2026.** Your app can use it
once we register it (below).

## What we need from you

- **Your redirect URLs**, development and production, written exactly as you'll send them. We match
  them character for character: same scheme, host, path and query, and no trailing slash unless you
  send one.
- We then send you a `client_id` (e.g. `shopify-app`) and a `client_secret` through a private
  channel. Keep the secret on your server only.

## The flow

1. **Open the approval page** in a new top-level tab, not inside the embedded admin iframe:

   ```
   https://<dashboard>/connect?client_id=…&redirect_uri=…&state=…
       &code_challenge=…&code_challenge_method=S256&store=my-store.myshopify.com
   ```

   - `state`: random, up to 500 characters; check it on the way back.
   - `code_challenge` = base64url, unpadded, of SHA-256 of your `code_verifier`. The verifier is 43–128
     characters of `A-Z a-z 0-9 - . _ ~`.
   - `store` comes from your Shopify session, never typed by the merchant (App Store requirement
     2.3.1). It must match `^[a-z0-9][a-z0-9-]*\.myshopify\.com$`.

2. **The merchant approves.** The browser comes back to
   `<redirect_uri>?code=…&state=…`. If they cancel, it comes back to
   `<redirect_uri>?error=access_denied&state=…`. An unknown `client_id` or an unregistered
   `redirect_uri` shows an error page and never comes back.

3. **Trade the code within 5 minutes**, from your server:

   ```
   POST /api/integrations/connect/token
   Content-Type: application/json          (application/x-www-form-urlencoded also works)

   { "client_id": "…", "client_secret": "…", "code": "…",
     "code_verifier": "…", "redirect_uri": "…" }
   ```

   - `grant_type` is optional; if you send it, it must be `authorization_code`.
   - You may send `client_id` and `client_secret` as HTTP Basic (`Authorization: Basic …`) instead
     of in the body, as most OAuth libraries do. Don't send the secret both ways.

   ```json
   {
     "access_token": "rwf_live_…",
     "token_type": "Bearer",
     "apiKey": "rwf_live_…",
     "keyId": "<uuid>",
     "companyId": "<uuid>",
     "companyName": "EreYehia Store",
     "channel": { "id": "<same as keyId>", "platform": "SHOPIFY", "name": "Shopify: my-store.myshopify.com",
                  "storeDomain": "my-store.myshopify.com", "orderPrefix": null, "enabled": true,
                  "keyHint": "rwf_live_Ab3x", "createdAt": "…", "lastUsedAt": null }
   }
   ```

   `access_token` and `apiKey` are the same key: the first is for OAuth client libraries. The
   response carries `Cache-Control: no-store`. Store the key encrypted. It works exactly like a
   pasted key (requests 1 and 3).

## Errors from the token call

OAuth-shaped, as you asked: `{ "error": "…", "error_description": "…" }`. The description is in
English, or Arabic with `Accept-Language: ar`.

| Status | `error` | When |
| --- | --- | --- |
| 401 | `invalid_client` | unknown `client_id` or wrong secret |
| 400 | `invalid_request` | a field missing, or the secret sent both in the body and as Basic |
| 400 | `unsupported_grant_type` | `grant_type` other than `authorization_code` |
| 400 | `invalid_grant` | unknown, expired or already-used code; or a different `redirect_uri`, client or verifier from the approval |

- **A code is tried once.** After any attempt by your client that gets past `invalid_client`, the
  code is spent, even if the verifier was wrong. Start the flow again.
- **Don't retry a token call with the same code.** If a code that already bought a key is presented
  again, we treat it as leaked and **revoke that key** (RFC 6749 §4.1.2), unless a newer key has
  replaced it since. If your call times out,
  check `GET /api/integrations/channels/current` with the key you may have received, or run the flow
  again.

## Connecting again, and disconnecting

- **Connecting the same store again** keeps the same channel (`keyId` unchanged). It gives a new key
  and the previous one stops working at once. A channel the merchant had switched off is switched
  back on.
- **A store disconnected earlier** comes back as the same channel too, so its orders stay linked and
  re-sent orders are recognised.
- **Disconnect** is `DELETE /api/integrations/channels/current` with the key. That's the
  `/keys/current` you asked for, under the channels path.

## Settings from inside your app (Built for Shopify 3.1.5)

`PATCH /api/integrations/channels/current` with the key, body `{ "name"?: "…", "orderPrefix"?: "SH-" }`.

- The prefix is letters, digits and dashes, up to 10. An empty string removes it.
- Switching the key off isn't possible from here, since a key couldn't switch itself back on. Use
  Disconnect.

## App review

Shopify's reviewers need working Rawafid test credentials in your submission. Tell us before you
submit and we'll set up a review account in production.
