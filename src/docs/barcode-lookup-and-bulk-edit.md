# Barcode lookup + bulk edit — FE contract

**Status: live on staging. Build against it.**

Two features, shipped together in one deploy. They are unrelated to each other, so read whichever
part you need:

- **Part 1 — scan-to-find at packing.** One new endpoint. Short.
- **Part 2 — bulk *editing* by re-uploading a spreadsheet.** Two new fields on the import you already
  call, and one new field in its report.

This closes out products: everything the module was missing is now shipped. Earlier drops:
`2026-08-16` (products + categories), `2026-08-28` (bulk import), `2026-08-28-variants` (variants).

**Two things in those drops are now wrong, and both are called out in place below:** `2026-08-28`
§11's promise about the barcode (§1.2 here) and its §6 "Insert-only" (§2.1 here).

Every payload below was captured from staging, not written by hand.

---

# Part 1 — Barcode lookup

## 1.1 The endpoint

```
GET /api/products/by-barcode/{barcode}          product:read
```

```json
[
  {
    "id": "4d6a46f8-3320-4149-9376-2e3ebf741863",
    "name": "قميص قطن",
    "sku": "DOC-SHIRT",
    "barcode": "62210001788538723",
    "price": 150.00,
    "weightKg": 0.250,
    "handling": "GENERAL",
    "variants": [
      { "id": "553ec512-…", "name": "أحمر / وسط",  "price": 170.00, "sortOrder": 0 },
      { "id": "54e3f056-…", "name": "أزرق / كبير", "price": null,   "sortOrder": 1 }
    ],
    "createdAt": "2026-09-04T16:18:45.622813Z",
    "updatedAt": "2026-09-04T16:18:45.622813Z"
  },
  {
    "id": "611f991b-1a6d-49c1-9d2f-fc3039e50c30",
    "name": "قميص قطن - عبوة 3",
    "sku": "DOC-PACK",
    "barcode": "62210001788538723",
    "price": 400.00,
    "weightKg": 0.750,
    "handling": "GENERAL",
    "variants": [],
    "createdAt": "2026-09-04T16:18:45.928297Z",
    "updatedAt": "2026-09-04T16:18:45.928297Z"
  }
]
```

Each element is the **same full `ProductResponse`** you already render on the list, `variants`
included — so a scan needs exactly one request and no follow-up.

## 1.2 ⚠ It returns an array, not one product

`2026-08-28` §11 said this would answer "with the one product or nothing". **That was wrong, and it
is worth understanding why rather than just special-casing it.**

A barcode belongs to the *manufacturer*, not the merchant, and it legitimately repeats across their
rows. A shirt sold singly and the same shirt in a 3-pack carry the same EAN — that is the payload
above, and it is correct data, not a mess to clean up. Two rows flattened from one store product do
the same.

So a one-product answer would have to either fail on valid data or pick one of the two at random,
and **at packing the second is the wrong parcel.** The array is the honest answer.

What to build:

- **Exactly one element** — the overwhelmingly common case. Select it and move on; do not make the
  packer confirm.
- **More than one** — show a picker. Name, SKU and price are the three fields that distinguish a unit
  from a multipack, so lead with those.
- **Empty** — "not in your catalog", and offer to add it. This is **`200` with `[]`, not a `404`**: a
  scanned item the merchant never catalogued is an ordinary outcome, not an error, so you never have
  to parse a problem detail on the hot path.

```
GET /api/products/by-barcode/9990000000000  →  200  []
```

## 1.3 The match is exact and case-sensitive

Unlike the list's `search`, which is a contains-match over name, SKU, barcode and variant labels,
this is `barcode = ?`. Nothing partial, nothing folded.

**Case-sensitivity is deliberate and will not be changed**, so do not send a normalized barcode. The
database index is on the column rather than on `lower(barcode)`; folding case in the query would take
the index out of play and turn a 0.05 ms probe into a scan of every barcode-bearing row the merchant
owns. EAN and UPC are digits, and a scanner reproduces exactly what is printed, so nothing is lost.

Measured on staging's schema at 20k products:

| | plan | time |
| --- | --- | --- |
| this endpoint | index probe on `(company_id, barcode)` | **0.049 ms** |
| the list's `search` | full scan, 20,076 rows discarded | 3.849 ms |

Surrounding whitespace **is** trimmed, so `"  123  "` matches `123` — a fumbled scan or a typed box
is fine. A whitespace-only value answers `[]` without a lookup.

## 1.4 Scoping and gotchas

- **Scoped to your company.** Another merchant's product with the identical EAN is invisible; you
  cannot see it and they cannot see yours.
- A product with **no barcode** is reachable by no lookup at all.
- Order is stable: oldest first, so a picker's options do not reshuffle between two scans of the same
  item.
- Permission is **`product:read`** — no new node, it is the same products tab.
- Do not put a `/` in the path. No EAN or UPC contains one; if you ever need to look up a code that
  does, ask and we will add a query-parameter form.

