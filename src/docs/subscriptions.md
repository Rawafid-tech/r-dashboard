# Subscriptions: buying a plan, renewing it, and telling the merchant

**Shipped:** 2026-09-05 · PRs #28, #29, #30

This replaces the three separate drops published during the day
(`subscription-checkout`, `subscription-renewal`, `subscription-notifications`) — they described one
feature arriving in three pieces, and read together they contradicted each other. This is the single
current version.

The wallet ledger (drop of 2026-09-04) now has something to spend on. A company **owner** can
subscribe to a plan out of their wallet balance, the period **renews itself** when it ends, a
balance that cannot cover the renewal buys a short **grace window** instead of an instant downgrade,
and the owner is **emailed** at each of those turns in their own language.

**Provenance of the payloads below.** All of it was captured from `https://rawafid.softizone.net`,
none written by hand. §1–§7 after PRs #28 and #29, including the whole renewal lifecycle in §6; §8
after PR #30, driven end to end on staging with the sweep on a temporarily shortened schedule and
restored afterwards. The three subscription emails were **actually dispatched** over staging's SMTP
(a Mailtrap sandbox, so nothing reached a real inbox) and every one reached `SENT`.

---

## Read this first

The five things most likely to be built wrong:

1. **There is still no top-up.** Nothing lets a merchant put money into a wallet — balance arrives
   only when a platform admin credits it. Every dead end in this document ends at *"contact
   support"*, never *"add funds"* or a payment screen.
2. **It is owner-only, and there is no permission code.** Do not look for a `subscription:manage`
   node in `GET /api/permissions` — none was seeded, deliberately. Gate on the user's **role** being
   `OWNER`. Staff holding every subscription permission still get 403.
3. **Changing plan forfeits the unused remainder.** No proration, nothing credited back. The confirm
   dialog has to say so.
4. **`graceUntil != null` is a UI state you have to build.** `status` stays `"ACTIVE"` and `planCode`
   stays the paid plan, so keying off `status` alone shows a healthy subscription to someone three
   days from losing it.
5. **`endsAt` means three different things** depending on the other two fields. See §4.2.

---

## 1. Picking a plan: there are no ids

`GET /api/public/plans` (unauthenticated) is the list to render, and it carries **no id fields at
all** — not on the plan, not on the tier:

```json
[
  {
    "code": "FREE",
    "name": "Free",
    "description": null,
    "highlighted": false,
    "customPricing": false,
    "tiers": [ { "shipmentsPerMonth": 50, "monthlyPrice": 0.0, "yearlyPrice": 0.0 } ],
    "features": []
  },
  {
    "code": "LAUNCH",
    "name": "Launch",
    "description": "For growing stores",
    "highlighted": true,
    "customPricing": false,
    "tiers": [
      { "shipmentsPerMonth": 500,  "monthlyPrice": 299.0, "yearlyPrice": 2990.0 },
      { "shipmentsPerMonth": 1000, "monthlyPrice": 399.0, "yearlyPrice": 3990.0 }
    ],
    "features": []
  },
  {
    "code": "BUSINESS",
    "name": "Business",
    "description": "Unlimited shipments",
    "highlighted": false,
    "customPricing": false,
    "tiers": [ { "shipmentsPerMonth": 999999, "monthlyPrice": 500.0, "yearlyPrice": 5000.0 } ],
    "features": [ { "label": "Shipments", "type": "UNLIMITED", "number": null, "enabled": null, "text": null } ]
  }
]
```

A plan is identified by its **`code`** and a tier by its **`shipmentsPerMonth`** — exactly what the
checkout request takes. `name` and `description` are already translated to the request's
`Accept-Language`; `code` never is, because it is the identifier, not a label.

A plan with `"customPricing": true` cannot be bought (it has no price yet, by definition). Render it
as "Contact us", not as a buy button.

---

## 2. `POST /api/subscription`

```jsonc
{
  "planCode": "LAUNCH",        // required, from the list above; matched case-insensitively
  "shipmentsPerMonth": 500,    // required, picks the tier
  "billingPeriod": "MONTHLY"   // required: MONTHLY | YEARLY
}
```

**201** with the new subscription — the same shape `GET /api/subscription` returns:

```json
{
  "id": "2bb1b1be-a20a-422c-bb72-bc4817786a02",
  "planId": "5332343f-c1b2-4c35-9be9-9f0c09154192",
  "planCode": "LAUNCH",
  "planName": "Launch",
  "shipmentsPerMonth": 500,
  "price": 299.0,
  "billingPeriod": "MONTHLY",
  "startsAt": "2026-09-05T10:55:07.643671467Z",
  "endsAt": "2026-10-05T10:55:07.643671467Z",
  "status": "ACTIVE",
  "autoRenew": true,
  "graceUntil": null
}
```

