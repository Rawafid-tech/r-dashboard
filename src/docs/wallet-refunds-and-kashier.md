# Wallet refunds, and Kashier checkout — FE contract

**Status: live on staging. Build against it.**

Two changes since [2026-09-18-payments-topup.md](2026-09-18-payments-topup.md):

1. **Refunds exist.** A platform admin can give money back against an earlier charge. It shows up in
   the merchant's history as a new row type, `REFUND`, and there is a new admin endpoint to make one.
2. **Top-ups now go through Kashier, not Paymob.** The flow and the endpoints are unchanged; a few
   values you may be displaying are different.

Every payload below was captured from staging, not written by hand.

---

## 0. What changed for you

| | Before | Now |
|---|---|---|
| `REFUND` rows in the history | declared, never sent | **sent** — a credit against an earlier charge |
| Transaction payload | — | new field **`refundedTransactionId`** (tenant and admin) |
| Admin console | adjust only | new **Refund** action on a charge row |
| Top-up checkout page | Paymob | **Kashier** (`gateway: "KASHIER"`) |
| Abandoned `PENDING` top-ups | stayed `PENDING` forever | **fail on their own** after 48 hours |
| A declined card at checkout | could retry on the same page | **one attempt per checkout** — start a new top-up |

Nothing was removed and no field changed type. Everything here is additive, so an app built against
the earlier drops keeps working. It just renders `REFUND` with its unknown-type fallback until you
add a label.

---

## 1. Merchant — `REFUND` in the history

`GET /api/wallet/transactions` can now return rows like this (real row, staging):

```json
{
  "id": "b1c09163-582e-4170-903a-392ee5156dfe",
  "type": "REFUND",
  "direction": "CREDIT",
  "amount": 50.00,
  "balanceBefore": 614.00,
  "balanceAfter": 664.00,
  "referenceType": "refund",
  "referenceId": "5b9a215a-50a1-4af3-9bd0-fca98c553dcf",
  "refundedTransactionId": "0121f08b-4f20-4288-9836-c27dd76d8445",
  "note": "Staging check: partial refund of the renewal",
  "createdAt": "2026-09-25T18:38:49.579895Z"
}
```

### 1.1 Labelling it

Add to the type table from [2026-09-04-wallet.md](2026-09-04-wallet.md) §3.2:

| `type` | `direction` | What to show |
|---|---|---|
| `TOP_UP` | `CREDIT` | "Top-up" / "شحن المحفظة" — live since 2026-09-18 |
| `REFUND` | `CREDIT` | "Refund" / "استرداد" |

`direction` is always `CREDIT` for a refund. Colour it exactly like any other credit.

### 1.2 `refundedTransactionId` — what was refunded

A new field on **every** transaction row, tenant and admin:

- on a `REFUND`: the `id` of the charge it gives money back against;
- on every other type: `null` (present, not omitted).

Use it to say *what* the refund was for, e.g. "Refund — Subscription renewal (5 Sep)". To do that,
find the row with that `id` in the history you already have. Or, if it is on another page, fall
back to just "Refund". **There is no endpoint that fetches a single transaction by id**, and you
don't need one for the label.

**One charge can be refunded in several parts.** Two `REFUND` rows with the same
`refundedTransactionId` is normal (the staging company above has 50.00 and then 100.00 against one
150.00 renewal).

### 1.3 `note` on a refund

Always present on a refund: the admin has to give a reason, and it is written for the merchant to
read. Show it, same as an admin adjustment's note.

### 1.4 What a refund does *not* do

- **No money goes back to a card.** A refund is balance in the Rawafid wallet, never a card reversal.
  Don't write copy like "refunded to your card".
- **The subscription is unchanged.** Refunding a renewal does not cancel or downgrade the plan. If
  support does that too, it is a separate action and shows up separately.

---

## 2. Admin console — the Refund action

```
POST /api/admin/companies/{companyId}/wallet/transactions/{transactionId}/refunds
                                                           wallet:wallet:manage
```