---

# Part 2 — Bulk edit by re-import

## 2.1 What changed, and what did not

`2026-08-28` §6 said: *"A SKU the company already has is a rejected row, never an update… If a
merchant asks how to bulk-update prices, the answer today is that they cannot."* **That is now
answerable.**

**Nothing you have already built changes.** The new `mode` field defaults to `INSERT_ONLY`, which is
exactly the old behaviour, and `created` is still `0` on a dry run. If you ignore this whole section,
your import screen keeps working identically.

```
POST /api/products/import          product:manage        (unchanged endpoint, unchanged permission)
```

Two new request fields and one new response field:

| field | |
| --- | --- |
| `mode` | `"INSERT_ONLY"` (default, omit it) or `"UPSERT"` |
| `columns` | **required for `UPSERT`, must not be sent otherwise** — the column keys your file had |
| `updatedSkus` | response: which of the merchant's products were (or would be) rewritten |

## 2.2 The rule: declared is authoritative, undeclared is untouched

This is the whole design, and it is the bit to get right.

> **A column you list in `columns` is authoritative — a blank cell in it clears the field. A column
> you do not list is never written.**

`columns` is **which columns the merchant's spreadsheet actually contained.** You already compute
exactly this: it is the header mapping from step 2 of the import screen (`2026-08-28` §10), the one
you show the merchant to correct. Send those keys.

Use the `key` values from `GET /api/products/import/template` — all twelve, unchanged:

```
name, sku, barcode, hsCode, description, price, weightKg,
lengthCm, widthCm, heightCm, handling, categoryPath
```

### Why it works this way

The alternative was to guess, and both guesses are bad:

- *"An upsert writes every field."* A sheet of SKUs and prices would reset every `FRAGILE` product to
  `GENERAL` and unfile every categorized one. A carrier told that a fragile parcel is general
  merchandise stops handling it as fragile.
- *"An upsert writes only the non-blank cells."* Then clearing an optional field is impossible, and
  the merchant who empties a barcode cell is told it worked.

Declaring the columns removes the guess instead of picking one.

## 2.3 Repricing, end to end

The vase as it stands — every optional field set, `FRAGILE`, filed in a category:

```json
{
  "sku": "DOC-VASE", "name": "Glass vase",
  "barcode": "5551110000019", "hsCode": "7013.99",
  "description": "Hand-blown, packed in straw",
  "price": 480.00, "weightKg": 1.200,
  "lengthCm": 30.00, "widthCm": 20.00, "heightCm": 20.00,
  "handling": "FRAGILE", "categoryName": "Vases"
}
```

A two-column sheet:

```json
{
  "dryRun": false,
  "mode": "UPSERT",
  "columns": ["sku", "price"],
  "rows": [ { "rowNumber": 2, "sku": "DOC-VASE", "price": "525" } ]
}
```

`201`:

```json
{
  "dryRun": false,
  "totalRows": 1,
  "created": 0,
  "updatedSkus": ["DOC-VASE"],
  "newCategories": [],
  "errors": []
}
```

And the product afterwards — **only `price` and `updatedAt` moved**:

```json
{
  "sku": "DOC-VASE", "name": "Glass vase",
  "barcode": "5551110000019", "hsCode": "7013.99",
  "description": "Hand-blown, packed in straw",
  "price": 525.00, "weightKg": 1.200,
  "lengthCm": 30.00, "widthCm": 20.00, "heightCm": 20.00,
  "handling": "FRAGILE", "categoryName": "Vases",
  "createdAt": "2026-09-04T16:18:46.806863Z",
  "updatedAt": "2026-09-04T16:18:47.757279Z"
}
```

## 2.4 Clearing a field, and the three you cannot touch

**To clear an optional field, declare its column and send an empty cell:**

```json
{ "mode": "UPSERT", "columns": ["sku", "barcode"],
  "rows": [ { "rowNumber": 2, "sku": "DOC-VASE", "barcode": "" } ] }
```

→ `barcode` becomes `null`. A blank cell in a **required** column (`name`, `price`, `weightKg`,
`handling`) is a row error instead.

Three fields an upsert never writes, whatever you send:

| | |
| --- | --- |
| **`imageMediaId`** | Not a template column, so it can never be declared — listing it is a `400`. An upsert preserves whatever image the product has. Change images through `PUT /api/products/{id}`. |
| **the SKU's spelling** | Matching folds case, so a row spelling it `doc-vase` updates `DOC-VASE` and **leaves the stored spelling alone**. An import can never rename a SKU; that is what `PUT /api/products/{id}` is for. |
| **`categoryPath` when undeclared** | Declared, it is authoritative (a name refiles, blank unfiles, a missing category is created as on an insert). Undeclared, the product keeps its filing. |

## 2.5 The dry run is more important than before

