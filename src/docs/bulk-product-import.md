# 2026-08-28 — bulk product import

**Status: live on staging.** Merged as [PR #24](https://github.com/Rawafid-tech/rawafid-be/pull/24), deployed 2026-08-28 13:00 UTC, and answering on `https://rawafid.softizone.net` now. Every payload below was captured from a running instance, and every behaviour described was smoke-verified against staging itself with live calls — including that a preview leaves the catalog untouched, that one bad row leaves the good rows beside it unwritten, that a re-import rejects every row instead of updating anything, that `fragile` is accepted and stored as `FRAGILE`, and that a category named like a path does not swallow the sub-category sharing its words.

This is the piece the products drop was waiting on. A merchant with four hundred SKUs was never going to type them into a form.

**Read [2026-08-16](./2026-08-16.md) first.** It is the products contract: what a product is, what every field means, and what each one accepts. This document adds one screen and repeats none of those rules — an imported row is validated against exactly the same ones as a hand-typed product, deliberately, so there is nothing new to learn about the fields themselves.

Everything here is additive. No existing endpoint or field changed shape or meaning.

---

## 1. The one thing that decides your whole implementation

**You parse the spreadsheet. The server never sees the file.**

That is deliberate and it is not going to change. Two reasons, both practical:

- A browser decodes what Excel saved, whatever locale saved it. Excel on an Arabic Windows writes CSV as CP1256 with semicolon delimiters; a server guessing at that hands merchants mojibake product names and gets blamed for it.
- You are the only party still holding the file when the error report comes back, so you are the only one who can highlight row 47 of the thing on their screen.

So the flow is: read the column spec, generate a template from it, let the merchant fill it in, parse it (SheetJS handles `.xlsx`, `.xls` and `.csv`), map their columns to ours, and POST rows as JSON.

There is no file upload endpoint, no `multipart/form-data`, and no job to poll.

## 2. The three calls

| call | what it does |
| --- | --- |
| `GET /api/products/import/template` | the columns to build the sheet from |
| `POST /api/products/import` with `"dryRun": true` | **200** with every problem and every category a commit would create. Writes nothing at all. |
| `POST /api/products/import` with `"dryRun": false` | **201** with what it created, or **422** naming the rows at fault having written nothing |

All three need **`product:manage`** — the same permission as adding one product. There is no separate import permission and no new node in `GET /api/permissions`: importing a thousand products is the same capability as adding one, at a different scale. Drive the button off the caller's `permissions` array from `GET /api/auth/me`, as everywhere else.

## 3. `GET /api/products/import/template`

Twelve columns, in the order to write them into the sheet. Localized by `Accept-Language`. Real response, trimmed to three of the twelve:

```json
[
  { "key": "name", "label": "Product name", "required": true, "type": "TEXT",
    "example": "سماعات لاسلكية", "defaultValue": null, "allowedValues": [],
    "aliases": ["name", "Product name", "اسم المنتج", "product name"] },
  { "key": "handling", "label": "Handling", "required": true, "type": "ENUM",
    "example": "GENERAL", "defaultValue": "GENERAL",
    "allowedValues": ["GENERAL", "FRAGILE", "LIQUID", "BATTERY", "FLAMMABLE"],
    "aliases": ["handling", "Handling", "طريقة التعامل", "handling type"] },
  { "key": "categoryPath", "label": "Category", "required": false, "type": "TEXT",
    "example": "إلكترونيات > كابلات", "defaultValue": null, "allowedValues": [],
    "aliases": ["categoryPath", "Category", "الفئة", "category"] }
]
```

The twelve keys, in order: `name`, `sku`, `barcode`, `hsCode`, `description`, `price`, `weightKg`, `lengthCm`, `widthCm`, `heightCm`, `handling`, `categoryPath`.

| field | use it for |
| --- | --- |
| `key` | the JSON field to send the cell as |
| `label` | the header to write into the sheet, already in the caller's language |
| `required` | mark the header, and warn before upload if the column is missing |
| `type` | `TEXT`, `DECIMAL` or `ENUM` — enough to format the column |
| `allowedValues` | non-empty only for `ENUM`; wire it as a dropdown (Excel data validation) |
| `defaultValue` | pre-fill the column with this |
| `example` | one sample row, so the merchant can see the intent |
| `aliases` | **match a merchant's own headers against these**, case- and whitespace-insensitively |

In Arabic the same three labels are `اسم المنتج`, `طريقة التعامل`, `الفئة`.

**Why a spec and not an `.xlsx` to download.** One source of truth: the headers come from the same message bundles as every other label in the product, and `handling`'s values come from the enum itself. A checked-in spreadsheet would drift the first time either changed, and drift here means handing merchants a template the endpoint then rejects. Generating the file client-side also puts you in a position to offer the column-mapping step, which you need regardless — no merchant's existing sheet has our headers.

`aliases` deliberately carries **both** languages' headers, so a merchant who downloaded the Arabic template can upload it a week later with the app in English.

## 4. The request

```json
{
  "dryRun": true,
  "rows": [
    { "rowNumber": 5, "name": "USB-C cable", "sku": "DOC-A", "price": "120",
      "weightKg": "0.08", "handling": "GENERAL", "categoryPath": "إلكترونيات > كابلات" },
    { "rowNumber": 6, "name": "Leather strap", "sku": "DOC-B", "price": "300",
      "weightKg": "0.15", "handling": "fragile", "categoryPath": "Accessories" }
  ]
}
```

| field | notes |
| --- | --- |
| `dryRun` | **required, no default.** `true` checks, `false` commits. Omitting it is a `400` naming the field — a default in either direction is the kind that ruins someone's afternoon. |
| `rows` | 1–1000 entries. 1001 is a `400` naming `rows`. |
| `rowNumber` | **required**, and it is *your* number: the row of the merchant's sheet. Every error quotes it back, so send what the merchant can see, not your array index. Blank rows you skipped while parsing are exactly why this field exists. |
| the product fields | as in [2026-08-16 §2](./2026-08-16.md), same rules and same bounds. |
| `imageMediaId`, `categoryId` | **not accepted.** A spreadsheet has no UUIDs. Images stay a per-product action; categories arrive by name (§7). |
| `categoryPath` | ≤ 250 chars. `Parent > Child`, or just `Category`. Empty files the product nowhere. |

### Cells may be JSON strings or JSON numbers — both work

`"price": "120"` and `"price": 120` are the same request. Send whichever your parser gives you; nothing needs converting first.

The reason the numbers are *accepted* as text: a spreadsheet cell **is** text, and a merchant who typed `1,5` has made a mistake in one row, not in the file. Typed strictly, that one cell would fail inside the JSON parser before any row had been looked at, and the answer would be a single `400` pointing at `rows[699].price` — an index of an array the merchant never saw, telling them nothing about the other 999 rows. Instead it is an ordinary error against row 699.

### `handling` is matched without regard to case

A column of `fragile` out of the merchant's own system imports fine and is stored as `FRAGILE`.

It is still **required on every row** ([2026-08-16 §1c](./2026-08-16.md)). Pre-fill the column with the spec's `defaultValue`, and for a sheet that has no such column offer "apply `GENERAL` to every row" in your mapping step. The server will not assume it for you — a silent default there would let a file quietly downgrade every `FRAGILE` product to `GENERAL`.

## 5. The preview — `dryRun: true`

Always `200`, errors and all. That *is* the answer, not a failure. Real response:

```json
{
  "dryRun": true,
  "totalRows": 7,
  "created": 0,
  "newCategories": ["إلكترونيات", "إلكترونيات > كابلات", "Accessories"],
  "errors": [
    { "row": 7,  "name": "weightKg",     "reason": "must not be null" },
    { "row": 8,  "name": null,           "reason": "Send length, width and height together, or none of them" },
    { "row": 9,  "name": "handling",     "reason": "must be one of: GENERAL, FRAGILE, LIQUID, BATTERY, FLAMMABLE" },
    { "row": 10, "name": "price",        "reason": "must be a number" },
    { "row": 11, "name": "categoryPath", "reason": "A category can hold sub-categories one level deep only" }
  ]
}
```

| field | meaning |
| --- | --- |
| `totalRows` | everything you sent, including the rejected rows |
| `created` | always `0` on a preview |
| `newCategories` | categories that do not exist yet, in creation order, `Parent > Child` form. **What a commit would create on the merchant's behalf** — see §7. |
| `errors` | every rejected row |

**Show this step. Do not skip it.** It is the only thing standing between a typo and a permanent category, and it lets the merchant fix a file once instead of discovering problems two at a time.

A preview runs in a read-only database transaction, so it physically cannot write. That is not a promise resting on a flag being read correctly somewhere.

## 6. The commit — `dryRun: false`

`201` when every row is good:

```json
{
  "dryRun": false,
  "totalRows": 2,
  "created": 2,
  "newCategories": ["إلكترونيات", "إلكترونيات > كابلات", "Accessories"],
  "errors": []
}
```

**`422` when any row is bad — and nothing at all is written.** Not the good rows, not the categories:

```json
{
  "detail": "Some rows were rejected, so nothing was imported",
  "instance": "/api/products/import",
  "status": 422,
  "title": "Unprocessable Content",
  "errors": [
    { "row": 5, "name": "sku", "reason": "You already have a product with this SKU" },
    { "row": 6, "name": "sku", "reason": "You already have a product with this SKU" }
  ]
}
```

All-or-nothing on purpose: a merchant who fixes their file uploads the whole of it again, rather than working out which half already landed. **So your retry is "send the corrected file", never "send just the rows that failed".**

### Insert-only

A SKU the company already has is a rejected row, never an update. Re-importing a file that worked rejects every row — the response above is exactly that, and it is the expected outcome rather than a bug.

If a merchant asks how to bulk-update prices, the answer today is that they cannot. Bulk editing by re-import is a separate feature (§9); it needs its own answer to "an absent column means leave that field alone", and shipping it as a guess would let a file without a handling column reset every `FRAGILE` product.

## 7. Categories in an import

`categoryPath` names categories rather than referencing ids, and **anything it names that does not exist yet is created.** The tree is the two-level one from [2026-08-16 §12](./2026-08-16.md).

- `Cables` → a top-level category.
- `Electronics > Cables` → `Cables` under `Electronics`, creating `Electronics` too if it is missing.
- `Electronics > Cables > Micro USB` → rejected. Two levels, no deeper.
- Matched **case-insensitively**, so `ACCESSORIES` finds the existing `Accessories` instead of making a second one.
- `newCategories` echoes the **stored** spelling of an existing parent, so what the merchant approves is the tree they will actually get: a file saying `ELECTRONICS > Adapters` under an existing `Electronics` previews as `Electronics > Adapters`.
- Only rows that are otherwise clean contribute to `newCategories`. A category named solely by a rejected row would never be created, so it is not promised.

**This is the real reason the preview screen is not optional.** A misspelled category is a *new* category, and the preview is the merchant's only chance to notice before it is permanent. Render `newCategories` prominently — "3 new categories will be created: …" — never as a footnote.

The 200-category ceiling applies, and a file that would breach it reports as a `row: null` error (§8).

## 8. Errors

The same `{name, reason}` shape as every other validation failure in the API ([2026-08-16 §9](./2026-08-16.md)), with a `row` added — so one renderer handles both.

- **`row: null`** — a problem with the file as a whole rather than any line of it. Show it above the table, not against a row.
- **`name: null`** — the rule spans several fields, and naming one would point at the wrong cell. Show it against the row. The incomplete dimension trio is the only case today.
- `reason` is already localized by `Accept-Language` and written to be displayed as-is.

| status | when | notes |
| --- | --- | --- |
| `200` | a preview, always | errors are in the body — branch on `errors.length`, not on the status |
| `201` | a commit that wrote | |
| `422` | a commit with any bad row | nothing written; go back to the preview screen |
| `400` | `dryRun` missing, a `rowNumber` missing, more than 1000 rows, a body over 8 MB, malformed JSON | the envelope was wrong, so no row was read |
| `403` | the caller lacks `product:manage` | |

Both languages, captured from the same build:

| en `reason` | ar `reason` |
| --- | --- |
| `must not be null` (a missing required cell) | `لا يمكن أن يكون منعدم` |
| `must be a number` | `يجب أن يكون رقمًا` |
| `must be one of: GENERAL, FRAGILE, LIQUID, BATTERY, FLAMMABLE` | `يجب أن تكون إحدى القيم التالية: GENERAL, FRAGILE, LIQUID, BATTERY, FLAMMABLE` |
| `This SKU appears more than once in the file` | `رمز التخزين هذا مكرر في الملف` |
| `You already have a product with this SKU` | `لديك بالفعل منتج بنفس رمز التخزين` |
| `Send length, width and height together, or none of them` | `أرسل الطول والعرض والارتفاع معًا، أو لا ترسل أيًا منها` |
| `A category can hold sub-categories one level deep only` | `يمكن للفئة أن تحتوي على فئات فرعية بمستوى واحد فقط` |
| `Import at most 1000 rows at a time — split the file` | `استورد 1000 صف كحد أقصى في المرة الواحدة — قسّم الملف` |

The `400` for an oversized file names the field, like any other envelope failure:

```json
{
  "detail": "Request validation failed",
  "instance": "/api/products/import",
  "status": 400,
  "title": "Validation Failed",
  "errors": [{ "reason": "Import at most 1000 rows at a time — split the file", "name": "rows" }]
}
```

Two of these are terse because they come from the validation layer rather than from a written message: `must not be null` and `must be a number`. If you would rather they read as sentences ("This cell is required", "Enter a number"), say so — it is a two-line change and now is the cheap moment.

## 9. Limits, and what does not exist

| limit | value | what happens |
| --- | --- | --- |
| rows per request | 1000 | `400` naming `rows` |
| JSON request body | 8 MB | `400`; the parse is abandoned partway |
| categories per company | 200 | an error with `row: null` |

**There is no job, no polling, no progress and no partial state.** The import runs inside the request — a thousand rows commits in well under a second; a forty-row commit measured 23 ms. A larger file has to be split, and that is a real constraint to design for rather than a soft suggestion.

So do not build: a progress bar, a job status poller, an "import history" or "past uploads" screen, or a retry-failed-rows-only action. None of them have anything to read.

Also not built, deliberately:

- **Upsert / bulk edit by re-import.** Its own phase (§6).
- **A category-only import.** The `categoryPath` column makes a second template redundant.
- **Images**, by media id (no spreadsheet has one) or by URL (fetching merchant-supplied URLs server-side is an SSRF hole).
- **Server-side file parsing**, and any stored copy of the uploaded file or audit trail of who imported what.

## 10. Suggested screen

A third tab beside the products list and the category tree, or a button on the list. Four steps, and the third is the one that matters:

1. **Download the template.** Fetch the spec, build the `.xlsx` client-side: headers from `label`, one sample row from `example`, Excel data validation on `handling` from `allowedValues`. Offer it in the current language.

2. **Upload and map.** Parse the file. Match each of the merchant's headers against `aliases` automatically, then show the mapping so they can correct it; a required column left unmapped blocks the upload. **Record `rowNumber` for each parsed row here** — you cannot recover it later. Worth adding: a "this sheet has no handling column — apply `GENERAL` to every row" checkbox, and a warning when the file exceeds 1000 rows, with an offer to split it.

3. **Preview.** POST with `dryRun: true`. Show two things: the errors, against the rows they belong to in a scrollable grid, and the categories the commit will create. Let them fix the file and re-preview as often as they like — it writes nothing. Keep "Import" disabled while `errors` is non-empty.

4. **Commit.** POST with `dryRun: false`. On `422`, return to step 3 with the new errors — nothing was written, so there is nothing to undo. On `201`, report how many products and how many categories were created, and refresh the list.

## 11. What is still coming

One thing, and it does not touch anything above:

- **Exact-match barcode lookup**, for scan-to-find at packing. Today `search` does a contains-match over name, SKU and barcode; a scanner wants one endpoint that answers with the one product or nothing.

If the screen you are designing needs something that is not here or in [2026-08-16](./2026-08-16.md), now is when it is cheap to say so.
