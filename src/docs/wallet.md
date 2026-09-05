# Wallet — FE contract

**Status: live on staging. Build against it.**

> **Superseded in part on 2026-09-05.** The wallet contract below is unchanged and still correct,
> but three statements about what *spends* the balance are now out of date — subscriptions are paid
> from the wallet, renew from it, and email the owner when they cannot. The corrections are marked
> inline; the full story is in [2026-09-05-subscriptions.md](2026-09-05-subscriptions.md).

The merchant's prepaid balance and its transaction history, plus the admin console's ability to move
that balance by hand. Two screens: one tenant, one admin.

**What this is not, yet.** There is **no top-up**. A merchant cannot add money — not by card, not by
any means — and there is no endpoint that would let them. Money enters a wallet only when a platform
admin puts it there. Do not build a "Top up" button, a payment form, or a card-entry screen; the
gateway and its checkout flow are a later phase and will arrive with their own drop.

> ~~Nothing spends the balance yet either: subscriptions are still assigned by the platform and do
> not read the wallet.~~ **Out of date as of 2026-09-05.** Subscriptions are now bought and renewed
> out of the wallet — see [2026-09-05-subscriptions.md](2026-09-05-subscriptions.md). The "no
> top-up" half of this paragraph still stands, and is exactly why a merchant whose renewal fails is
> told to contact support.

Every payload below was captured from staging, not written by hand.

---

## 1. The model, in one paragraph

Every company has exactly one wallet, in EGP, created the moment it registers — so there is no
"create wallet" call and no empty state to handle beyond a balance of `0.00`. Every change to the
balance writes an immutable **ledger row** that records the amount, the direction, and the balance on
both sides of the movement. The ledger is the history screen. Rows are never edited or deleted; a
correction is a new row in the opposite direction.

---

## 2. Reading the balance

```
GET /api/wallet                                  wallet:read
```

```json
{
  "balance": 500.00,
  "currency": "EGP",
  "updatedAt": "2026-09-04T20:59:02.651014Z"
}
```

**There is no wallet id in this response, deliberately.** The wallet is always the caller's own,
resolved from the token — there is no `/api/wallet/{id}` and there never will be. If you find
yourself wanting an id here, the endpoint you want is probably a company-scoped admin one (§5).

`balance` always carries two decimal places (`0.00`, not `0`). A fresh company reads exactly:

```json
{"balance":0.00,"currency":"EGP","updatedAt":"2026-09-04T20:56:24.221208Z"}
```

`currency` is `"EGP"` for every company today. Read it rather than hardcoding the symbol, but do not
build a currency switcher — nothing sets it to anything else.

---

## 3. Reading the history

```
GET /api/wallet/transactions                     wallet:read
```

Standard `PageResponse` envelope, newest first:

