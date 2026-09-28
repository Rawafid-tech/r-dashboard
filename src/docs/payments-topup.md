# Wallet top-up — FE contract

**Status: live on staging. Build against it.**

A merchant can now put their own money into their wallet, by card or mobile wallet, through Paymob.
This is the drop [2026-09-04-wallet.md](2026-09-04-wallet.md) promised when it said *"Do not build a
'Top up' button… the gateway and its checkout flow are a later phase and will arrive with their own
drop."*

**That instruction is now reversed. Build the Top up button.**

Every payload below was captured from staging, not written by hand. The 100.00 EGP top-up shown
throughout was paid with a real test card and really did land in a real wallet.

---

## 0. What changed for you

| | Before | Now |
|---|---|---|
| Adding balance | impossible; "contact support" | `POST /api/payments/topup` → a checkout URL |
| Payment history | did not exist | `GET /api/payments` |
| Permission | — | new node **`wallet:topup`** under `page:wallet` |
| Renewal-failure emails | ended at "contact Rawafid support" | now say "open your wallet and top up" |

That last row matters for your copy: eight strings in the subscription emails changed. If any screen
of yours repeats the old "contact support to add balance" line, it is now wrong.

---

## 1. The flow, end to end

```
1.  POST /api/payments/topup  { amount }
         ↓ 201  { paymentId, amount, currency, checkoutUrl }
2.  send the browser to checkoutUrl   (Paymob's hosted page — not your form)
3.  customer pays there
4.  Paymob redirects back to  /wallet   on this origin
5.  ... meanwhile, server-to-server, Paymob tells us the money moved
         ↓
6.  the wallet balance goes up
```

**Step 4 and step 6 are not the same event, and step 4 does not cause step 6.** The redirect is the
customer's browser coming home; the credit happens because of a separate call Paymob makes to our
server, which can arrive before, during or after the redirect. Treat the redirect as "the customer
is back", never as "the payment succeeded".

So when the browser lands on `/wallet`, **re-read the balance** (`GET /api/wallet`) or the payment
(`GET /api/payments/{id}`). Do not show a success message on arrival alone.

In practice the credit is there within a second or two — the staging payment above was `PENDING` at
`14:42:36` and `COMPLETED` and credited at `14:45:00`, and most of that gap was a human typing card
details. But "usually fast" is not "guaranteed before the redirect", and the one time it is slower is
the time a customer sees a success screen over an unchanged balance.

---

## 2. Starting a top-up

```
POST /api/payments/topup                         wallet:topup
```

```json
{"amount": 100.00}
```

That is the entire request body. **There is no currency and no company id**, deliberately: the
company comes from your token, and the currency from the wallet being credited. Neither is a
client's to assert, least of all on the request that decides how much money to take.

`201 Created`:

```json
{
  "paymentId": "e8056143-f760-4bcd-bdcc-f8d7da83293c",
  "amount": 100.00,
  "currency": "EGP",
  "checkoutUrl": "https://accept.paymob.com/unifiedcheckout/?publicKey=egy_pk_test_…&clientSecret=egy_csk_test_…"
}
```

Send the customer to `checkoutUrl`. It is **single use and it expires** — never cache it, never
reuse it for a second attempt, never show it as a link the customer can bookmark. If they want to
try again, call `topup` again and get a fresh one.

Redirect or `window.location` is fine. An iframe is not: Paymob's page runs 3-D Secure, and card
issuers routinely refuse to render their OTP step inside a frame.

The payment row exists before this response reaches you, so `GET /api/payments/{paymentId}` works
immediately.

### The minimum

**100.00 EGP today**, and *do not hardcode that number* — it is server config and will change
without a deploy. The rejection tells you what it currently is:

```json
{"detail":"This amount is below the minimum top-up","instance":"/api/payments/topup","status":400,
 "title":"Bad Request","currency":"EGP","minimum":100.00}
```

```json
{"detail":"هذا المبلغ أقل من الحد الأدنى للشحن","instance":"/api/payments/topup","status":400,
 "title":"Bad Request","currency":"EGP","minimum":100.00}
```

`minimum` and `currency` are top-level properties on the problem detail, next to `detail` — not
nested under an `errors` array. Read `minimum` from the response and use it for your own inline
validation and your helper text, and you will never disagree with the server.

### Structural validation

Separate from the minimum, and shaped differently — the standard `errors` array:

```json
{"detail":"Request validation failed","instance":"/api/payments/topup","status":400,
 "title":"Validation Failed","errors":[{"reason":"must be greater than or equal to 0.01","name":"amount"}]}
```

Bounds: `> 0`, at most `1000000.00`, at most 2 decimal places. These are structural guards, not the
business floor — a value that passes them can still be below the minimum.

### If the gateway is down

```json
{"detail":"The payment provider is not responding. Please try again in a moment.","status":502}
```

Arabic: `مزود الدفع لا يستجيب. من فضلك حاول مرة أخرى بعد قليل.` — 502, retryable, and no money has
moved. The payment is marked failed server-side, so nothing is left dangling.

---

## 3. Payment history

```
GET /api/payments                                wallet:read
```

Note the permission: **`wallet:read`, not `wallet:topup`.** Payment history is part of the wallet
screen, so anyone who can see the balance can see the payments. `wallet:topup` gates only the act of
spending money.

Standard `PageResponse`, newest first:

