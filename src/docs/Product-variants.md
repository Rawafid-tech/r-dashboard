# Product variants — FE contract

**Status: live on staging. Build against it.**

Second drop today. The first (`2026-08-28.md`) is bulk import; this is variants, and the two do not
overlap — import does not create variants. Products and categories themselves are `2026-08-16.md`,
which this supersedes in one place only (see §10).

Every payload below was captured from a running instance, not written by hand.

---

## 1. The model, in one paragraph

A **variant is a label on a product.** "أحمر / وسط", "Red / M" — one string, plus a price when that
particular choice costs something different.

The **product** is still the thing that ships. It keeps the SKU, the weight, the dimensions, the HS
code and the handling class, and a shipping rate is quoted from those. A variant has none of them.

So: one product row, N labels under it. Not a parent product with child products.

## 2. What a variant deliberately does **not** have

You will want these. Here is why they are absent, so you can design around it rather than wait:

| | why not |
| --- | --- |
| **SKU** | `products.sku` is unique per company, enforced by a database index. A second table with its own SKU column cannot share that index — Postgres cannot enforce uniqueness across two tables — so a variant SKU could silently collide with a product SKU, and the SKU is what an order integration will match an incoming order line by. A collision there picks the wrong parcel. The product's SKU stays the one unambiguous key. |
| **weight, dimensions** | A rate is quoted on the product. Size S and size XL of one shirt are the same parcel as far as the backend is concerned. This is an accepted simplification, not an oversight — where it stops being true (50 ml vs 100 ml perfume), adding nullable weight/dimensions to a variant meaning "the product's" is a small additive change. Ask when you hit it. |
| **barcode** | Not yet. Same shape of change when it is wanted. |
| **stock / quantity** | `inventory`, a different module. There is no quantity anywhere in `product`. |
| **structured axes** | There is no `{colour: "أحمر", size: "وسط"}`. The label is **one string that you compose.** The backend never reasons about the axes, so it does not store them — see §9 for what that means for your matrix screen. |

## 3. Creating a product with variants

Variants go on the product's own `POST`, in the same request. They are created in one transaction with
the product, so you never end up with a product that is missing the labels the merchant just typed.

```
POST /api/products          product:manage
```

```json
{
  "name": "قميص قطن",
  "sku": "DOC-SHIRT-001",
  "price": 150,
  "weightKg": 0.25,
  "handling": "GENERAL",
  "variants": [
    { "name": "أحمر / صغير", "price": 140 },
    { "name": "أحمر / وسط" },
    { "name": "أزرق / كبير", "price": 170 }
  ]
}
```

Two things about the array:

- **Order is the array's order.** There is no `sortOrder` to send — position *is* the order, and the
  response numbers it back to you. This is deliberate: S/M/L sorts to L/M/S alphabetically, so the
  only thing carrying the merchant's intent is the sequence you send.
- **Omit `price` for a variant that costs the same as the product.** Do not copy the product's price
  into every entry — a copy goes stale the moment the product is repriced. `null` means "ask the
  product".

`201` response — note `variants[1].price` is `null`, and the `sortOrder` values:

```json
{
  "id": "c7d42421-2a4f-40a4-8983-cf5e6c1ca1ec",
  "name": "قميص قطن",
  "sku": "DOC-SHIRT-001",
  "price": 150.00,
  "weightKg": 0.250,
  "handling": "GENERAL",
  "categoryId": null,
  "categoryName": null,
  "variants": [
    { "id": "336d4b9c-609e-4440-a49a-048b407f6801", "name": "أحمر / صغير", "price": 140.00, "sortOrder": 0 },
    { "id": "67784a85-cf96-4cb9-b53c-648f97b1fce7", "name": "أحمر / وسط",  "price": null,   "sortOrder": 1 },
    { "id": "9cbb5470-6557-45bf-ae9a-6f61ed6b8dfe", "name": "أزرق / كبير", "price": 170.00, "sortOrder": 2 }
  ],
  "createdAt": "2026-08-28T19:12:04.922272Z",
  "updatedAt": "2026-08-28T19:12:04.922272Z"
}
```