The wallet moved in the same instant — `1000.00` before, after:

```json
{ "balance": 701.00, "currency": "EGP", "updatedAt": "2026-09-04T22:23:29.735451Z" }
```

**Buying a plan turns renewal on.** `autoRenew` comes back `true`, so `endsAt` is when the wallet
gets charged again for the same `price` — *"Renews on 5 October 2026 — 299.00 EGP"* is an honest
thing to put on the billing screen.

### 2.1 `billingPeriod` is required even when it is ignored

`YEARLY` charges the tier's `yearlyPrice` and the period runs a calendar year. For the **free** plan
the field is still required by the request and then dropped: the resulting stay is open-ended.
Sending nothing is a 400, not a default.

### 2.2 The price is the tier's, and you can show it before the call

`monthlyPrice` for `MONTHLY`, `yearlyPrice` for `YEARLY`, straight off the tier in the plan list. The
confirm dialog can state the exact amount that will leave the wallet, and it will match `price` in
the response.

---

## 3. Changing plan forfeits the remainder

There is no proration and none is planned before refunds exist as a feature. Changing tier inside the
same plan is the same story — from `LAUNCH 500` a moment after paying 299 to `LAUNCH 1000`:

```json
{ "planCode": "LAUNCH", "shipmentsPerMonth": 1000, "billingPeriod": "MONTHLY" }
```

201, and the balance went `701.00 → 302.00`. The **full** 399 was charged and **nothing** was
credited back for the month just abandoned. A new period starts from now; the old stay is closed.

The confirm dialog should say this in plain words — something like *"Your current period ends now and
is not refunded. You will be charged 399.00 EGP for a new month."*

**Dropping to the free plan costs nothing.** 201, `price: 0.00`, `billingPeriod: null`,
`endsAt: null`, and the balance is untouched — the ledger gets **no row at all**, because no money
moved. Do not expect a transaction to appear.

---

## 4. The subscription object

A newly registered company, on the free plan:

```json
{
  "id": "510083ad-9a1d-4ec8-a0a7-f190368ddf24",
  "planId": "00000000-0000-0000-0000-000000000201",
  "planCode": "FREE",
  "planName": "Free",
  "shipmentsPerMonth": 50,
  "price": 0.0,
  "billingPeriod": null,
  "startsAt": "2026-09-05T10:54:38.875352Z",
  "endsAt": null,
  "status": "ACTIVE",
  "autoRenew": false,
  "graceUntil": null
}
```

| Field | Type | Meaning |
|---|---|---|
| `autoRenew` | boolean, never null | Whether this period pays for the next one when it ends. |
| `graceUntil` | timestamp or **null** | Non-null **only** while a renewal the balance could not cover is being retried. |

### 4.1 `autoRenew: false` on the free plan is not a bug

A free stay is open-ended (`endsAt: null`), so it never comes due and there is nothing to renew.
**Hide the toggle when `endsAt` is null.** The API accepts the call there and it simply does nothing.

### 4.2 `endsAt` means three different things

One field, three sentences:

| When | `endsAt` means | Sentence |
|---|---|---|
| `autoRenew: true`, `graceUntil: null` | the next charge | *Renews on {endsAt} — 299.00 EGP* |
| `autoRenew: false` | the plan stops | *Your plan ends on {endsAt}* |
| `graceUntil != null` | **already past** | *We could not renew — {graceUntil} is the deadline* |

In the third case `endsAt` is **in the past**, so a UI computing "days remaining" from it shows a
negative number. Compute from `graceUntil` instead.

---

## 5. `PATCH /api/subscription/auto-renew` — your cancel button

Owner-only, and again **no permission code** — gate on the role.

```jsonc
{ "autoRenew": false }   // required
```

**200** with the full subscription, so you can render straight from the response:

```json
{
  "id": "2bb1b1be-a20a-422c-bb72-bc4817786a02",
  "planCode": "LAUNCH",
  "shipmentsPerMonth": 500,
  "price": 299.0,
  "billingPeriod": "MONTHLY",
  "startsAt": "2026-09-05T10:55:07.643671Z",
  "endsAt": "2026-10-05T10:55:07.643671Z",
  "status": "ACTIVE",
  "autoRenew": false,
  "graceUntil": null
}
```

There is no separate cancel endpoint, and you should not build one out of the downgrade-to-FREE call:

