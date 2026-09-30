# Shipping partners (carrier connections) — FE contract

**Status: deployed to staging (PR #38, 2026-09-26).** Every payload below was captured from a local
run connected to Bosta's **staging** API with a real Bosta account (2026-09-26), not written by hand.

This is the "Shipping Partners" screen: a merchant connects **their own** carrier account (Bosta
first), we check it with the carrier live, and store the key encrypted. Nothing is booked yet —
shipments, labels and tracking come in later drops.

---

## 0. Screen → API map

| Screen element | API |
|---|---|
| Tab **More Connections** (carriers you can add) | `GET /api/carriers` |
| Tab **Connected** + search + "Show active only" | `GET /api/carrier-connections?search=&active=true` |
| Step 1 **Credentials** form | render `fields` from `GET /api/carriers` (§2) |
| **Test Connection** button | `POST /api/carriers/{code}/test` |
| Step 2 **Settings** → Save | `POST /api/carrier-connections` (new) / `PUT /api/carrier-connections/{id}` (edit) |
| Row toggle | `POST /api/carrier-connections/{id}/activate` · `/deactivate` |
| Row **Edit** | `GET /api/carrier-connections/{id}` then `PUT` |
| Row **⋯ → Remove** | `DELETE /api/carrier-connections/{id}` |

**Hide for now** (no backend behind them yet): *Webhook URL* (we register status callbacks with the
carrier ourselves, and the merchant never types one), *Service Type*, *Do not send SMS*,
*Return Available*, *Volumetric Weight Rate*, *Brand Name*, and the *feasibility/coverage* toggle.
Each will come with the feature that uses it.

**Permissions:** page `page:shippingPartners`; `carrierConnection:read` for the lists and
`carrierConnection:manage` for test/create/edit/toggle/remove. The owner always passes both.

**Logos:** ship them as static assets keyed by carrier `code` (`bosta`). There is no logo URL in the
API.

---

## 1. `GET /api/carriers` — what can be connected

Only carriers an admin has enabled. In dev/test environments you will also see
`sandbox` (a fake carrier — see §6); it never appears in production.

```json
[
  {
    "code": "bosta",
    "nameEn": "Bosta",
    "nameAr": "بوسطة",
    "fields": [
      { "key": "apiKey", "kind": "SECRET", "required": true, "label": "API key",
        "defaultValue": null, "options": [] },
      { "key": "pickupLocationId", "kind": "PICKUP_LOCATION", "required": false,
        "label": "Pickup location", "defaultValue": null, "options": [] },
      { "key": "packageType", "kind": "SELECT", "required": false, "label": "Package type",
        "defaultValue": "Parcel",
        "options": [ { "value": "Parcel", "label": "Parcel" },
                     { "value": "Document", "label": "Document" } ] },
      { "key": "packageSize", "kind": "SELECT", "required": false, "label": "Package size",
        "defaultValue": "SMALL",
        "options": [ { "value": "SMALL", "label": "Small" },
                     { "value": "MEDIUM", "label": "Medium" },
                     { "value": "LARGE", "label": "Large" } ] },
      { "key": "allowToOpenPackage", "kind": "BOOLEAN", "required": false,
        "label": "Allow opening the package", "defaultValue": false, "options": [] },
      { "key": "awbSize", "kind": "SELECT", "required": false, "label": "Label size",
        "defaultValue": "A6",
        "options": [ { "value": "A6", "label": "A6 (label printer)" },
                     { "value": "A4", "label": "A4" } ] },
      { "key": "awbLanguage", "kind": "SELECT", "required": false, "label": "Label language",
        "defaultValue": "ar",
        "options": [ { "value": "ar", "label": "Arabic" },
                     { "value": "en", "label": "English" } ] }
    ]
  }
]
```

Labels follow `Accept-Language` (`ar` → "مفتاح API", "نوع الشحنة", "طرد", …).

---

## 2. Rendering the form — the one rule to get right

**Do not hardcode Bosta's fields.** Render `fields` in the order given, by `kind`:

| `kind` | Input | Goes in |
|---|---|---|
| `SECRET` | password input. Never pre-filled; on edit show `••••{credentialHint}` as a placeholder | `credentials` |
| `SELECT` | dropdown of `options[].label`, sending `options[].value`; preselect `defaultValue` | `options` |
| `BOOLEAN` | toggle, default `defaultValue` | `options` |
| `TEXT` | text input (≤ 500 chars) | `options` |
| `PICKUP_LOCATION` | dropdown filled from the **Test Connection** response (§3) | `options` |

`SECRET` values go in `credentials`; **everything else** goes in `options`. Putting a secret in
`options` is refused (400) — `options` is stored unencrypted and shown back.

Suggested layout for the two-step screen: step 1 = the `SECRET` fields + **Test Connection**;
step 2 = connection name + active + the rest of `fields`. Test must succeed before step 2, because
the pickup-location picker needs its answer.

---

## 3. `POST /api/carriers/{code}/test` — Test Connection

Asks the carrier, saves nothing.

```json
{ "credentials": { "apiKey": "…" } }
```

`200`:

```json
{
  "pickupLocations": [
    { "id": "LTnG2XwZ_B", "name": "Hunger",
      "address": "Hosni Mubarak - Near El-Salab, Nasr City, Cairo", "isDefault": true }
  ]
}
```

Preselect the location with `isDefault: true`. Leaving `pickupLocationId` empty is allowed: the
carrier then uses the account's own default.

`422` — the carrier rejected the key (real response, `Accept-Language: ar`):

```json
{ "status": 422, "title": "Unprocessable Content", "instance": "/api/carriers/bosta/test",
  "detail": "رفض شريك الشحن بيانات الدخول هذه. تأكد من أن المفتاح كامل ويخص الحساب والبيئة الصحيحين." }
```

It is **422, not 401**: your session is fine — don't log the user out. Bosta answers a wrong key, an
empty key, and a key from the wrong environment (staging key on live, or the reverse) identically,
which is why the message mentions the environment.

`502` — the carrier didn't answer: "The shipping partner is not responding. Please try again in a
moment." Offer a retry; this is not the merchant's fault.

---

## 4. Connections

### 4.1 `POST /api/carrier-connections` → `201`

```json
{
  "carrierCode": "bosta",
  "name": "Bosta test",
  "credentials": { "apiKey": "…" },
  "options": { "pickupLocationId": "LTnG2XwZ_B", "awbSize": "A6" }
}
```

The carrier is asked again before anything is saved. Real response:

```json
{
  "id": "92a390d0-6e41-4aad-953a-fc11e77efd15",
  "carrier": { "code": "bosta", "nameEn": "Bosta", "nameAr": "بوسطة" },
  "name": "Bosta test",
  "active": true,
  "credentialHint": "4168",
  "options": { "pickupLocationId": "LTnG2XwZ_B", "packageType": "Parcel", "packageSize": "SMALL",
               "allowToOpenPackage": false, "awbSize": "A6", "awbLanguage": "ar" },
  "verifiedAt": "2026-09-26T11:37:50.012135Z",
  "createdAt": "2026-09-26T11:37:49.902615Z",
  "updatedAt": "2026-09-26T11:37:50.012144Z"
}
```

- Omitted options come back **filled with their defaults**.
- `credentialHint` is the key's last four characters (`null` when the key is too short to reveal
  any). The key itself is never returned by any endpoint.
