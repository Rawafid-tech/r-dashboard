# Carrier logos — FE contract

**Status: deployed to staging (PR #56, 2026-10-17).** Every carrier on staging has its logo: Bosta
and the 22 Accurate carriers, uploaded one by one through `PUT /api/admin/carriers/{code}/logo`;
only the test carrier `sandbox` has none (`logoUrl: null`). On staging, a merchant's catalog
shows `logoUrl` on every partner, a PDF upload is refused (`400`, checked in Arabic) and leaves
the logo as it was, and a merchant's token on the admin endpoint is `403`.

**What it is.** A platform admin uploads each shipping partner's logo from the console. Merchants
then see it wherever the partner shows: *More connections*, their connections, and the carrier on
shipments, returns and exchanges. A partner with no logo yet answers `null`: show its initials
or a generic truck icon.

---

## Changes to the earlier drops

These are additions only; nothing in the earlier drops is wrong now.

| Drop | Where | Now |
|---|---|---|
| `2026-09-26-shipping-partners.md` | `GET /api/carriers` items | gain `logoUrl` |
| `2026-09-26-shipping-partners.md` | a connection's `carrier` | gains `logoUrl` |
| `2026-09-26-shipments.md`, `2026-10-16-returns.md`, `2026-10-16-exchanges.md` | a shipment's / preview's `connection` (and the preview's connection list) | gains `carrierLogoUrl` |
| `2026-09-26-carrier-regions-admin.md`, `2026-10-17-accurate-carriers.md` | the admin carrier row | gains `logoUrl`; two new endpoints (§2) |

---

## 1. Showing a logo

Every carrier view carries an app-relative URL, or `null`:

```json
{ "code": "arco", "nameEn": "Arco", "nameAr": "أركو",
  "logoUrl": "/api/public/media/8f0d0c1e-5f6a-4b7e-9a51-2c1c4f3e7b10", "fields": [ … ], "capabilities": { … } }
```

- Prefix it with the API's origin, as for company logos and avatars. It needs no token
  (`GET /api/public/media/{id}`), and is cached for a day.
- Images are PNG, JPEG or WebP, in the carrier's own proportions (most are wide). Fit them in a
  box with `object-fit: contain`, never stretch.
- A new upload gets a **new URL**, so a cached old logo is never shown after a change.

Where it appears:

| Response | Field |
|---|---|
| `GET /api/carriers` (and each item) | `logoUrl` |
| connection responses (`/api/carrier-connections…`) | `carrier.logoUrl` |
| shipments, previews, returns, exchanges | `connection.carrierLogoUrl` |
| `GET /api/admin/carriers` and every admin carrier response | `logoUrl` |

---

## 2. Admin console: uploading a logo

Permission: `carrier:carrier:manage`.

### 2.1 `PUT /api/admin/carriers/{code}/logo` → `200`

`multipart/form-data` with one part, **`file`**. Answers the admin carrier row with the new
`logoUrl`:

```json
{ "id": "…", "code": "arco", "platform": "ACCURATE", "nameEn": "Arco", "nameAr": "أركو",
  "logoUrl": "/api/public/media/8f0d0c1e-…", "enabled": true, "running": true, "sortOrder": 20,
  "settings": { … }, "updatedAt": "…" }
```

It replaces any current logo; the old file is deleted.

| Status | When | Message |
|---|---|---|
| `400` | not PNG, JPEG or WebP (SVG included) | *"Only PNG, JPEG and WebP images are allowed"* (ar: «يُسمح فقط بصور PNG وJPEG وWebP») |
| `400` | the file's content is not the type it claims | *"File content does not match its declared type"* (ar: «محتوى الملف لا يطابق نوعه المعلن») |
| `400` | an empty file | *"The uploaded file is empty"* |
| `413` | over 2 MB | *"The file exceeds the maximum allowed size of 2 MB"* |
| `404` | no such carrier | the usual carrier not-found |

A refused upload changes nothing: the current logo stays.

### 2.2 `DELETE /api/admin/carriers/{code}/logo` → `200`

Removes the logo and deletes the file; answers the row with `logoUrl: null`. Removing a logo
that isn't there is also `200`.

**Suggested UI:** show the logo (or a placeholder) on each carrier row and in its edit form, with
*Upload* (accept `image/png,image/jpeg,image/webp`) and *Remove*.