| | Turn `autoRenew` off | Downgrade to FREE |
|---|---|---|
| When it takes effect | at `endsAt` | **immediately** |
| The rest of the paid period | kept | **forfeited, no refund** |
| Charged again | no | no |

A merchant who says "I don't want to be charged again" means the first one. The second throws away
time they have already paid for.

Word the confirmation for what it is: *"Your plan stays active until 5 October 2026, then your
account returns to the free plan. You will not be charged again."*

### 5.1 The field is required

Omitting it is a 400, not a default to `false` — deliberately, so a malformed request can never
silently cancel someone's subscription:

```json
{
  "detail": "Request validation failed",
  "instance": "/api/subscription/auto-renew",
  "status": 400,
  "title": "Validation Failed",
  "errors": [ { "name": "autoRenew", "reason": "must not be null" } ]
}
```
```json
{
  "detail": "فشل التحقق من صحة الطلب",
  "instance": "/api/subscription/auto-renew",
  "status": 400,
  "title": "فشل التحقق",
  "errors": [ { "name": "autoRenew", "reason": "لا يمكن أن يكون منعدم" } ]
}
```

### 5.2 Admin-assigned plans never renew

When a platform admin puts a company on a plan — a negotiated deal, or a comped one — the stay comes
back with `autoRenew: false`:

```json
{
  "id": "20a82e57-73a1-4e0d-9606-db95e1614aa1",
  "planCode": "LAUNCH",
  "shipmentsPerMonth": 1000,
  "price": 399.0,
  "billingPeriod": "MONTHLY",
  "startsAt": "2026-09-05T10:55:26.761940185Z",
  "endsAt": "2026-10-05T10:55:26.761940185Z",
  "status": "ACTIVE",
  "autoRenew": false,
  "graceUntil": null
}
```

That path exists to give a company a plan **without money changing hands**, so it does not arrange to
bill them a month later either. The wallet was untouched — balance stayed at `701.00`, no ledger row.
A `price` of `399.00` here is the value of the plan, not a charge that happened.

**Do not assume a paid-looking plan renews.** Read `autoRenew`. If the company wants to keep an
assigned plan, the owner turns renewal on with §5 and the wallet is charged at `endsAt` like any
other.

---

## 6. The renewal lifecycle

*All captured from staging, produced by the real sweep.*

### 6.1 A renewal that succeeded

The §5.2 company, on LAUNCH at 1000 shipments (399.00/month) with 701.00 in the wallet, renewal
switched on first. The sweep charged it and opened the next period:

```json
{
  "id": "1732e7e1-4992-4472-b07b-a4589df30a4e",
  "planCode": "LAUNCH",
  "shipmentsPerMonth": 1000,
  "price": 399.0,
  "billingPeriod": "MONTHLY",
  "startsAt": "2026-09-05T11:04:02.151556Z",
  "endsAt": "2026-10-05T11:04:02.151556Z",
  "status": "ACTIVE",
  "autoRenew": true,
  "graceUntil": null
}
```

**The `id` changed.** A period is always a new row, never an edit — so anything you cache or link by
subscription id has to be refreshed after a renewal.

The matching ledger row, balance `701.00 → 302.00`:

```json
{
  "id": "daf5279c-64ee-4f83-8ad0-0bc970e5d064",
  "type": "SUBSCRIPTION_RENEWAL",
  "direction": "DEBIT",
  "amount": 399.0,
  "balanceBefore": 701.0,
  "balanceAfter": 302.0,
  "referenceType": "subscription",
  "referenceId": "1732e7e1-4992-4472-b07b-a4589df30a4e",
  "note": null,
  "createdAt": "2026-09-05T11:06:00.783031Z"
}
```

- `referenceId` is the **new** period's id, not the old one.
- `note` is null and always will be on a renewal — no human typed anything.
- **The new period starts where the old one ended.** `startsAt` is exactly the previous period's
  `endsAt`, not the moment the job ran, so a merchant's billing date never drifts.

### 6.2 A renewal the balance could not cover

Same company one period later, 302.00 against a 399.00 price. **Nothing was charged and no ledger row
was written:**

```json
{
  "id": "1732e7e1-4992-4472-b07b-a4589df30a4e",
  "planCode": "LAUNCH",
  "price": 399.0,
  "billingPeriod": "MONTHLY",
  "startsAt": "2026-09-05T11:04:02.151556Z",
  "endsAt": "2026-09-05T11:05:38.033947Z",
  "status": "ACTIVE",
  "autoRenew": true,
  "graceUntil": "2026-09-08T11:07:00.000744Z"
}
```