- Several connections per company are fine, even to the same carrier — `name` must be unique within
  the company (case-insensitive).
- The **key order inside `options` is not stable** (it comes back reordered from storage). Render
  from `fields`, look values up by key.

### 4.2 `PUT /api/carrier-connections/{id}` → `200`

```json
{ "name": "Bosta main",
  "options": { "pickupLocationId": "LTnG2XwZ_B", "awbSize": "A4", "awbLanguage": "en" } }
```

- **`credentials` omitted, `{}`, or with the key left blank (`{"apiKey": ""}`) keeps the saved key.**
  Only a non-blank value counts as a new one.
- **`options` omitted keeps the saved settings; a map replaces them entirely** — send every value,
  not just the changed one (a key missing from the map falls back to its default).
- The carrier is asked again only when the key or the pickup location changes; a rename or a label
  size change saves without calling out (`verifiedAt` stays the same).

### 4.3 List — `GET /api/carrier-connections`

Standard `PageResponse`. Params: `search` (matches the connection name **and** the carrier's
name/code, so "bosta" finds every Bosta account), `active` (`true` for "Show active only"),
`page`, `size` (≤ 100), `sort` = `CREATED_AT` | `NAME`, `direction`.

### 4.4 Toggle, remove

`POST …/{id}/activate` · `POST …/{id}/deactivate` → the connection. `DELETE …/{id}` → `204`
(removes it and the saved key; the merchant's account at the carrier is untouched).

---

## 5. Errors

| Status | When | `detail` (en) |
|---|---|---|
| 400 | a field the form doesn't declare, a bad value, a required one missing — **the body has `field`** naming it; put the error beside that input | "This field is missing or has a value this shipping partner does not accept" |
| 404 | unknown/disabled carrier | "This shipping partner is not available" |
| 404 | unknown connection, or another company's | "Connection not found" |
| 409 | name already used | "You already have a connection with this name" |
| 409 | the saved key can no longer be read (server key changed) — ask them to re-enter it | "The saved credentials for this connection can no longer be read. Please enter them again." |
| 422 | the carrier rejected the key | see §3 |
| 422 | `pickupLocationId` is not one of the account's locations | "This pickup location is not on your account with the shipping partner" |
| 502 | the carrier did not answer | "The shipping partner is not responding. Please try again in a moment." |

All localized by `Accept-Language` (`ar` has every one).

If an admin **disables** a carrier, it disappears from `GET /api/carriers`, and test/create/edit on
it return 404 — existing connections still list, and can be switched **off** or removed, but
switching one back **on** is also a 404 until the carrier is enabled again.

---

## 6. Developing without a carrier account

Dev environments list a `sandbox` carrier. Its `apiKey` decides the outcome:

| key | result |
|---|---|
| starts with `valid-` | accepted; pickup locations `SBX-1` (default) and `SBX-2` |
| starts with `outage-` | `502` |
| anything else | `422` |

Its form has one field of every kind (`SECRET`, `PICKUP_LOCATION`, `SELECT`, `BOOLEAN`, `TEXT`), so
it exercises the whole renderer.

---

## 7. Admin console

- `GET /api/admin/carriers` (`carrier:carrier:read`) — every carrier with `enabled` and `running`
  (false = this deployment has no adapter for it, hidden from merchants regardless).
- `PUT /api/admin/carriers/{code}` `{ "enabled": false }` (`carrier:carrier:manage`) — the switch.
  SUPPORT can read but not switch.