Same permission as adjustments. SUPPORT, which only holds `wallet:wallet:read`, gets **403**.

`transactionId` is the charge being refunded: the `id` of a row in that company's history.

```json
{
  "requestId": "5b9a215a-50a1-4af3-9bd0-fca98c553dcf",
  "amount": 50.00,
  "note": "Staging check: partial refund of the renewal"
}
```

| Field | Rules |
|---|---|
| `requestId` | **Required.** A UUID you generate once per opening of the dialog. It works exactly like adjustments, see [2026-09-04-wallet.md](2026-09-04-wallet.md) §5.3 |
| `amount` | **Required.** Positive, max 2 decimals, `0.01`–`1000000.00`, **and** no more than what is left of the charge (§2.2) |
| `note` | **Required, non-blank**, max 500 chars. **Shown to the merchant** |

There is no `direction`: a refund is always a credit.

**201** with the new `REFUND` row, in the admin shape: the §1 payload plus `createdBy`.
**200** with the *original* row when the same `requestId` is sent again with the same charge and
amount. Treat 200 exactly like 201.

### 2.1 Which rows get a Refund button

**Only debits: rows whose `direction` is `DEBIT`.** Today that is `SUBSCRIPTION_NEW`,
`SUBSCRIPTION_RENEWAL` and `ADMIN_DEBIT`. Check `direction`, not a list of types, and any debit type
added later gets the button for free.

Never show it on a credit (`TOP_UP`, `ADMIN_CREDIT`, `REFUND`); the server refuses those with a 409.

A top-up that should not have been credited is **not** a refund. A refund adds money, and that case
needs money taken away. It is handled with an admin **debit** adjustment.

### 2.2 How much is left to refund

The server allows any number of partial refunds, as long as their total never exceeds the charge.
To show "Refundable: 100.00 of 150.00" and cap the amount field:

```
remaining = charge.amount − Σ amount of rows where refundedTransactionId === charge.id
```

Every one of those rows is a `REFUND` in the same company's history, so
`GET …/wallet/transactions?type=REFUND` gives you the set to sum. Hide the button when `remaining`
is `0.00`. The server enforces the cap regardless (§2.3), so a stale number on screen can't cause
an over-refund. It can only produce a 409.

### 2.3 Errors

| Status | `detail` (en) | When |
|---|---|---|
| 400 | `Request validation failed` + `errors[]` | Missing/blank `note`, missing `requestId`, bad `amount` |
| 403 | — | No `wallet:wallet:manage` (e.g. SUPPORT) |
| 404 | `Company not found` | Unknown `companyId` |
| 404 | `Transaction not found` | `transactionId` is not in **this company's** history. A real id belonging to another company gets this same answer |
| 409 | `Only a charge can be refunded` | The transaction is a credit (§2.1) |
| 409 | `This would refund more than the charge took` | This amount plus earlier refunds exceeds the charge (§2.2) |
| 409 | `This adjustment reference was already used for a different change` | Same `requestId`, different amount or different charge. Generate a new `requestId` when the amount changes |
| 409 | `This would take the wallet past its maximum balance` | Unreachable in practice |

Real bodies from staging:

```json
{"detail":"Only a charge can be refunded","status":409,"title":"Conflict",
 "instance":"/api/admin/companies/2855f892-…/wallet/transactions/c1d17ac3-…/refunds"}
```

```json
{"detail":"Transaction not found","status":404,"title":"Not Found",
 "instance":"/api/admin/companies/2855f892-…/wallet/transactions/67ac3ade-…/refunds"}
```

Localized, as usual. On `Accept-Language: ar`:

```json
{"detail":"سيتجاوز هذا الاسترداد قيمة المبلغ المخصوم","status":409,"title":"Conflict"}
```

The other two Arabic strings: `لا يمكن استرداد إلا المبالغ المخصومة` and `المعاملة غير موجودة`.

