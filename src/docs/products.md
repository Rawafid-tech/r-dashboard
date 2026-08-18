# 2026-08-16 — products: the catalog a merchant ships from

**Status: all of it is live on staging, and still HELD.** Products merged via [PR #22](https://github.com/Rawafid-tech/rawafid-be/pull/22) and categories via [PR #23](https://github.com/Rawafid-tech/rawafid-be/pull/23); everything in this document answers on `https://rawafid.softizone.net` now, and every section was smoke-verified against staging itself — including that the category tree nests, that a third level is refused from both directions, that a duplicate top-level name is a `409`, and that deleting a category leaves its products intact and merely uncategorized. Register any merchant account and both tabs work.

**Held** only because the hand-over has not happened: §14 lists what is still coming, and nothing there changes anything below. Treat this as ready to read and safe to build against once someone says go.

Everything below is additive. No existing field changed shape or meaning.

The screen is `المنتجات` — what a merchant ships, so a shipment does not mean retyping a name, a weight and a customs code every time. It is the third of the three pick lists, after sender locations ([2026-08-10](./2026-08-10.md)) and shipping boxes ([2026-08-14](./2026-08-14.md)), and the last one the shipment form needs.

Every payload in this document was copied from staging. None of it is hand-written.

---

## 1. Four things that will surprise you

Read these before you build the form.

**a. This is not your store's product catalog, and it should not try to be.** There is no brand, no tags, no tax, no stock, no images beyond one, and the categories in §12 are a filing system rather than a merchandising tree. Every field exists because *shipping* needs it: weight and dimensions decide the rate, the HS code clears customs, name and price go on the waybill and set the cash-on-delivery amount, SKU and barcode are how an order line is matched to a known item. If a field is not here, that is the reason.

**b. Weight is required. Dimensions are optional — but all three or none.** Sending `lengthCm` and `widthCm` without `heightCm` is a `400`, not a partial save. The asymmetry is deliberate: a rate is quoted on weight, so a product without one cannot pre-fill anything; dimensions only change the outcome for bulky-but-light goods, where volumetric weight wins. So the form must either require all three dimension inputs together or clear all three together.

**c. `handling` is required on every single save, create and edit alike.** There is no "leave it as it was". A `PUT` replaces the whole product, so omitting it would quietly downgrade a `FRAGILE` item to `GENERAL` — instead it is a `400` naming the field. `GENERAL` is the neutral value; send it explicitly.

**d. The SKU collides case-insensitively.** `HP-1000` and `hp-1000` are the same SKU within your company, and the second one is a `409`. Trimmed before it is checked, so `"HP-1000 "` collides too. Another company using your SKU is fine and invisible to you.

---

## 2. The shape

One request body serves create and edit:

```json
{
  "name": "سماعات لاسلكية",
  "sku": "HP-1000",
  "barcode": "6221031492107",
  "hsCode": "8518.30",
  "description": "Wireless over-ear headphones, retail box.",
  "price": 1250,
  "weightKg": 0.42,
  "lengthCm": 22.5,
  "widthCm": 19,
  "heightCm": 9,
  "handling": "FRAGILE",
  "imageMediaId": "9735d199-7697-41ab-8df2-e55c444af58f"
}
```

| field | type | required | rules |
| --- | --- | --- | --- |
| `name` | string | yes | 1–200 chars. What the shipment form's picker shows. Not unique — two products may share a name. |
| `sku` | string | yes | 1–64 chars. Unique within your company, **case-insensitively** (§1d). |
| `barcode` | string | no | ≤ 64 chars. The manufacturer's code (EAN/UPC), for scan-to-find at packing. **Deliberately not unique** — a single unit and a 3-pack share an EAN, and two rows flattened from one store product will too. |
| `hsCode` | string | no | ≤ 20 chars, **digits grouped by single dots**. `8518.30` and `851830` are both accepted; `85.18.AB`, `.30`, `8518.30.` and `85..18` are a `400`. |
| `description` | string | no | ≤ 1000 chars. The customs contents line, not a storefront blurb. |
| `price` | number | yes | `0` or more, ≤ `9999999999.99`, at most **2 decimals**. Zero is legal — a free sample or a warranty replacement still ships. In your company's currency; there is no per-product currency. |
| `weightKg` | number | **yes** | Greater than `0`, ≤ `9999.999`, at most **3 decimals**. Kilograms to the gram, because a phone case is `0.05`. |
| `lengthCm` | number | no | Greater than `0`, ≤ `999.99`, at most 2 decimals. All three or none (§1b). |
| `widthCm` | number | no | Same. |
| `heightCm` | number | no | Same. |
| `handling` | enum | **yes** | `GENERAL`, `FRAGILE`, `LIQUID`, `BATTERY`, `FLAMMABLE`. Anything else is a `400`. See §1c. |
| `imageMediaId` | uuid | no | The `id` from an upload to `/api/media` (§8). Another company's id is a `404`. |
| `categoryId` | uuid | no | One of your categories (§12), top-level or sub. Null files the product nowhere, which is a perfectly normal product. Another company's id is a `404`. |

Optional strings sent as `""` or `"   "` come back as `null`, not as an empty string — so a cleared input and an untouched one are the same thing, and you never have to distinguish them.

**The three dimensions describe the *item*, not the parcel.** The parcel's dimensions come from the shipping box the merchant picks on the shipment. Do not label these "package size" anywhere in the UI — they exist so a box can be *suggested* later, not so they can be used as the box.

## 3. `GET /api/products` — the list

Requires `product:read`. Standard paged envelope.

| param | default | notes |
| --- | --- | --- |
| `search` | — | Matches **name, SKU or barcode** — one box, three columns. Wildcards are escaped, so `%` searches for a literal `%`. Not the description. |
| `handling` | — | Exact match on one of the five values. Combines with `search`. |
| `categoryId` | — | Products in that category. A **top-level** id includes everything filed in its sub-categories, so clicking a parent in your tree never returns an empty list just because the products sit one level down. Combines with everything else. |
| `page` | `0` | |
| `size` | `20` | Clamped to 100. |
| `sort` | `CREATED_AT` | `CREATED_AT`, `NAME`, `SKU`, `PRICE`, `WEIGHT_KG`. Anything else is a `400`. |
| `direction` | `DESC` | `ASC` or `DESC`. |

```json
{
  "content": [
    {
      "id": "93517649-ecfb-4b60-83d0-64ff3f3c614b",
      "name": "كابل شحن USB-C",
      "sku": "CBL-USBC-1M",
      "barcode": null,
      "hsCode": null,
      "description": null,
      "price": 95.00,
      "weightKg": 0.080,
      "lengthCm": null,
      "widthCm": null,
      "heightCm": null,
      "handling": "GENERAL",
      "imageMediaId": null,
      "imageUrl": null,
      "categoryId": null,
      "categoryName": null,
      "createdAt": "2026-08-16T21:17:21.825129Z",
      "updatedAt": "2026-08-16T21:17:21.825129Z"
    },
    {
      "id": "cb327e1e-e16b-4166-8754-9581b9b5e92a",
      "name": "سماعات لاسلكية",
      "sku": "HP-1000",
      "barcode": "6221031492107",
      "hsCode": "8518.30",
      "description": "Wireless over-ear headphones, retail box.",
      "price": 1250.00,
      "weightKg": 0.420,
      "lengthCm": 22.50,
      "widthCm": 19.00,
      "heightCm": 9.00,
      "handling": "FRAGILE",
      "imageMediaId": "9735d199-7697-41ab-8df2-e55c444af58f",
      "imageUrl": "/api/public/media/9735d199-7697-41ab-8df2-e55c444af58f",
      "categoryId": "0ad3e2cb-0725-4262-a844-5f54a6f85c53",
      "categoryName": "إلكترونيات",
      "createdAt": "2026-08-16T21:17:21.560307Z",
      "updatedAt": "2026-08-16T21:17:21.560307Z"
    }
  ],
  "page": 0,
  "size": 2,
  "totalElements": 5,
  "totalPages": 3
}
```

Pagination is stable: rows that tie on the sort column are broken by id, so nothing repeats on one page and vanishes from the next.

**No per-column filters.** No price range, no weight range, no "has barcode". One search box over three columns is what a merchant with a few hundred rows actually uses; say so if that stops being true.

## 4. `GET /api/products/{productId}` — one product

Requires `product:read`. Same body as a list row. Another company's id answers exactly like an unknown one: `404`. Never treat a `404` here as "exists but forbidden".

## 5. `POST /api/products` — add

Requires `product:manage`. `201` with the created product.

```json
{
  "id": "cb327e1e-e16b-4166-8754-9581b9b5e92a",
  "name": "سماعات لاسلكية",
  "sku": "HP-1000",
  "barcode": "6221031492107",
  "hsCode": "8518.30",
  "description": "Wireless over-ear headphones, retail box.",
  "price": 1250.00,
  "weightKg": 0.420,
  "lengthCm": 22.50,
  "widthCm": 19.00,
  "heightCm": 9.00,
  "handling": "FRAGILE",
  "imageMediaId": "9735d199-7697-41ab-8df2-e55c444af58f",
  "imageUrl": "/api/public/media/9735d199-7697-41ab-8df2-e55c444af58f",
  "categoryId": "0ad3e2cb-0725-4262-a844-5f54a6f85c53",
  "categoryName": "إلكترونيات",
  "createdAt": "2026-08-16T21:17:21.560307Z",
  "updatedAt": "2026-08-16T21:17:21.560307Z"
}
```

That request sent `"price": 1250` and `"weightKg": 0.42`; the response says `1250.00` and `0.420`. See §10. `categoryName` is read-only — you send `categoryId`, you get both back, so a list row renders without a second call.

The five-field minimum — name, SKU, price, weight, handling — is a valid product:

```json
{"name":"كابل شحن USB-C","sku":"CBL-USBC-1M","price":95,"weightKg":0.08,"handling":"GENERAL"}
```

## 6. `PUT /api/products/{productId}` — edit

Requires `product:manage`. **Whole body, every field.** `200` with the updated product.

A `PUT` states the product as it should now be, so anything you leave out is either a `400` (for the required fields) or cleared (for the optional ones). To drop a product's dimensions, send the body without them; to change only the price, send everything else unchanged along with it. Populate the form from `GET`, submit the whole form back.

The SKU may be changed, subject to the same `409`.

## 7. `DELETE /api/products/{productId}` — remove

Requires `product:manage`. `204`, empty body. Deleting a second time is a `404`.

**There is no archive and no active/inactive flag** — delete is the only way to retire a product, and it is safe: shipments already created hold their own copy of the name, SKU, price and weight they were sent with, so deleting a product never rewrites shipping history. This is also why editing one does not retroactively change past shipments: repricing on a Tuesday must not restate what a carrier was told and what was collected last month.

## 8. The image

Two steps, the same as a company logo:

1. `POST /api/media` as `multipart/form-data` with a `file` part — PNG, JPEG or WebP, up to 2 MB. `201`:

```json
{
  "id": "9735d199-7697-41ab-8df2-e55c444af58f",
  "url": "/api/public/media/9735d199-7697-41ab-8df2-e55c444af58f",
  "filename": "headphones.png",
  "contentType": "image/png",
  "sizeBytes": 70,
  "visibility": "PUBLIC",
  "createdAt": "2026-08-16T20:20:57.952325111Z"
}
```

2. Send that `id` as `imageMediaId` on the product's `POST` or `PUT`.

The product's response carries **both** `imageMediaId` and `imageUrl`: render the URL, send the id back on the next `PUT`. `/api/public/media/{id}` is unauthenticated, so an `<img src>` works with no token.

To remove an image, `PUT` the product without `imageMediaId`. The file itself stays in your media library.

A media id belonging to another company is a `404` (`Product image file not found`), not a `403` — the same rule as everywhere. Only ever send ids you got back from your own upload.

## 9. Errors

Real bodies, RFC 9457 as everywhere else. `detail` is localized by `Accept-Language`.

```json
{"detail":"You already have a product with this SKU","instance":"/api/products","status":409,"title":"Conflict"}
```

```json
{"detail":"Request validation failed","instance":"/api/products","status":400,"title":"Validation Failed","errors":[{"reason":"An HS code is digits and dots only, for example 8518.30","name":"hsCode"}]}
```

| status | when | en `detail` | ar `detail` |
| --- | --- | --- | --- |
| `400` | any field rule in §2 | `Request validation failed` + `errors[]` naming the field | `فشل التحقق من صحة الطلب`, with localized `reason` |
| `400` | unknown `sort`, or a `handling` outside the five | `Failed to convert 'sort' with value: 'COLOUR'` | same shape | 
| `404` | unknown product id, or another company's | `Product not found` | `المنتج غير موجود` |
| `404` | `imageMediaId` unknown, or another company's | `Product image file not found` | `ملف صورة المنتج غير موجود` |
| `409` | the SKU is taken in your company | `You already have a product with this SKU` | `لديك بالفعل منتج بنفس رمز التخزين` |
| `403` | your role lacks the permission | — | — |

**One `errors[]` entry does not name a field you have an input for.** The all-or-none dimension rule reports as:

```json
{"detail":"Request validation failed","instance":"/api/products","status":400,"title":"Validation Failed","errors":[{"reason":"Send length, width and height together, or none of them","name":"dimensionSetComplete"}]}
```

`dimensionSetComplete` is the rule's name, not a field's. Map it to the dimension group in your form — or just show `reason`, which is written to be shown. In Arabic: `أرسل الطول والعرض والارتفاع معًا، أو لا ترسل أيًا منها`. Tell us if you would rather this arrived named `lengthCm`; it is a one-line change and now is the time to ask.

## 10. Decimals — the one integration detail worth reading twice

Prices and measurements are JSON **numbers**, and responses always carry a fixed number of decimal places:

| field | decimals in every response | you send | you get back |
| --- | --- | --- | --- |
| `price` | 2 | `1250` | `1250.00` |
| `weightKg` | **3** | `0.42` | `0.420` |
| `lengthCm` / `widthCm` / `heightCm` | 2 | `19` | `19.00` |

- Send integers freely. `1250` and `1250.00` are the same request.
- **Do not string-compare these.** `"0.42" !== "0.420"`. Parse as a number.
- **Beware a JSON parser that reads numbers as floats** — it will hand you `0.42` where the wire said `0.420`, and `150.0` where the wire said `150.00`. That is your parser normalizing, not the API being inconsistent. If you need the exact text, read it off the raw response.
- An extra decimal place is a `400`, not a rounding: `weightKg: 0.1234` and `price: 10.999` are both rejected. Clamp before sending if your steppers can produce them.

For display, trimming a trailing `.00` is a UI decision and safe — just never send the trimmed *string* back as a string.

## 11. Permissions

Two nodes under one page node, live in `GET /api/permissions` — the same tree that drives the roles screen:

```json
{
  "id": "f3213bd9-1f39-421f-8acc-0cd2b9e735ca",
  "code": "page:products",
  "kind": "PAGE",
  "label": "Products",
  "children": [
    { "id": "b4e972f1-c50c-429f-a6ff-0916b5b1727e", "code": "product:read",   "kind": "ACTION", "label": "View products"   },
    { "id": "235e88b2-fa8c-481b-a5bf-72ee053dd785", "code": "product:manage", "kind": "ACTION", "label": "Manage products" }
  ]
}
```

In Arabic: `المنتجات`, `عرض المنتجات`, `إدارة المنتجات`. The ids above are from staging — **do not hardcode them**, they differ per environment. Read them from `/api/permissions`.

`product:read` gates both `GET`s; `product:manage` gates create, edit and delete. There is no separate delete permission — deleting a product is not a difference in kind from editing one, since nothing downstream depends on the row surviving. As everywhere, the **owner passes without holding either**, and `GET /api/auth/me` returns the caller's `permissions` array — drive the nav entry and the "add product" button off that, never off the role name.

`page:products` sorts **after roles and before shipping boxes** in the catalog, which is where the nav entry belongs.

## 12. Suggested screen

**List** — image thumbnail / name / SKU / barcode / price / weight, with a handling chip and a row menu carrying Edit and Delete. Sortable on name, SKU, price and weight; one search box over name, SKU and barcode; a handling dropdown as the only filter. Products with no image need a placeholder — `imageUrl` is `null` far more often than not.

**Add / edit form** — one page, not a dialog; there are twelve fields and three of them are long. Group them: identity (name, SKU, barcode, image), shipping (weight, then the three dimensions as one row that fills or clears together), customs (HS code, description), and handling as a select defaulting to `GENERAL`. On `409`, keep the form and mark the SKU field.

**Shipment form, later** — search this list by name/SKU/barcode in a picker, then **copy** the fields you need into the shipment payload. Do not send a product id: the shipment stores its own copy and holds no reference. Nothing consumes a product id today.

## 12. Categories — `/api/product-categories`

The merchant's own filing system, and the second tab on the screen. **Two levels: a category and its
sub-categories, nothing deeper.** A product may sit in one or in none.

Understand what it is not, because it decides how you label things: a category is where the merchant
*put* something. Nothing about a rate, a customs declaration or a carrier reads it — `handling` is
still the only field on a product that says anything about the goods. So there is no per-category HS
code, no default handling, no brand and no tags, and adding a product to a category changes nothing
about how it ships.

### The shape

```json
{ "name": "إلكترونيات", "parentId": null }
```

| field | type | required | rules |
| --- | --- | --- | --- |
| `name` | string | yes | 1–100 chars. Unique **among its siblings**, case-insensitively and trimmed: two top-level categories cannot share a name, and neither can two sub-categories under the same parent — but the same name under two *different* parents is fine. |
| `parentId` | uuid | no | The top-level category this sits under; null makes it top-level. |

### `GET /api/product-categories`

`product:read`. The whole tree, nested, name-ordered, **unpaged** — there is a ceiling on how many
categories a company may create, so this is always one call.

```json
[
  {
    "id": "0ad3e2cb-0725-4262-a844-5f54a6f85c53",
    "name": "إلكترونيات",
    "parentId": null,
    "productCount": 1,
    "children": [
      {
        "id": "3cc56a0c-cd59-4e93-ba0c-c7893e1bca84",
        "name": "سماعات",
        "parentId": "0ad3e2cb-0725-4262-a844-5f54a6f85c53",
        "productCount": 0,
        "children": [],
        "createdAt": "2026-08-16T21:17:21.001289Z",
        "updatedAt": "2026-08-16T21:17:21.001289Z"
      }
    ],
    "createdAt": "2026-08-16T21:17:20.737654Z",
    "updatedAt": "2026-08-16T21:17:20.737654Z"
  }
]
```

`productCount` is the products filed **directly** in that node — a parent's number does not include
its children's. That is the number a delete would actually detach, which is the one worth showing next
to a delete button. If your column wants a rolled-up total, add the children's yourself; you have them
in the same payload.

`children` is always present and always an array. Sub-categories carry an empty one, since the tree
stops there.

### `POST` / `PUT /{categoryId}` / `DELETE /{categoryId}`

All `product:manage` — **there is no separate categories permission.** Whoever can manage products can
manage the filing system, so drive both off `product:manage`.

`POST` answers `201` with the node (no children, count `0`). `PUT` renames and moves in one call, and
like every other `PUT` here it states the whole resource: **omitting `parentId` moves the category back
to the top level**, it does not leave it where it was. `DELETE` answers `204`.

### The four rules that will bite

**a. The tree is two levels, refused from both directions.** Filing something under a sub-category is a
`400`, and so is giving a parent to a category that already has children — the move would push them to
a third level, so it is refused rather than silently reshaping a tree the caller never mentioned. Your
parent picker should therefore offer **top-level categories only**, and should exclude any category
that already has children when editing.

**b. Deleting a category with sub-categories is refused** (`409`). Delete or move the children first.
Nothing here has an undo, so one click never takes a subtree with it.

**c. Deleting a category does *not* delete its products.** They survive with every field intact and
simply stop being in a category — `categoryId` and `categoryName` become `null`. Say that in your
confirmation dialog; "12 products will be uncategorized" is true, "12 products will be deleted" is not.

**d. A category is optional on a product, and stays optional.** A merchant who never opens this tab
must still be able to save a product, so do not make the field required in your form.

### Errors

| status | when | en `detail` | ar `detail` |
| --- | --- | --- | --- |
| `400` | a third level, from either direction | `A category can hold sub-categories one level deep only` | `يمكن للفئة أن تحتوي على فئات فرعية بمستوى واحد فقط` |
| `400` | a category filed under itself | `A category cannot be its own parent` | `لا يمكن أن تكون الفئة فئة رئيسية لنفسها` |
| `404` | unknown category id, or another company's — in a path **or** as `categoryId` on a product | `Category not found` | `الفئة غير موجودة` |
| `404` | unknown `parentId`, or another company's | `Parent category not found` | `الفئة الرئيسية غير موجودة` |
| `409` | the name is taken among its siblings | `You already have a category with this name here` | `لديك بالفعل فئة بهذا الاسم في هذا المستوى` |
| `409` | deleting one that still has children | `Delete or move the sub-categories first` | `احذف الفئات الفرعية أو انقلها أولًا` |
| `409` | the per-company ceiling | `You have reached the maximum number of categories` | `لقد وصلت إلى الحد الأقصى لعدد الفئات` |

Real bodies, same RFC 9457 shape as everywhere:

```json
{"detail":"A category can hold sub-categories one level deep only","instance":"/api/product-categories","status":400,"title":"Bad Request"}
```

```json
{"detail":"You already have a category with this name here","instance":"/api/product-categories","status":409,"title":"Conflict"}
```

### Suggested screen

A second tab beside the products list, as a **tree**, not a grid — two levels render as a parent row
with its children indented under it, each with its product count and a row menu (rename / move /
delete). The add dialog is one text field plus a parent picker limited per rule (a). On the products
list, the category filter is the same tree in a dropdown; selecting a parent shows everything beneath
it.

Do not build the multilingual name columns, the level column or the path column some catalogs have —
there is one name, and the nesting is one level, so the path is always "parent > child" and you can
render it from what you already hold.

## 13. Not built

Deliberately, so you can design around the gaps rather than wait for them:

- **Variants.** A row *is* the shippable unit — a carrier collects a red medium shirt, never an abstract shirt. When store integrations arrive, each store variant becomes its own row with its own SKU, weight and dimensions. Do not build a parent/child UI.
- **Brand, tags, alias barcodes.** Categories exist (§12) but deliberately carry nothing beyond a name and a parent — no per-category HS code or handling default.
- **A third category level**, category images, and bulk category upload.
- **Bulk import** (`رفع منتجات متعددة`) and **store sync** (`مزامنة المنتجات`) — see §14.
- **Stock, reservations, pre-order/backorder** — those are `inventory`, a separate module. There is no quantity here.
- **Tax, per-product currency, and a volume field.** Volume is `L×W×H`; compute it in the UI if you want to show it, since two stored sources for one number will eventually disagree.
- **Per-column filters** (§3) and multi-select/bulk row actions.
- **More than one image**, and any image cropping or ordering.

## 14. What is still coming before this is handed over

This is why the drop is held. Shape unconfirmed — this section is the one that may still change:

- **Bulk import from CSV/XLSX**, which needs its own contract: an upload, per-row validation errors, partial-success reporting, and probably a job id to poll for large files. That is the biggest missing piece for a merchant with an existing catalog.
- **Exact-match barcode lookup**, for scan-to-find at packing. Today `search` does a contains-match over three columns; a scanner wants one endpoint that answers with the one product or nothing.

Anything else on this list is open — if the screen you are designing needs something that is not in §2 or §12, now is when it is cheap.