```json
{
  "content": [
    {
      "id": "493682ff-cb1b-492b-953d-8226f6d3af90",
      "type": "ADMIN_CREDIT",
      "direction": "CREDIT",
      "amount": 500.00,
      "balanceBefore": 0.00,
      "balanceAfter": 500.00,
      "referenceType": "admin_adjustment",
      "referenceId": "7612a75c-ecec-4907-9228-0c3b7ac56c46",
      "note": "رصيد تعويضي عن انقطاع الخدمة",
      "createdAt": "2026-09-04T20:59:02.651156Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### 3.1 `amount` is always positive — read the sign from `direction`

This is the one thing to get right on this screen. `amount` is never negative. Whether the movement
added or removed money is `direction`, which is `CREDIT` or `DEBIT`.

```
direction === "CREDIT"  →  +500.00, green
direction === "DEBIT"   →  −500.00, red
```

Do not derive the sign from `type`, and do not derive it from `balanceAfter - balanceBefore` either.
`direction` exists precisely so that a `type` added in a later phase renders correctly without a
frontend change.

### 3.2 `type` vs `direction`

`direction` is what you colour by. `type` is what you *label* by, and it is the more specific of the
two. Values you can receive today:

| `type` | `direction` | What to show |
|---|---|---|
| `ADMIN_CREDIT` | `CREDIT` | "Credit from Rawafid" / "رصيد من روافد" |
| `ADMIN_DEBIT` | `DEBIT` | "Adjustment by Rawafid" / "تعديل من روافد" |
| `SUBSCRIPTION_NEW` | `DEBIT` | "Subscription" — added 2026-09-05 |
| `SUBSCRIPTION_RENEWAL` | `DEBIT` | "Subscription renewal" — added 2026-09-05 |

Both subscription types are live and filterable via `?type=`; see
[2026-09-05-subscriptions.md](2026-09-05-subscriptions.md) §6.1 for a real renewal row.

Values the API declares but **still never sends** — `TOP_UP` and `REFUND`. They arrive with later
phases. **Handle an unknown `type` gracefully**: fall back to a generic label plus `direction` for
the sign, rather than rendering blank or throwing. That is the whole reason `direction` is a separate
field.

### 3.3 `note` is for the merchant to read

When a platform admin moves a balance they must state why, and `note` is that reason — written for
the merchant, in whatever language the admin typed. **Show it on the row.** A balance change the
merchant did not make is exactly the thing they will open a ticket about, and this field is the
answer. It is `null` only for movements that had no human behind them — as of 2026-09-05 those
exist: a subscription charge and an automatic renewal both carry `note: null`, because nobody typed
anything. Do not render an empty note as a blank cell where a reason is expected.

`referenceType` / `referenceId` are the audit trail — `"admin_adjustment"` plus the admin's request
id today, a payment or subscription id in later phases. Not worth showing on the row; useful in a
detail drawer or when chasing a support question.

### 3.4 `balanceBefore` / `balanceAfter`

The balance either side of this movement. Handy for a "running balance" column, and they are
guaranteed to chain — each row's `balanceBefore` is the previous row's `balanceAfter`.

### 3.5 Query parameters

| Param | Default | Notes |
|---|---|---|
| `page` | `0` | |
| `size` | `20` | Clamped to **100**; `size=5000` returns `"size": 100`, it does not error |
| `sort` | `CREATED_AT` | `CREATED_AT` or `AMOUNT` only |
| `direction` | `DESC` | **Sort direction** — `ASC`/`DESC`. Nothing to do with the row's `direction` field, confusingly; it is the same name every paged endpoint in this API uses |
| `type` | — | Filters exactly. One of the `type` values above |

An unknown `type` is a 400, not an empty page:

```json
{"detail":"Failed to convert 'type' with value: 'NOPE'","instance":"/api/wallet/transactions","status":400,"title":"Bad Request"}
```

---

## 4. Permissions

One new page node with one action beneath it:

```json
{
  "id": "c5eee33a-ee3d-4d89-bc14-66fed64a9f2f",
  "code": "page:wallet",
  "kind": "PAGE",
  "label": "Wallet",
  "children": [
    {"id": "4ff1a7de-d374-4856-840c-d14dc0cbb4bb", "code": "wallet:read", "kind": "ACTION", "label": "View wallet", "children": []}
  ]
}
```

Arabic labels come back on `Accept-Language: ar`: `المحفظة` and `عرض المحفظة`.

`wallet:read` gates both endpoints in §2 and §3. **The owner always has it** without any grant, as
with every other tenant permission. Staff need it ticked, and without it both endpoints are 403.

There is deliberately **no `wallet:manage`**. A merchant cannot move their own balance in this phase,
so a tick-box granting nothing would be a lie. `wallet:topup` arrives with the gateway.

---

## 5. Admin console

```
GET  /api/admin/companies/{companyId}/wallet                 wallet:wallet:read
GET  /api/admin/companies/{companyId}/wallet/transactions     wallet:wallet:read
POST /api/admin/companies/{companyId}/wallet/adjustments       wallet:wallet:manage
```

`SUPPORT` holds only `wallet:wallet:read` — a support agent can answer "where did my money go"
without being able to move any. `SUPER_ADMIN` holds both.

**There is no global `/api/admin/wallets` list.** A wallet is reached from the company it belongs to,
so hang the panel off the existing company detail screen rather than building a wallets index.

### 5.1 Reading

```json
{"companyId":"977bcf2b-c356-4e60-b200-2da59e13483d","balance":500.00,"currency":"EGP","updatedAt":"2026-09-04T20:59:02.651014Z"}
```

The transactions endpoint takes the same query parameters as §3.5 and returns the same rows **plus
`createdBy`** — the admin who caused the movement:

```json
{
  "content": [
    {
      "id": "493682ff-cb1b-492b-953d-8226f6d3af90",
      "type": "ADMIN_CREDIT",
      "direction": "CREDIT",
      "amount": 500.00,
      "balanceBefore": 0.00,
      "balanceAfter": 500.00,
      "referenceType": "admin_adjustment",
      "referenceId": "7612a75c-ecec-4907-9228-0c3b7ac56c46",
      "note": "رصيد تعويضي عن انقطاع الخدمة",
      "createdBy": "9aa4a8a0-edc9-47dd-a437-68d8abc14d03",
      "createdAt": "2026-09-04T20:59:02.651156Z"
    }
  ],
  "page": 0, "size": 20, "totalElements": 1, "totalPages": 1
}
```

`createdBy` is **absent from the tenant response** in §3 — compare the two payloads. Do not surface a
platform admin's identity in the merchant UI.

### 5.2 Moving a balance

```
POST /api/admin/companies/{companyId}/wallet/adjustments
```

```json
{
  "requestId": "7612a75c-ecec-4907-9228-0c3b7ac56c46",
  "direction": "CREDIT",
  "amount": 500.00,
  "note": "رصيد تعويضي عن انقطاع الخدمة"
}
```

| Field | Rules |
|---|---|
| `requestId` | **Required.** A UUID *you* generate — see §5.3 |
| `direction` | **Required.** `CREDIT` or `DEBIT`. There is no signed amount |
| `amount` | **Required.** Positive, max 2 decimals, `0.01`–`1000000.00` |
| `note` | **Required, non-blank**, max 500 chars. **Shown to the merchant** — put the reason a merchant should read here, not an internal remark |

**201** on success, returning the created ledger row (same shape as §5.1, including `createdBy`).

### 5.3 `requestId` — generate one per dialog, not per click

This is the part that needs care in the UI.

Generate a fresh UUID when the adjustment dialog **opens**, and send that same value with every
submit attempt from that dialog. Then:

- **Same `requestId`, same `direction` + `amount`** → **200** (not 201) with the *original* row. The
  balance moves **once**. This is what makes a double-clicked Save, a flaky connection, or a retry
  safe. Treat 200 exactly like 201 — the movement happened, just not on this attempt.

  ```json
  HTTP 200
  {"id":"493682ff-cb1b-492b-953d-8226f6d3af90", ..., "balanceAfter":500.00, ...}
  ```

  Note the `id` is identical to the 201 response's.

- **Same `requestId`, different `direction` or `amount`** → **409**. The key was reused for a
  different change, which is a bug rather than a retry:

  ```json
  {"detail":"This adjustment reference was already used for a different change","status":409,"title":"Conflict"}
  ```

  If a user edits the amount and resubmits, **generate a new `requestId`** — otherwise they get this
  409 and cannot clear it. Practically: new UUID whenever the form's direction or amount changes.

- **Same `requestId`, different `note` only** → **200**, and the note is *not* updated; the ledger
  keeps the first one. Fixing a typo in the reason therefore needs a new `requestId` too, or an
  opposite-direction correction row.

### 5.4 Errors

| Status | `detail` (en) | When |
|---|---|---|
| 400 | `Request validation failed` + `errors[]` | Field-level; see below |
| 404 | `Company not found` | Unknown `companyId`. There is no separate "wallet not found" — every company has one |
| 409 | `Insufficient wallet balance` | A debit larger than the balance. The balance never goes negative |
| 409 | `This adjustment reference was already used for a different change` | §5.3 |
| 409 | `This would take the wallet past its maximum balance` | A credit that would exceed the maximum a balance can hold. Unreachable in practice |

Field validation is the usual shape:

```json
{"detail":"Request validation failed","status":400,"title":"Validation Failed","errors":[{"reason":"must not be blank","name":"note"}]}
```

All of these are localized. On `Accept-Language: ar`:

```json
{"detail":"رصيد المحفظة غير كافٍ","status":409,"title":"Conflict"}
```

---

## 6. The screens

**Merchant — Wallet.** A balance card (`balance` + `currency`, large) over the transaction table.
Columns: date, label (from `type`), the reason (`note`), the signed amount (from `direction`), and
optionally a running balance (`balanceAfter`). Empty state is a company that has never had a
movement — `{"content":[],"totalElements":0}` — and the honest copy is "no transactions yet" and
**not** a "top up now" call to action, because there is nothing to click.

Gate the sidebar entry on `wallet:read`.

**Admin — company detail.** A wallet panel on the existing company screen: balance, an "Adjust
balance" button behind `wallet:wallet:manage`, and the ledger with `createdBy`. The adjust dialog is
direction (credit/debit toggle), amount, and a required reason — with the reason field labelled so
the admin knows the merchant will read it.

---

## 7. Still not built

- **Top-up of any kind.** No card, no wallet, no bank transfer, no voucher. §Intro. Still true, and
  still the reason every dead end says "contact support".
- ~~**Subscriptions paid from the balance.**~~ **Built 2026-09-05.**
- ~~**Auto-renewal, low-balance warnings, grace periods.**~~ **Built 2026-09-05**, along with the
  emails that announce them. See [2026-09-05-subscriptions.md](2026-09-05-subscriptions.md).
- **Refunds and reversals** as a first-class action — a correction today is a manual
  opposite-direction adjustment.
- **A global admin wallets list**, and therefore any "merchants running low" view.
- **Wallet-to-wallet transfers.**
- **Invoices or receipts** for anything.