`variants` is omitted or `[]` for a product with no variants — most products. It is never `null` in a
response.

## 4. Changing the set afterwards

```
PUT /api/products/{productId}/variants          product:manage
```

**You send the whole list. Whatever the product has now is replaced by what you send.** There is no
add-one, no edit-one, no delete-one. To remove a variant, send the list without it. To remove them
all, send `[]`.

```json
{ "variants": [ { "name": "أحمر / وسط", "price": 145 },
                { "name": "أزرق / كبير", "price": 175 } ] }
```

`200` — the response is the new list, nothing else:

```json
[
  { "id": "53e8e900-1342-4f8b-86e5-ba93fc6561a6", "name": "أحمر / وسط",  "price": 145.00, "sortOrder": 0 },
  { "id": "6fdd52fe-4aef-44cd-96cc-e0b6b0dafbaf", "name": "أزرق / كبير", "price": 175.00, "sortOrder": 1 }
]
```

### ⚠ Variant ids are not stable across a save

Look carefully at the two payloads above. "أحمر / وسط" was `67784a85…` after the create and is
`53e8e900…` after the replace. **Same label, different id.** The replace deletes the old rows and
inserts the new ones.

What this means for you:

- **Do not send ids back.** `VariantRequest` has no `id` field; one would be ignored.
- **Do not persist a variant id** anywhere — not in a URL, not in local storage, not in another
  record. Nothing on the backend holds one either; when shipments arrive, a shipment line will copy
  the *label text*, not point at a variant.
- Using the id as a React `key` within one render is fine. Using it to match rows across two fetches
  is not — match on `name`.

Why it works this way rather than reconciling by id: it is the only version that handles two ordinary
edits. Renaming "Small" to "Large" *and* "Large" to "Small" in one save, and dropping "Small" while
adding a new "Small" in the same save. Both hit the unique-label index if the rows are updated in
place. Wholesale replace has neither problem, and since nothing holds a variant id, nothing pays for
it.

## 5. `PUT /api/products/{id}` does **not** take variants

This is the one thing most likely to bite you, so it is a hard `400` rather than a silent no-op:

```json
{ "detail": "To change variants, send them to the product's own variants endpoint",
  "instance": "/api/products/c7d42421-2a4f-40a4-8983-cf5e6c1ca1ec",
  "status": 400, "title": "Bad Request" }
```

If your edit screen does GET → mutate the object → PUT the whole thing back, **strip `variants`
before the PUT** and send it to `/variants` as a second call. Omitting the field is the ordinary edit
and leaves the variants untouched.

The field exists on the create body and not the update body, and rather than accept-and-ignore it,
the API tells you. Two calls to save one screen is the tradeoff; the alternative was a PUT where
omitting the array might mean "leave them" or might mean "delete them all".

## 6. Reading them

You never need a separate call. **Both product reads carry the full variant array:**

- `GET /api/products/{productId}` — as in §3
- `GET /api/products` — every row of every page, same shape

```json
{ "content": [ { "id": "c7d42421-…", "sku": "DOC-SHIRT-001", "price": 150.00,
                 "variants": [ { "id": "53e8e900-…", "name": "أحمر / وسط",  "price": 145.00, "sortOrder": 0 },
                               { "id": "6fdd52fe-…", "name": "أزرق / كبير", "price": 175.00, "sortOrder": 1 } ] } ],
  "page": 0, "size": 1, "totalElements": 1, "totalPages": 1 }
```

There is **no `variantCount` field** — use `variants.length`. An array that sometimes meant "none" and
sometimes meant "not loaded on this endpoint" would be something you could not tell apart, so the list
just carries everything. Expanding a product row needs no request at all.

