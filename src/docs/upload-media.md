# 2026-07-24 — Media uploads, company logo & user avatar

New in this drop: a generic **media** API (file uploads), plus the **company logo** and the
**user profile image (avatar)** built on top of it.

> **Status: live on staging** (`https://rawafid.softizone.net`) as of today — merged via PRs
> #12/#13 and smoke-verified end-to-end against staging itself: upload, public serving over
> HTTPS, logo and avatar attach/clear all behave exactly as documented below.

**The one rule to internalize: reference media by `id`, never by `url`.** The `url` in responses
is a convenience for rendering (`<img src>`); its shape may change (e.g. to a CDN) without
notice. Anywhere you *store or submit* a reference — like setting the logo — you use the `id`.

---

## 1. Upload a file

```
POST /api/media
Authorization: Bearer <merchant token>
Content-Type: multipart/form-data      (single part named "file")
```

Accepted: **PNG, JPEG, WebP — up to 2 MB.** The declared content type must match the file's
actual bytes: a `.pdf` renamed to `.png` is rejected.

`201`:

```json
{
  "id": "33e7f8ce-ca7f-4244-9c7f-e641ff203c78",
  "url": "/api/public/media/33e7f8ce-ca7f-4244-9c7f-e641ff203c78",
  "filename": "logo.png",
  "contentType": "image/png",
  "sizeBytes": 51234,
  "visibility": "PUBLIC",
  "createdAt": "2026-07-24T13:06:40.607105Z"
}
```

Errors (RFC 9457 problem details, `detail` localized by `Accept-Language` like every other
endpoint):

| Status | When | en `detail` |
|---|---|---|
| `400` | type not in the whitelist | Only PNG, JPEG and WebP images are allowed |
| `400` | bytes don't match the declared type | File content does not match its declared type |
| `400` | empty file | The uploaded file is empty |
| `413` | over 2 MB | The file exceeds the maximum allowed size of 2 MB |

## 2. Display a file — public, no auth

```
GET /api/public/media/{id}
```

Serves the bytes to **anyone** — use it directly as `<img src>` (prefix your API base URL; the
`url` field is app-relative). Response carries the real `Content-Type` and
`Cache-Control: max-age=86400, public`, so browsers cache hard — safe because the bytes under an
id never change (re-uploading creates a *new* id). Unknown ids → `404`.

## 3. My files

```
GET /api/media?page=0&size=20&sort=CREATED_AT&direction=DESC
Authorization: Bearer <merchant token>
```

The caller's company's files, in the standard paged envelope (`content` + `page`, `size`,
`totalElements`, `totalPages`). `sort` ∈ `CREATED_AT | FILENAME | SIZE_BYTES`, `size` max 100.
Items are the upload response shape.

## 4. Delete a file

```
DELETE /api/media/{id}
Authorization: Bearer <merchant token>
```

`204`. The bytes are gone and the public URL 404s afterwards. Another company's id → `404`
(indistinguishable from missing). If the file was the company logo, the logo is cleared
automatically.

---

## 5. Company logo

The flow is two steps: upload the image (§1), then point the logo at it by **id**.

```
PUT /api/company/logo
Authorization: Bearer <merchant token>     (OWNER only — agents get 403)
Content-Type: application/json

{ "mediaId": "33e7f8ce-ca7f-4244-9c7f-e641ff203c78" }
```

`200` → the full company response (same shape as `GET /api/company`), now with `logoUrl` set:

```json
{ "...": "...", "logoUrl": "/api/public/media/33e7f8ce-ca7f-4244-9c7f-e641ff203c78" }
```

- The media file must belong to the caller's company. A foreign or unknown id → `404`
  ("Logo media file not found" / "ملف الشعار غير موجود").
- Missing `mediaId` → `400` with the standard `errors` array.

```
DELETE /api/company/logo        (OWNER only)
```

`204` — clears the logo (`logoUrl` back to `null`). The media file itself **stays** in the
library; delete it separately via §4 if it should be gone.

`logoUrl` (string or `null`) now appears populated in:
- `GET /api/company` and `PUT /api/company` responses (merchant),
- the admin console's companies list and detail.

## 6. User profile image (avatar)

Identical to the logo, one level down — it's the *person's* image, so no OWNER restriction:
any user sets their own.

```
PUT /api/auth/me/avatar
Authorization: Bearer <merchant token>
Content-Type: application/json

{ "mediaId": "76086979-62f8-4846-a062-b0e2227a1c9b" }
```

`200` → the full user response (same shape as `GET /api/auth/me`), now with `avatarUrl` set.
Same errors as the logo: foreign/unknown id → `404` ("Avatar media file not found" /
"ملف الصورة الشخصية غير موجود"), missing `mediaId` → `400`.

```
DELETE /api/auth/me/avatar
```

`204` — clears the avatar; the media file stays in the library.

`avatarUrl` (string or `null`) is a **new field** in every user response: `GET /api/auth/me`,
`PUT /api/auth/me`, the register response, and the admin console's users directory. Deleting
the underlying media file clears any avatar pointing at it automatically, same as the logo.

## Suggested logo UI flow

1. User picks an image → `POST /api/media` → keep the returned `id`, preview via `url`.
2. Save → `PUT /api/company/logo {mediaId}` → render from the returned `logoUrl`.
3. "Remove logo" → `DELETE /api/company/logo`.
4. Client-side pre-checks worth mirroring (the server enforces them anyway): file type
   png/jpeg/webp, size ≤ 2 MB.
