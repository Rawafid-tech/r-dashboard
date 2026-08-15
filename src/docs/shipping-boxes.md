# 2026-08-14 — shipping boxes: the presets a merchant ships in

**Status: live on staging.** Merged via [PR #21](https://github.com/Rawafid-tech/rawafid-be/pull/21) and answering on `https://rawafid.softizone.net` now — smoke-verified end to end against staging itself, including that the first box self-promotes, that the default moves and can be cleared, that deleting the default is allowed, and that another company's box id is the same `404` as an unknown one. Register any merchant account and the screen works.

Everything below is additive. No existing field changed shape or meaning.

The screen is `صناديق الشحن` — the reusable package presets a merchant defines once so three dimensions are not retyped on every shipment. It is the sibling of the sender locations screen from [2026-08-10](./2026-08-10.md), and deliberately smaller: a name, three dimensions in centimetres, and one of them flagged the default.

Every payload in this document was copied from a running instance. None of it is hand-written.

---

## 1. Three things that will surprise you

Read these before you build the dialog. Each one has cost someone an afternoon already.

**a. The first box a company creates is the default, whatever your toggle says.** Send `"isDefault": false` on an empty list and you get `"isDefault": true` back. That is the rule, not a bug — a merchant who never touches the toggle still ends up with something the shipment form can pre-fill. It applies only to the very first box; every later one takes the flag exactly as you send it.

**b. A company can have *no* default box, and that is a valid state.** Unlike a default pickup address, which always exists, this flag can be switched off and the default box can be deleted. So the list's default column may legitimately show "no" on every row, and your shipment form must cope with there being nothing to pre-fill. (The reason for the asymmetry: a shipment can always be measured by hand, but it can never be collected from an address that does not exist.)

**c. `isDefault` is required on every single save, create and edit alike.** There is no "leave it as it was". Omitting it is a `400` naming the field — not a silent default — because a `PUT` replaces the whole resource and a forgotten toggle would otherwise demote the box. Always send the switch's real state.

---

## 2. The shape

One request body serves create and edit:

```json
{
  "name": "صندوق كبير",
  "lengthCm": 150,
  "widthCm": 150,
  "heightCm": 100,
  "isDefault": false
}
```

| field | type | required | rules |
| --- | --- | --- | --- |
| `name` | string | yes | 1–100 chars. Unique within your company, **case-insensitively**. Trimmed before it is checked, so `"Large "` collides with `"Large"`. |
| `lengthCm` | number | yes | Greater than `0`, at most `999.99`, at most **2 decimal places**. |
| `widthCm` | number | yes | Same. |
| `heightCm` | number | yes | Same. |
| `isDefault` | boolean | **yes** | See §1c. Authoritative on edit; overridden to `true` for a company's first box. |

There is no weight, no volume, and no carrier mapping. Weight belongs to the shipment, because it is a property of what is inside the box rather than of the box.

## 3. `GET /api/shipping-boxes` — the list

Requires `shippingBox:read`. Standard paged envelope.

| param | default | notes |
| --- | --- | --- |
| `search` | — | Matches the **name** only. Wildcards are escaped, so `%` searches for a literal `%`. |
| `isDefault` | — | `true` or `false`. `true` returns the one default box, or nothing. |
| `page` | `0` | |
| `size` | `20` | Clamped to 100. |
| `sort` | `CREATED_AT` | `CREATED_AT`, `NAME`, `LENGTH_CM`, `WIDTH_CM`, `HEIGHT_CM`. Anything else is a `400`. |
| `direction` | `DESC` | `ASC` or `DESC`. |

```json
{
  "content": [
    {
      "id": "73aeb497-cec6-4282-8a80-c7ba30f629b2",
      "name": "صندوق كبير",
      "lengthCm": 150.00,
      "widthCm": 150.00,
      "heightCm": 100.00,
      "isDefault": true,
      "createdAt": "2026-08-14T19:26:18.299079Z",
      "updatedAt": "2026-08-14T19:26:18.299079Z"
    },
    {
      "id": "5a895b42-b581-4b01-8633-2fd9adf4e392",
      "name": "صندوق هدايا",
      "lengthCm": 35.50,
      "widthCm": 25.00,
      "heightCm": 1.25,
      "isDefault": false,
      "createdAt": "2026-08-14T19:26:18.333742Z",
      "updatedAt": "2026-08-14T19:26:18.333742Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 2,
  "totalPages": 1
}
```

**Per-column min/max range filters are not implemented.** If your grid library offers them for the dimension columns, either filter client-side or hide them — there is no `minLengthCm`. A merchant has a handful of presets; ask if that ever stops being true.

## 4. `GET /api/shipping-boxes/{boxId}` — one box

Requires `shippingBox:read`. Another company's id answers exactly like an unknown one: `404`. Never treat a `404` here as "exists but forbidden".

## 5. `POST /api/shipping-boxes` — add

Requires `shippingBox:manage`. `201` with the created box, same shape as a list row.

```json
{
  "id": "73aeb497-cec6-4282-8a80-c7ba30f629b2",
  "name": "صندوق كبير",
  "lengthCm": 150.00,
  "widthCm": 150.00,
  "heightCm": 100.00,
  "isDefault": true,
  "createdAt": "2026-08-14T19:26:18.299079Z",
  "updatedAt": "2026-08-14T19:26:18.299079Z"
}
```

That response is from a request that sent `"isDefault": false` on an empty list — §1a in the wild. **Use the response body to update your row, not the values you sent.**

## 6. `PUT /api/shipping-boxes/{boxId}` — edit

Requires `shippingBox:manage`. Whole body, every field. `200` with the updated box.

This one endpoint also moves the default, which is why there is no separate "make default" call:

| you want to | send |
| --- | --- |
| rename or resize | the fields, with `isDefault` as it already is |
| make **this** box the default | `"isDefault": true` — the flag comes off whichever box held it, in the same request |
| leave the company with **no** default | `"isDefault": false` on the box that currently holds it |

After promoting one box, the previously-default box's `isDefault` is now `false` in the database but you were not told so. **Refetch the list, or flip the old row's flag locally** — do not leave two rows showing "default: yes".

## 7. `DELETE /api/shipping-boxes/{boxId}` — remove

Requires `shippingBox:manage`. `204`, empty body. Deleting a second time is a `404`.

**Deleting the default box is allowed** and leaves the company without one. No confirmation is enforced server-side, so if you want an "are you sure, this is your default box" prompt, that is yours to add.

Shipments already created are unaffected: a shipment stores its own copy of the dimensions rather than pointing at the preset, so deleting a box never rewrites shipping history. This is also why editing a box does not retroactively change past shipments.

## 8. Errors

Real bodies, RFC 9457 as everywhere else. `detail` is localized by `Accept-Language`.

```json
{"detail":"You already have a shipping box with this name","instance":"/api/shipping-boxes","status":409,"title":"Conflict"}
```

```json
{"detail":"Request validation failed","instance":"/api/shipping-boxes","status":400,"title":"Validation Failed","errors":[{"reason":"must be greater than 0","name":"lengthCm"}]}
```

| status | when | en `detail` | ar `detail` |
| --- | --- | --- | --- |
| `400` | any field rule in §2 | `Request validation failed` + `errors[]` naming the field | same, with localized `reason` |
| `404` | unknown id, or another company's | `Shipping box not found` | `صندوق الشحن غير موجود` |
| `409` | the name is taken in your company | `You already have a shipping box with this name` | `لديك بالفعل صندوق شحن بهذا الاسم` |
| `409` | two people changed the default at the same instant | `Your default box was changed at the same time — try again` | `تم تغيير الصندوق الافتراضي في نفس الوقت — حاول مرة أخرى` |
| `403` | your role lacks the permission | — | — |

The second `409` is genuinely rare and genuinely retryable — the same request will succeed. It is worth distinguishing from the duplicate-name `409` because "try again" is useless advice for a name collision and correct advice here. Branch on `detail`, or just show `detail` and offer a retry.

## 9. Permissions

Two nodes under one page node, live in `GET /api/permissions` — the same tree that drives the roles screen:

```json
{
  "id": "c149cc8a-4ccb-4251-9687-b5ddfd65c435",
  "code": "page:shippingBoxes",
  "kind": "PAGE",
  "label": "Shipping boxes",
  "children": [
    { "id": "382a7f90-b2d1-465b-8e1b-add8b4ff76ec", "code": "shippingBox:read",   "kind": "ACTION", "label": "View shipping boxes",   "children": [] },
    { "id": "9552451f-bee2-4cd8-96cf-918b9f0ab70c", "code": "shippingBox:manage", "kind": "ACTION", "label": "Manage shipping boxes", "children": [] }
  ]
}
```

The ids above are from a dev database — **do not hardcode them**, they differ per environment. Read them from `/api/permissions`.

`shippingBox:read` gates both `GET`s; `shippingBox:manage` gates create, edit and delete. As everywhere, the **owner passes without holding either**, and `GET /api/auth/me` returns the caller's `permissions` array — drive the nav entry and the "add box" button off that rather than off the role name.

`page:shippingBoxes` sorts **after** roles and before subscription in the catalog, which is where the nav entry belongs.

## 10. Decimals — the one integration detail worth reading twice

Dimensions are JSON **numbers**, and responses always carry exactly **two decimal places**: you send `150`, every response says `150.00`.

- Send integers freely. `150` and `150.00` are the same request.
- **Do not string-compare or string-match these values.** `"150" !== "150.00"`. Parse as a number.
- Round-trip a fetched value unchanged and it stays `150.00` — that is not you accidentally adding precision.
- A third decimal place is a `400`, not a rounding. `12.345` is rejected outright, so if your stepper can produce thirds, clamp before sending.

For display, trimming a trailing `.00` is a UI decision and safe to do — just never send the trimmed *string* back as a string.

## 11. Suggested screen

Matching the reference layout:

**List** — columns name / length / width / height / default, with a yes-no chip in the last one and a row menu carrying Edit and Delete. Sortable on all four data columns; a single search box over the name; optionally a "default only" filter mapped to `isDefault=true`. Remember §1b: no row showing "yes" is a normal state, not an error.

**Add / edit dialog** — name, three number inputs suffixed `سم` with `+`/`−` steppers, and a "set as default box" switch. One `POST`/`PUT` saves the whole thing including the switch. On `409`, keep the dialog open and mark the name field.

**Shipment form, later** — read the default box with `GET /api/shipping-boxes?isDefault=true` and pre-fill from `content[0]` if it exists, or offer the full list in a picker. Copy the dimensions into your shipment payload; do not send a box id, because the shipment does not store one.

## 12. Not built

Deliberately, so you can design around the gaps rather than wait for them:

- **Weight of any kind** — no tare, no maximum load. Weight is per-shipment.
- **Per-dimension range filters** (§3).
- **Box images, per-carrier box codes, and physical stock counts** — a preset is three numbers and a name, nothing more.
- **Any shipment integration.** The picker described in §11 is a suggestion for when shipment creation exists; nothing consumes a box id today.