```json
{
  "content": [
    {
      "id": "e8056143-f760-4bcd-bdcc-f8d7da83293c",
      "gateway": "PAYMOB",
      "purpose": "WALLET_TOP_UP",
      "status": "COMPLETED",
      "credited": true,
      "amount": 100.00,
      "currency": "EGP",
      "paymentMethod": "card",
      "paymentMethodDetail": "MasterCard",
      "failureReason": null,
      "checkoutUrl": null,
      "createdAt": "2026-09-18T14:42:36.704137Z",
      "updatedAt": "2026-09-18T14:45:00.453195Z"
    }
  ],
  "page": 0, "size": 20, "totalElements": 1, "totalPages": 1
}
```

Query params: `page`, `size` (clamped at 100), `sort` = `CREATED_AT` | `AMOUNT`, `direction` =
`ASC` | `DESC`. Defaults are `CREATED_AT` / `DESC`.

`GET /api/payments/{id}` returns one object of exactly the same shape. A payment belonging to another
company answers **404, identical to one that never existed** — do not write copy that distinguishes
"not yours" from "not found", because the API deliberately does not.

```json
{"detail":"Payment not found","instance":"/api/payments/…","status":404,"title":"Not Found"}
```

### A `PENDING` payment, for comparison

```json
{
  "id": "a814b2c5-0ecb-47f3-950e-cb3f420e8eb6",
  "gateway": "PAYMOB", "purpose": "WALLET_TOP_UP",
  "status": "PENDING", "credited": false,
  "amount": 250.50, "currency": "EGP",
  "paymentMethod": null, "paymentMethodDetail": null, "failureReason": null,
  "checkoutUrl": "https://accept.paymob.com/unifiedcheckout/?publicKey=…&clientSecret=…",
  "createdAt": "2026-09-18T14:53:15.883463Z",
  "updatedAt": "2026-09-18T14:53:16.613072Z"
}
```

Two differences worth building around: `paymentMethod` and `paymentMethodDetail` are null until the
gateway says what was used, and **`checkoutUrl` is present only while `status` is `PENDING`**. On a
finished payment it is `null` — so "Resume payment" is a button you can render straight from the
presence of that field, with no status logic of your own.

---

## 4. `status` and `credited` are two different questions

This is the one part of the contract worth reading twice. `status` is what the *gateway* did.
`credited` is whether the *money reached the wallet*. They are tracked separately because they can
genuinely disagree.

| `status` | `credited` | What to show |
|---|---|---|
| `PENDING` | `false` | "Waiting for payment" — `checkoutUrl` is live, offer to resume |
| `COMPLETED` | `true` | Done. The balance already includes it |
| `COMPLETED` | `false` | **"Settling"** — do not show an error, and do not tell them to pay again |
| `FAILED` | `false` | Declined. `failureReason` is the gateway's own words |
| `NEEDS_REVIEW` | either | "Being reviewed by support" — neutral wording, no action offered |

**`COMPLETED` + `credited: false` is the row to get right.** It means the gateway took the money and
our side has not finished writing it to the wallet yet — normally for a second or two, occasionally
longer if something crashed at exactly the wrong moment. A background job finishes it automatically;
nobody needs to do anything. If you render that as a failure the customer pays twice.

**`NEEDS_REVIEW`** means a human is looking at it — the amount did not match, or the gateway reversed
a charge. Never tell the merchant to retry a `NEEDS_REVIEW` payment; they may have already been
charged. Neutral copy, no call to action.

`failureReason` is passed through from the gateway verbatim and is **English only**, whatever
`Accept-Language` you send. Show it as supporting detail under your own localized "Payment failed"
heading — do not make it your only message to an Arabic user.

---

## 5. Permissions

New node **`wallet:topup`**, an `ACTION` under the existing `page:wallet`, labelled in both
languages. It appears in the role editor automatically — nothing for you to hardcode.

The company **owner always passes** without any grant, as with every other tenant permission. Staff
need it explicitly. So gate the Top up button on `wallet:topup`, and the history on `wallet:read`.

---

## 6. What not to build

- **No card form.** Never collect a card number, CVV or expiry in Rawafid's UI. The whole point of
  the hosted checkout is that card data never touches our origin. If a design asks for an inline
  card form, push back.
- **No "payment succeeded" screen driven by the redirect.** See §1.
- **No polling loop that never ends.** If you poll after the redirect, cap it — a few seconds, then
  fall back to "we'll update your balance shortly" and stop. `PENDING` can legitimately last as long
  as the customer leaves the tab open.
- **No retry button on `NEEDS_REVIEW`.**
- **No top-up receipt email** is sent, by design. If you want the merchant to see confirmation, it is
  the balance on screen — which is the reason no email exists.
- **No currency switcher.** `currency` is `EGP` everywhere. Read it, don't offer it.
- **No refunds.** There is no refund endpoint and no UI for one yet.

---

## 7. Known gaps, so you don't design around problems that are ours

- **A `PENDING` payment never expires.** A customer who opens checkout and wanders off leaves a
  `PENDING` row indefinitely. It is on our side to add an expiry; meanwhile expect old `PENDING` rows
  in the history and do not treat them as errors.
- **`paymentMethodDetail` is whatever Paymob sends** — `"MasterCard"`, `"Visa"`, a wallet name. Do
  not switch on it for icons without a fallback; treat it as a label.
- **Amounts are JSON numbers with two decimals on the wire** (`100.00`, `250.50`). If your client
  parses into a float, format for display from the string or a decimal type — don't let `100.00`
  become `100` in the UI.

---

## Related drops

- [2026-09-04-wallet.md](2026-09-04-wallet.md) — the balance and ledger. Still correct, except that
  its "there is no top-up" section is now superseded by this drop.
- [2026-09-05-subscriptions.md](2026-09-05-subscriptions.md) — what *spends* the balance.