For an insert, a preview told the merchant what was wrong. For an upsert it tells them **which of
their own existing products a commit will rewrite** — the one thing they cannot see for themselves,
and the difference between a deliberate bulk edit and a typo in a SKU column.

```json
{ "dryRun": true, "mode": "UPSERT", "columns": ["sku", "price"], "rows": [
    { "rowNumber": 2, "sku": "DOC-VASE", "price": "525" },
    { "rowNumber": 3, "sku": "BRAND-NEW", "price": "40" } ] }
```

`200` — note it reports the updates **and** the errors together:

```json
{
  "dryRun": true,
  "totalRows": 2,
  "created": 0,
  "updatedSkus": ["DOC-VASE"],
  "newCategories": [],
  "errors": [
    { "row": 3, "name": "handling", "reason": "must not be null" },
    { "row": 3, "name": "weightKg", "reason": "must not be null" },
    { "row": 3, "name": "name",     "reason": "must not be blank" }
  ]
}
```

**Show `updatedSkus` before letting them commit.** "This will rewrite 388 of your products" is the
confirmation that matters; `updatedSkus.length` is the count.

`created` stays `0` on a dry run, unchanged from `2026-08-28` — it means "written", and a dry run
writes nothing. `updatedSkus` is the projection instead, which is exactly how `newCategories` already
behaves.

## 2.6 Mixed files

One file can create and update at once, and the report splits them: `created` counts the new
products, `updatedSkus` names the existing ones.

A **new** SKU still needs every required column — there is nothing to merge onto — so if your
`columns` omit one, that row is rejected naming it:

```json
{ "detail": "Some rows were rejected, so nothing was imported", "status": 422,
  "errors": [
    { "row": 9, "name": "handling", "reason": "must not be null" },
    { "row": 9, "name": "weightKg", "reason": "must not be null" },
    { "row": 9, "name": "name",     "reason": "must not be blank" }
  ] }
```

That reads as "row 9 is a new product and your file has no weight column", which is usually a sign
the merchant meant to edit and mistyped a SKU. Still all-or-nothing: **nothing at all is written.**

## 2.7 Errors

The four `columns` errors are `400` with a plain `detail` — they are about the request, not any row,
so there is no `errors` array to walk:

| what | `detail` (en) | `detail` (ar) |
| --- | --- | --- |
| `columns` omits `sku` | Your file must include the SKU column, which is how a row is matched to a product | يجب أن يحتوي ملفك على عمود رمز التخزين، فهو ما يُربط به الصف بالمنتج |
| `UPSERT` with no `columns` | List the columns your file contains | حدد الأعمدة الموجودة في ملفك |
| a key not in the template | One of the columns you listed is not a column of the import template | أحد الأعمدة التي حددتها ليس من أعمدة قالب الاستيراد |
| `columns` on an insert | Columns apply to an update import only | الأعمدة تُستخدم في استيراد التحديث فقط |

```json
{ "detail": "Your file must include the SKU column, which is how a row is matched to a product",
  "instance": "/api/products/import", "status": 400, "title": "Bad Request" }
```

Row-level errors are the `422` + `errors` array you already handle, unchanged. Everything from
`2026-08-28` §5 still applies: bad cells, duplicate SKUs within one file, the 1000-row cap.

One new `409` you are unlikely to see:

```json
{ "detail": "Your products changed while this file was being checked, so nothing was imported — please preview it again",
  "status": 409 }
```

Two staff importing overlapping files at the same moment. Nothing was written — send them back to the
preview.

## 2.8 Suggested screen

Your existing four-step flow (`2026-08-28` §10) needs one addition, at step 2:

**After the header mapping, ask what the file is for.** Two radio buttons:

1. **"Add new products"** → `mode` omitted. Unchanged from today.
2. **"Update products I already have"** → `mode: "UPSERT"`, `columns` = the mapped keys.

Then in the preview, when `mode` is `UPSERT`, render `updatedSkus` as prominently as `errors` — a list
or a count with a "show them" expander — and make the commit button say what it will do
("Update 388 products").

Worth offering, since it is the workflow this exists for: **"export my catalog"** — page
`GET /api/products?size=100`, write the twelve template columns, hand them an `.xlsx`. They edit one
column and upload it back. There is no server-side export endpoint; ask if you want one.

## 2.9 Still not built

- **Variants in bulk import.** The import creates and updates products only; `variants` is not a
  column. It was blocked on SKU matching, which now exists, so it is finally possible — but it needs
  a rule for how one cell names a set of labels. Say if a merchant needs it.
- **Images in an import**, by media id or URL — see `2026-08-28` §9.
- **Deleting by import.** A SKU absent from the file is left alone; nothing is ever removed.
- **A server-side catalog export** (§2.8).
- Per-variant weight, dimensions, barcode, stock — `2026-08-28-variants` §2.

If the screen you are designing needs something that is not here or in the earlier drops, now is when
it is cheap to say so.