### 2.4 The dialog

Open it from a debit row. Show the charge (type label, date, amount) and "refundable: X", then:

- amount, prefilled with the full remaining amount and capped at it;
- a required reason, labelled so the admin knows **the merchant will read it**.

New `requestId` when the dialog opens, and again if the amount changes, same as the adjust dialog.

---

## 3. Top-ups through Kashier

The contract in [2026-09-18-payments-topup.md](2026-09-18-payments-topup.md) is unchanged. The
endpoints, the request and response shapes, the redirect-then-re-read flow and the statuses are all
the same. What differs:

### 3.1 `gateway` and the checkout page

New payments carry `"gateway": "KASHIER"`. Older rows in a merchant's history keep `"PAYMOB"`. So
**expect both values in one list**, and don't treat either as the only one. Real row:

```json
{
  "id": "d22b4f9c-a388-4a3d-b885-03880bb0874b",
  "gateway": "KASHIER",
  "purpose": "WALLET_TOP_UP",
  "status": "NEEDS_REVIEW",
  "credited": true,
  "amount": 150.00,
  "currency": "EGP",
  "paymentMethod": "card",
  "paymentMethodDetail": "Mastercard",
  "failureReason": "Reversed at the gateway",
  "checkoutUrl": null,
  "createdAt": "2026-09-25T16:52:39.877766Z",
  "updatedAt": "2026-09-25T16:56:50.330358Z"
}
```

(`NEEDS_REVIEW` here because this test payment was refunded from the Kashier dashboard afterwards.
A normal paid top-up is `COMPLETED` + `credited: true`.)

`checkoutUrl` is now a Kashier-hosted page. **Treat it as opaque**: don't parse it, don't
check its host, just send the browser there. It is still a full-page redirect, never an iframe, for
the same 3-D Secure reason.

If you show a gateway name anywhere (a history column, a support drawer), map `KASHIER` → "Kashier"
and fall back to the raw value for anything unknown.

### 3.2 `paymentMethodDetail` spelling differs

Kashier sends `"Mastercard"`, Paymob sent `"MasterCard"`. It is still a free-text label (see the
top-up drop §7). If you pick card-brand icons from it, **compare case-insensitively** and keep a
generic fallback.

### 3.3 One attempt per checkout

A Kashier checkout allows **one** payment attempt. If the card is declined, that checkout is over:
the payment goes `FAILED` and the page will not take a second card. So on a `FAILED` payment, the
action is **"Try again", which calls `POST /api/payments/topup` again** for a fresh `checkoutUrl`.
Never send the customer back to the old URL. (This was already the advice. It is now the only way
that works.)

### 3.4 Abandoned top-ups now fail on their own

The top-up drop's §7 said *"A `PENDING` payment never expires."* **That is no longer true.** A
payment still unpaid 48 hours after it was opened becomes `FAILED` with:

```json
"failureReason": "Not completed before the payment session expired"
```

(real value from staging.) Render it like any other `FAILED` row. No money moved, and it gets no
retry button of its own; a new top-up is the way forward. Before that point, a `PENDING` row a
few hours old is normal: the customer may still have the tab open.

### 3.5 When checkout can't be opened

Unchanged: `502` with `The payment provider is not responding. Please try again in a moment.`, and
no money moves. The payment row it leaves behind, visible in `GET /api/payments`, is `FAILED` with
`failureReason: "The payment gateway could not open a checkout"`.

---

## Related drops

- [2026-09-04-wallet.md](2026-09-04-wallet.md) — the balance, ledger and adjustments. Still the
  reference for those; its "`REFUND` is never sent" and "no refunds" lines are superseded by this
  drop.
- [2026-09-18-payments-topup.md](2026-09-18-payments-topup.md) — the top-up flow. Still correct
  except for the Paymob-specific details and "`PENDING` never expires", superseded by §3.
- [2026-09-05-subscriptions.md](2026-09-05-subscriptions.md) — what the subscription charges are.