- `status` is **`"ACTIVE"`** and `planCode` is still their **paid plan**. They keep every entitlement.
- `endsAt` is in the **past**.
- `graceUntil` is the real deadline — **3 days** here, but backend-configurable, so read the field
  rather than adding three days yourself.

**The deadline never moves.** It is set once, on the first failure. Two further sweeps left it
byte-identical and charged nothing.

**It retries by itself.** Crediting the wallet mid-window was enough: the next sweep renewed the
company with no further action — balance `502.00 → 103.00`, `graceUntil` back to `null`, and the new
period again starting exactly where the graced one ended. A merchant who spends days in grace pays
for those days rather than losing them.

Do not build a "retry now" button: there is no endpoint for it, and re-sending `POST
/api/subscription` for the same plan returns **409 `alreadyOnThisPlan`**.

### 6.3 When the window closes

The company drops to the free plan, and **nothing is ever charged** — the balance was still 103.00
afterwards:

```json
{
  "id": "e8bebb10-1673-46ca-a12f-df4f2d2de5d7",
  "planCode": "FREE",
  "planName": "Free",
  "shipmentsPerMonth": 50,
  "price": 0.0,
  "billingPeriod": null,
  "startsAt": "2026-09-05T11:14:00.082491Z",
  "endsAt": null,
  "status": "ACTIVE",
  "autoRenew": false,
  "graceUntil": null
}
```

---

## 7. Errors

All RFC 9457 problem details. `detail` is localized by `Accept-Language`; key off status, not text.

### 7.1 Already on this plan — 409

```json
{ "detail": "The company is already on this plan", "instance": "/api/subscription", "status": 409, "title": "Conflict" }
```
```json
{ "detail": "الشركة مشتركة في هذه الباقة بالفعل", "instance": "/api/subscription", "status": 409, "title": "Conflict" }
```

This exists because a double-clicked Subscribe would otherwise cost a **second full period** with no
refund. Belt and braces on your side: disable the button for the plan+tier+period the company is
currently on, and disable it while the request is in flight.

"Same deal" means plan **and** tier **and** billing period. `LAUNCH 500 MONTHLY` → `LAUNCH 500
YEARLY` is a real change and goes through.

### 7.2 Another change was in progress — 409

```json
{ "detail": "Another change to this subscription was in progress; please try again", "status": 409, "title": "Conflict" }
```

Two requests for the same company overlapped and this one lost. **Nothing was charged.** The one
error worth a literal "Try again" button — retrying either succeeds or lands on 7.1, both correct.

### 7.3 Not enough balance — 409

```json
{ "detail": "Insufficient wallet balance", "instance": "/api/subscription", "status": 409, "title": "Conflict" }
```
```json
{ "detail": "رصيد المحفظة غير كافٍ", "instance": "/api/subscription", "status": 409, "title": "Conflict" }
```

**The plan did not change and the balance did not move** — not even `updatedAt`. You can pre-empt
this by comparing `GET /api/wallet`'s `balance` against the tier price and disabling the button, but
still handle the 409: the balance can change between the two calls.

### 7.4 The rest

| Status | `detail` | When |
|---|---|---|
| 404 | `Plan not found` | no plan carries that `planCode` |
| 400 | `The plan has no tier with this shipment volume` | the plan exists, that tier does not |
| 400 | `This plan cannot be assigned` | archived, or `customPricing: true` |
| 400 | `Request validation failed` + `errors[]` | a missing or malformed field |
| 403 | — | the caller is not the company owner |

---

## 8. The emails, and the language they arrive in

The nightly sweep emails the **company owner** three times over the renewal arc. Owner only:
subscribing, changing plan and toggling renewal are all owner-only with no permission node, so
nobody else could act on any of them.

| When | Subject (EN) |
|---|---|
| ~3 days before a renewal the wallet will not cover | *Your {plan} subscription renews on {date}* |
| the renewal failed and the grace window opened | *We could not renew your {plan} subscription* |
| the plan ended — window ran out, **or** the owner cancelled | *Your {plan} subscription has ended* |

Each is sent **once**. The retry that happens every night inside the grace window is silent, and a
merchant who tops up mid-window is renewed with no further mail. There is **no receipt** on the happy
path.

```
Subject: We could not renew your Staging Growth subscription

We could not renew your Staging Growth subscription. The renewal costs 150.00 EGP
and we were unable to take it from your Rawafid wallet.

Your plan stays active until September 8, 2026, and we will try again each day
until then. If the renewal has not gone through by that date, your account moves
to the Free plan.

To add balance to your wallet, contact Rawafid support.
```

The same lifecycle for an owner on `"language": "AR"`, plan name included — it comes from the plan's
own `name` map, so the Arabic mail names the Arabic plan:

```
Subject: انتهى اشتراكك في باقة النمو

انتهى اشتراكك في باقة النمو وأصبح حسابك على الباقة المجانية.

للاشتراك من جديد، افتح صفحة الفوترة في روافد أو تواصل مع دعم روافد.
```

**Two things the copy deliberately does not say.** It never names a cause for the failure — a grace
window opens after *any* failed renewal, not only an insufficient balance, so if your UI adds its own
explanation, match that restraint. And the "ended" mail is neutral about blame, because the same
message covers a window that ran out and an owner who cancelled on purpose.

### 8.1 The `language` setting

`GET`/`PUT /api/auth/me/settings` gained a `language` field (`"EN"` | `"AR"`). It is always present
on the response and never null; users who saved settings before today read back as `"EN"`.

```json
{
  "theme": "SYSTEM",
  "fontScale": 100,
  "defaultHomePage": "home",
  "timezone": "Africa/Cairo",
  "dateFormat": "DD_MM_YYYY",
  "language": "EN",
  "mapLat": null,
  "mapLng": null,
  "country": "EG",
  "currency": "EGP"
}
```

Anything but `EN`/`AR` is a 400:

```json
{
  "detail": "Request body could not be parsed",
  "instance": "/api/auth/me/settings",
  "status": 400,
  "title": "Malformed Request",
  "errors": [ { "name": "language", "reason": "must be one of: EN, AR" } ]
}
```

**`language` is not `Accept-Language`.** Keep them separate:

| | Controls | Lives |
|---|---|---|
| `Accept-Language` header | the language of **this response** — validation messages, error `detail`, localized plan names | per request, nothing stored |
| `language` setting | the language of **email sent later**, with no request in sight | `user_settings` |

A merchant browsing in English who wants Arabic mail is a legitimate combination. Do not sync one
from the other silently.

### 8.2 Omitting `language` keeps what is stored — it does not reset it

`PUT` is a full replace and every other field on it is required. `language` is the exception, and
absent means **"leave it alone"**, not "set it to English". Captured in sequence from one user:

```jsonc
// 1. Your existing payload, verbatim, with no language key
PUT { "theme": "SYSTEM", "fontScale": 100, "defaultHomePage": "home",
      "timezone": "Africa/Cairo", "dateFormat": "DD_MM_YYYY" }
// -> 200, "language": "EN"

// 2. The merchant picks Arabic
PUT { ...same fields..., "language": "AR" }
// -> 200, "language": "AR"

// 3. Your old screen saves an unrelated change -- still no language key
PUT { "theme": "DARK", ...same fields... }
// -> 200, "theme": "DARK", "language": "AR"   <-- kept, not reset
```

Step 3 is the point. If omission defaulted to `EN`, changing the theme from an older build would
silently switch a merchant's mail back to English, with a 200 and nothing to indicate it.

**So you can ship the read side first and the write side later, in any order, with no migration
window.** Once you *do* send the field, send the real current value — not a hardcoded `"EN"` — or you
reintroduce the exact problem this avoids.

---

## 9. Screens

- **Plans page** — `GET /api/public/plans`, current deal from `GET /api/subscription`, balance from
  `GET /api/wallet`. Mark the current plan+tier+period; the buy button is owner-only.
- **Confirm dialog** — name the exact amount, say the remainder is forfeited, show balance before and
  after.
- **Billing page** — `autoRenew` as a toggle (hidden when `endsAt` is null); a warning state driven
  by `graceUntil != null`; `endsAt` rendered per the three cases in §4.2. The warning can now say the
  owner has been emailed — but note it goes to the **owner**, so an agent seeing the banner may have
  received nothing.
- **Cancel flow** — the `PATCH` in §5, not the downgrade-to-FREE call.
- **Settings** — a two-option language select. Label it as the language for *emails and
  notifications*, not "app language"; it does not change the UI.
- **Transaction history** — `SUBSCRIPTION_NEW` and `SUBSCRIPTION_RENEWAL`, both filterable via
  `?type=`. `amount` is always positive; the sign comes from `direction`.

---

## 10. Still not built

- **Top-up.** Nothing puts money in a wallet but a platform admin. This is why every message in this
  document ends at "contact support".
- **A receipt for a successful renewal.** The only one of the four mails that would fire monthly for
  every paying company, so it was deliberately dropped.
- **SMS, in-app or push notifications**, a notification centre, read/unread state, or any endpoint
  listing what was sent.
- **Notifying anyone but the owner.**
- **Forcing a renewal on demand.** No endpoint; the nightly sweep is the only trigger.
- **Proration, refunds, invoices.**
