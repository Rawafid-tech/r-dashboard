# 2026-08-10 — addresses: where a merchant ships from

**Status: not on staging yet.** This is [PR #20](https://github.com/Rawafid-tech/rawafid-be/pull/20), open against `main`. It reaches `https://rawafid.softizone.net` the moment that merges — nothing here is live before then, so build against it but do not expect staging to answer yet. I will confirm in this file's place in the next drop.

Everything below is additive. No existing field changed shape or meaning.

Two things arrive together, because one is useless without the other: a **shared geography** (Egypt's 27 governorates and 1,807 districts, public and unauthenticated) and the **sender locations** screen (`مواقع المرسل`) that spends it — the pickup addresses a merchant ships from.

Every payload in this document was copied from a running instance. None of it is hand-written.

---

## 1. The one thing to understand before you build the form

**A governorate is a constraint. A district is a suggestion.**

|                               | governorate                   | district (`area`)           |
| ----------------------------- | ----------------------------- | --------------------------- |
| what you send                 | `governorateId` (uuid)        | `area` (string)             |
| required                      | yes                           | yes                         |
| validated against the catalog | **yes** — a wrong id is `400` | **no** — anything saves     |
| stored as                     | the id                        | the text, and only the text |

So: the governorate is a **`<select>`**, populated from §2 and never free-typed. The district is a **free-text input with autocomplete** — you offer suggestions from §2.3, but a merchant whose village is not in our list types it anyway and the save succeeds.

That asymmetry is deliberate, and it matters to you because it decides your widget. Our district data is distilled from 17 carriers' zone catalogs and is knowingly incomplete — Dakahlia has 205 districts listed, Gharbia only 31. If we validated the district, we would reject addresses the merchant can see with their own eyes are correct. So we do not.

There is **no `areaId`** anywhere in the request or the response. Do not send one, do not look for one. If you have already built an autocomplete that tracks the selected suggestion's id, drop the id and keep the text.

---

## 2. Geography — `GET /api/public/geo/**`

**No authentication.** These are under `/api/public/**`, so send no `Authorization` header (one is harmless, just pointless). Responses carry `Cache-Control: max-age=3600, public`.

Every row carries **both** names, always, so you can switch the UI language without re-fetching, and show Arabic while sending the id.

### 2.1 `GET /api/public/geo/countries`

```json
[
  { "id": "050c6992-6e15-570f-9ee6-6ef054c73a5f", "code": "EG", "nameEn": "Egypt", "nameAr": "مصر" }
]
```

One row today. It is a real endpoint rather than a hardcoded `"EG"` because the country picker will grow, but a one-option `<select>` is not worth showing a user — read `code` and send `"EG"`.

### 2.2 `GET /api/public/geo/governorates`

27 rows, ordered for a dropdown (most-used first, not alphabetical — do not re-sort). Optional `?countryCode=EG` filter; an unknown code is a `404`.

```json
[
  { "id": "de98a17e-dc31-5a16-9d9c-6401a3c6a273", "code": "EG-C",   "countryCode": "EG", "nameEn": "Cairo",      "nameAr": "القاهرة" },
  { "id": "01071234-9337-5780-82bf-206165ccadfc", "code": "EG-GZ",  "countryCode": "EG", "nameEn": "Giza",       "nameAr": "الجيزة" },
  { "id": "6d13f16d-f7a7-5f1e-9aa7-ca1afc43cc2c", "code": "EG-ALX", "countryCode": "EG", "nameEn": "Alexandria", "nameAr": "الإسكندرية" }
]
```

`code` is ISO 3166-2. **The ids are stable** — they are derived from that code, so they survive a reseed and are safe to cache for a long time or even to hardcode in a fixture.

### 2.3 `GET /api/public/geo/governorates/{governorateId}/areas`

Note the shape: **nested under the governorate**, not `?governorateId=`. There is no way to ask for districts without naming a governorate, because district names repeat across the country.

164 rows for Cairo. Optional `?search=` for the type-ahead. An unknown governorate is a `404`.

```json
[
  { "id": "a87d6a0b-deae-5f20-9f1c-a7f44c3231ec", "nameAr": "مدينة نصر", "nameEn": null },
  { "id": "a83a102d-4da8-5b67-bb00-1f23dbcb1d96", "nameAr": "الأميرية",  "nameEn": null },
  { "id": "e58fcabf-10f7-5657-8f42-7e60c6b81054", "nameAr": "المطرية",   "nameEn": null }
]
```

**`nameEn` is usually `null`** — only 91 of 1,807 districts have a settled English form, and we would rather send nothing than an invented transliteration. Render `nameAr || nameEn`, never the reverse.

`id` is there for future use (rates, carrier zone mapping). **You never send it back.** When the user picks a suggestion, put its `nameAr` in the `area` field.

The unfiltered call returns the whole list for that governorate — there is no paging, on purpose, so you can fetch once and filter client-side if you prefer. `?search=` exists so you do not have to.

#### The search is more forgiving than a substring match

It normalises Arabic before matching: tashkeel, hamza forms (`أإآ`→`ا`), taa marbuta (`ة`→`ه`), `ى`→`ي`, Arabic-Indic digits (`٦`→`6`), and administrative words (`مدينة`, `حي`, `قسم`, `مركز`) all fold away, and known alternate spellings are searched too. Practical consequences:

- `الحى العاشر` and `الحي العاشر` and `حي العاشر` all find the same row.
- An **exact match ranks first**, even against a better-attested near-match: `?search=الحي العاشر` → `["الحي العاشر", "مدينة نصر", "العاشر من رمضان"]`. (`الحي العاشر` is a known alias of `مدينة نصر`, which 13 carriers name against this district's 2 — so without exact-match-first the user's own words came second.)
- English works where we have it: `?search=nasr` → `مدينة نصر`.

So **do not do your own client-side filtering of the search results**, and do not lowercase or strip the term before sending. Send what the user typed.

A search that normalises away to nothing (`?search=حي`, `?search=%`) returns `[]`, not the full list.

---

## 3. Sender locations — `/api/sender-locations`

Tenant plane: `Authorization: Bearer <accessToken>`. The company is never in the path — it comes from the token — so a merchant can only ever see and touch their own.

| method | path                                    | permission              |
| ------ | --------------------------------------- | ----------------------- |
| `GET`  | `/api/sender-locations`                 | `senderLocation:read`   |
| `GET`  | `/api/sender-locations/{id}`            | `senderLocation:read`   |
| `POST` | `/api/sender-locations`                 | `senderLocation:manage` |
| `PUT`  | `/api/sender-locations/{id}`            | `senderLocation:manage` |
| `POST` | `/api/sender-locations/{id}/activate`   | `senderLocation:manage` |
| `POST` | `/api/sender-locations/{id}/deactivate` | `senderLocation:manage` |
| `POST` | `/api/sender-locations/{id}/default`    | `senderLocation:manage` |

**There is no `DELETE`.** Shipments will record where they were collected from, so an address that has ever been used has to stay readable. Retiring one is `/deactivate`. Do not build a delete button — and if your list already has a row menu, it is: edit · set as default · activate · deactivate.

### 3.1 The request body

Identical for `POST` and `PUT` — `PUT` replaces every editable field, so send the whole object.

```json
{
  "name": "FE guide sample",
  "contactName": "Mona Adel",
  "contactPhone": "+201234567890",
  "contactEmail": "warehouse@store.com",
  "countryCode": "EG",
  "governorateId": "de98a17e-dc31-5a16-9d9c-6401a3c6a273",
  "area": "مدينة نصر",
  "addressLine": "12 شارع مصطفى النحاس، مدينة نصر، القاهرة",
  "street": "شارع مصطفى النحاس",
  "buildingNumber": "12",
  "postalCode": "11765",
  "latitude": 30.0563,
  "longitude": 31.3301
}
```

| field            | required | notes                                                                                    |
| ---------------- | -------- | ---------------------------------------------------------------------------------------- |
| `name`           | yes      | ≤100. Unique per company, **case-insensitively** — `"Main"` and `"main"` collide (`409`) |
| `contactName`    | yes      | ≤150. Who the driver asks for. Prefill from the profile, then let them edit              |
| `contactPhone`   | yes      | must match `^\+?[0-9]{8,15}$`                                                            |
| `contactEmail`   | yes      | a valid address, ≤255                                                                    |
| `countryCode`    | yes      | exactly 2 letters, and a country we serve → `"EG"`                                       |
| `governorateId`  | yes      | from §2.2, and must belong to `countryCode`                                              |
| `area`           | yes      | ≤150, free text (see §1)                                                                 |
| `addressLine`    | yes      | ≤500. **The important one** — see below                                                  |
| `street`         | no       | ≤200                                                                                     |
| `buildingNumber` | no       | ≤50                                                                                      |
| `postalCode`     | no       | ≤20                                                                                      |
| `latitude`       | no       | `-90` to `90`, at most 6 decimals                                                        |
| `longitude`      | no       | `-180` to `180`, at most 6 decimals                                                      |

`latitude` and `longitude` are **both or neither** — sending one alone is a `400`. See §5.

**On `addressLine` vs the structured parts.** Yes, it looks redundant next to `street` and `buildingNumber`. It is not: every structured part is optional, so `addressLine` is the one field we can always hand to a carrier whose API wants a single string. Label it as the address as the merchant would write it out for a driver, and make it a textarea rather than a narrow input. The structured fields are for the carriers that want them broken up.

Empty optional strings are treated as absent — `"street": ""` comes back `null`.

### 3.2 The response

Same record from every endpoint, including the `POST`s that only flip a flag.

```json
{
  "id": "401bd565-4959-4e94-9372-08a2862f9af6",
  "name": "FE guide sample",
  "contactName": "Mona Adel",
  "contactPhone": "+201234567890",
  "contactEmail": "warehouse@store.com",
  "countryCode": "EG",
  "governorateId": "de98a17e-dc31-5a16-9d9c-6401a3c6a273",
  "governorateNameEn": "Cairo",
  "governorateNameAr": "القاهرة",
  "area": "مدينة نصر",
  "addressLine": "12 شارع مصطفى النحاس، مدينة نصر، القاهرة",
  "street": "شارع مصطفى النحاس",
  "buildingNumber": "12",
  "postalCode": "11765",
  "latitude": 30.0563,
  "longitude": 31.3301,
  "isDefault": false,
  "status": "ACTIVE",
  "createdAt": "2026-08-10T19:52:28.061333Z",
  "updatedAt": "2026-08-10T19:52:28.061333Z"
}
```

`governorateNameEn` / `governorateNameAr` are resolved for you, so **the list needs no second call** to render its `المدينة` column. They are `null` only if that governorate is ever retired; the address keeps working, it just shows no name.

`status` is `ACTIVE` or `INACTIVE`. There is no deleted state.

### 3.3 The list

```
GET /api/sender-locations?search=&governorateId=&status=&page=0&size=20&sort=CREATED_AT&direction=DESC
```

Standard envelope:

```json
{ "content": [ "…" ], "page": 0, "size": 2, "totalElements": 4, "totalPages": 2 }
```

- `search` — one term across **name, contact name, contact phone, district and address line**. Plain substring, case-insensitive (unlike the district search in §2.3, which is Arabic-aware).
- `governorateId`, `status` — exact filters. All three combine with AND.
- `sort` — `CREATED_AT` or `NAME` only. Anything else is a `400`. `direction` — `ASC` or `DESC`.
- `size` is clamped to **100**; asking for 9999 silently gives you 100, so read `size` back.

### 3.4 The default address, and the two rules that will surprise you

Neither of these is in the reference product, and both will bite your UI if you do not handle them.

1. **A company's first address becomes its default automatically.** The `POST` response comes back `"isDefault": true` without you asking. Do not show a "make this the default" affordance during the first-address flow — it is already done.
2. **The default cannot be deactivated.** `409`. The merchant has to make another address the default first. So: **disable the deactivate action on the row where `isDefault` is `true`**, with a tooltip explaining why, rather than letting them click it and eating an error.

Together these mean a company with any addresses always has one usable pickup point — it cannot deactivate its way to none and discover it when a shipment fails to book.

Also: `/default` on an **inactive** address is a `409` — activate it first. And `/default` on the address that already holds it is a **no-op `200`**, not an error, so a double-click is harmless.

Setting a new default clears the old one server-side. Refresh the list (or patch both rows) after the call; the response only describes the address you promoted.

---

## 4. Navigation and permissions

One new page node with two actions. `GET /api/permissions` (the role modal's tree):

```json
[
  {
    "id": "3eeef0d6-b77b-4f48-a283-890ac0d84f87",
    "code": "page:senderLocations",
    "kind": "PAGE",
    "label": "Sender locations",
    "children": [
      { "id": "5a3fd501-…", "code": "senderLocation:read",   "kind": "ACTION", "label": "View sender locations",   "children": [] },
      { "id": "794a3c85-…", "code": "senderLocation:manage", "kind": "ACTION", "label": "Manage sender locations", "children": [] }
    ]
  }
]
```

`label` is localized by `Accept-Language` — `مواقع المرسل`, `عرض مواقع المرسل`, `إدارة مواقع المرسل`.

As of the 2026-08-07 drop you render nav from the `permissions` array on `GET /api/auth/me`, and that still holds — nothing new to special-case. An owner now sees:

```json
["page:roles", "page:senderLocations", "page:subscription", "page:users", "role:read",
 "senderLocation:manage", "senderLocation:read", "subscription:read",
 "user:invite:reveal", "user:manage", "user:password:set", "user:read"]
```

So:

- show the nav entry when `permissions` contains `page:senderLocations`
- show the list when it contains `senderLocation:read`
- show add / edit / activate / deactivate / set-default when it contains `senderLocation:manage`

Unlike the company profile and role authoring, **this is not owner-only** — an owner can grant it to staff, so do not gate any of it on `role === "OWNER"`.

---

## 5. Errors

All RFC 9457 problem details, `detail` localized by `Accept-Language`.

| status | `detail` (en)                                                                               | when                                                             |
| ------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `409`  | You already have a sender location with this name                                           | duplicate `name`, case-insensitively                             |
| `409`  | The default sender location cannot be deactivated. Make another location the default first. | `/deactivate` on the default                                     |
| `409`  | An inactive sender location cannot be made the default. Activate it first.                  | `/default` on an inactive one                                    |
| `400`  | Choose a governorate from the list for the selected country                                 | unknown `governorateId`, or one belonging to another country     |
| `400`  | We do not ship from this country yet                                                        | `countryCode` we have no data for                                |
| `404`  | Sender location not found                                                                   | unknown id **and** another company's id — deliberately identical |
| `401`  | Authentication is required to access this resource                                          | no or expired token                                              |
| `403`  | You do not have permission to perform this action                                           | token lacks the permission                                       |

```json
{
  "detail": "The default sender location cannot be deactivated. Make another location the default first.",
  "instance": "/api/sender-locations/f1eadfc1-…/deactivate",
  "status": 409,
  "title": "Conflict"
}
```

With `Accept-Language: ar`:

```json
{ "detail": "لا يمكن إلغاء تفعيل موقع المرسل الأساسي. عيّن موقعًا آخر كأساسي أولًا.", "status": 409, "title": "Conflict" }
```

**Field validation** uses the different shape you already handle — a per-field `errors` array:

```json
{
  "detail": "Request validation failed",
  "instance": "/api/sender-locations",
  "status": 400,
  "title": "Validation Failed",
  "errors": [ { "name": "area", "reason": "must not be blank" } ]
}
```

### One `errors` entry you cannot map to an input

The both-or-neither coordinate rule spans two fields, so it reports under a derived name:

```json
{ "errors": [ { "name": "coordinatePairComplete", "reason": "Send both latitude and longitude, or neither" } ] }
```

`coordinatePairComplete` is **not a field you sent**. Do not try to attach it to an input — show it on the map/coordinates group, or as a form-level message. Everything else in `errors` maps to a real field name (`area`, `contactPhone`, `latitude`, …). Tell me if a form-level bucket is awkward and I will look at splitting it.

An out-of-range coordinate does map to a real field:

```json
{ "errors": [ { "name": "latitude", "reason": "must be less than or equal to 90" } ] }
```

---

## 6. What is *not* here, and why

So you do not go looking:

- **No `DELETE`.** Deactivate instead (§3).
- **No `areaId`.** The district is text only (§1).
- **No city code.** The reference product has a `رمز المدينة` field; a merchant hand-typing a carrier's city code is a mapping table in disguise, and that belongs to the carrier integration keyed off `governorateId`. If a carrier turns out to need one, it will not be a field on this form.
- **No Saudi National Address fields** — no short address code (`RRRD2929`), no secondary number. Egypt-only product.
- **No plan limit** on how many addresses a company may have. If that changes it will be a `409` with its own message, not a silent cap.
- **No bulk actions and no CSV export** on the list yet. Say the word if the screen needs them.

---

## Questions for you

1. Does a **form-level** slot for the coordinate error work, or do you need it split onto `latitude`?
2. The district autocomplete: do you want the unfiltered list once per governorate (164 rows for Cairo, roughly 1KB gzipped) and filter locally, or a request per keystroke against `?search=`? Both work; the first is fewer round trips and the second gets the Arabic-aware ranking. I would fetch once and call `?search=` only when the local filter finds nothing.
3. Anything on the list screen you need that is not in §3.3 — a sort column, a filter, a count?