**`search` now matches variant labels too**, alongside name, SKU and barcode. Typing `أحمر` returns the
shirt. A product with three matching labels is still one row and `totalElements` counts it once.

## 7. Errors

| what | status | `detail` (en) | `detail` (ar) |
| --- | --- | --- | --- |
| two entries share a label | **409** | This product already has a variant with this name | هذا المنتج يحتوي بالفعل على متغير بنفس الاسم |
| more than 100 entries | **400** | field error on `variants` | ↓ |
| `variants` sent to the product PUT | **400** | To change variants, send them to the product's own variants endpoint | لتغيير المتغيرات، أرسلها إلى مسار متغيرات المنتج الخاص بها |
| unknown or another company's product | **404** | Product not found | المنتج غير موجود |

Label uniqueness is **per product and case-insensitive**. `"Small"` and `"small"` under one product is
a 409. The same label under two *different* products is fine and expected — "أحمر / وسط" can exist
under every shirt you sell.

Field errors use the `errors` array you already handle, with the array index in the name so you can
mark the right row:

```json
{ "detail": "Request validation failed", "status": 400, "title": "Validation Failed",
  "errors": [ { "name": "variants[0].name",  "reason": "must not be blank" },
              { "name": "variants[0].price", "reason": "must be greater than or equal to 0" } ] }
```

The over-the-cap error is addressed to `variants` itself, not an index:

```json
{ "errors": [ { "name": "variants",
                "reason": "You have reached the maximum number of variants for one product" } ] }
```

## 8. Limits

| | |
| --- | --- |
| variants per product | **100** |
| label length | **100** characters, not blank |
| variant price | `0` – `9999999999.99`, two decimals, or `null` for "same as the product" |
| permission | `product:manage` to write, `product:read` to read — **no new permission node**, it is the same tab |

Prices come back with two decimals always (`145.00`, not `145`), like every other money field.

## 9. The screen

A shape that fits this contract, since the model does not store axes:

**Add product** — the product fields, then a "this product has variants" toggle. When on:

1. **You** hold the axes in component state: `Colour = [أحمر, أزرق]`, `Size = [صغير, وسط, كبير]`.
2. You compute the cross product and render a table of 6 rows, one per combination.
3. Each row gets an editable **price** (blank = same as the product). That is the only per-row field.
4. On save, you flatten each row's axes into the one `name` string — `"أحمر / وسط"` — and post the
   array in the order the table shows.

Pick a separator and keep it. `" / "` is what these examples use.

**Edit product** — two calls, and this is where the axes not being stored shows: you get back
`["أحمر / صغير", "أحمر / وسط", …]` and cannot reliably split them back into axes (a label could itself
contain your separator). So the edit screen should present the **flat list** — add a row, remove a
row, rename, reprice, reorder — rather than trying to rebuild the grid. The generator is a
create-time convenience.

If rebuilding the grid on edit turns out to matter, say so — storing the axes is a real change we can
make, and now is when it is cheap.

**Products list** — each row already has its variants. Show a count or a chevron and expand inline;
no fetch.

## 10. What this supersedes

`2026-08-16.md` §13 "Not built" says:

> **Variants.** … Do not build a parent/child UI.

**Half of that still stands.** It is still not parent/child — the product is still the shippable unit
and a variant is still not a second product. What has changed is that the labels now exist and you
should build the UI in §9.

That drop's body is left as it was written; this file is the current word on variants.

## 11. Still not built

- **Variants in bulk import.** The import creates products only. Adding variants needs a rule for
  which product a spreadsheet row is a variant of, which is the same unsettled question as
  upsert-by-SKU (`2026-08-28.md` §9). A merchant importing 400 products adds variants by hand for now.
- **Exact-match barcode lookup** — still the one open item on products generally, for scan-to-find at
  packing.
- Per-variant weight, dimensions, barcode, image, stock.
- Bulk edit across variants ("reprice every وسط").
