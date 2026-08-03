# 2026-08-01 — Email verification & forgot/reset password

New in this drop: the two self-serve code flows that §9 of the guide listed as "not built yet".
Both mail a **6-digit code** and both are now live.

> **Status: live on staging** (`https://rawafid.softizone.net`) as of today — merged via PR #15 and
> smoke-verified end-to-end against staging itself: registration mails a code, the code verifies the
> address, forgot/reset replaces the password and revokes the old sessions, and an unknown address
> is mailed nothing. Staging sends real email through a **Mailtrap sandbox inbox**, so codes land
> there and never reach a real mailbox — test with any address you like.
>
> One staging-only caveat: the Mailtrap free tier throttles bursts (`550 5.7.0 Too many emails per
> second`). A burst of test signups can leave some mails `FAILED` and undelivered. That is the
> sandbox plan, not the API — a resend a few seconds later goes through.

**The one rule to internalize: nothing is gated on verification.** An unverified user logs in and
uses the whole product exactly as before — `emailVerified` stays *informational*. Do not build a
wall, a forced interstitial, or a redirect that traps an unverified user. A nudge banner with a
"verify now" link is the intended UI. (This is deliberate: a mail-delivery problem must never be
able to lock a merchant out of an account they are paying for.)

---

## 1. Behaviour change to an existing endpoint

`POST /api/auth/register` **now sends a verification code automatically.** Same request, same
`201` response — but a code is on its way to the new address before you get the response back.

The registration response is still a user object (no tokens), so the sequence is:

```
register → 201 (code sent)  →  login → tokens  →  verify with the code
```

The verify endpoint needs a bearer token, so **the code cannot be spent before logging in.** If
your signup screen goes straight to a "enter the code we emailed you" step, log the user in first
(you already have their password at that point).

## 2. Confirm my email address

```
POST /api/auth/email/verify
Authorization: Bearer <merchant token>
Content-Type: application/json

{ "code": "482913" }
```

`200` → the **full user object** (identical shape to `GET /api/auth/me`), now with
`"emailVerified": true`. Use the response directly to refresh your cached user; no extra `me` call
needed.

- **Idempotent**: an already-verified user gets `200` without the code being checked, so a
  double-submitted form is not an error you have to explain.
- …but the body still has to be **well-formed**: `code` must be exactly 6 digits even in that
  idempotent case, or you get a validation `400` before the service is reached. Don't send `""`
  or omit the field.

## 3. Resend my verification code

```
POST /api/auth/email/verify/resend
Authorization: Bearer <merchant token>
```

`204`. Issues a fresh code and **invalidates the previous one** — if the user has two emails open,
only the newest code works. A no-op `204` for an address that is already verified.

**Two different `429`s can come back here, and they mean different things.** Branch on `detail`,
not on the status:

| `detail` (en) | Meaning | What to show |
|---|---|---|
| A code was just sent — please wait before requesting another | Per-user cooldown, ~60s from the last send | Disable the button and count down |
| Too many requests, please try again later | Per-IP rate limit (20/min/endpoint) | Generic "try again later" |

## 4. Forgot password — request a code

```
POST /api/auth/password/forgot          ← no auth
Content-Type: application/json

{ "email": "merchant@example.com" }
```

**Always `202`, with an empty body.** Registered, suspended, unknown, or inside the resend
cooldown — the answer is identical every time, on purpose: anything else would turn this into an
"is this email registered?" oracle. So **never** render "no account with that email" here. The
only correct copy is along the lines of *"If that address has an account, we've sent a code."*

## 5. Forgot password — set the new password

```
POST /api/auth/password/reset           ← no auth
Content-Type: application/json

{
  "email": "merchant@example.com",
  "code": "482913",
  "newPassword": "at-least-8-chars"
}
```

`204`, empty body. Then:

- **Every session is revoked.** All refresh tokens for that user are deleted, so any other device
  is logged out. The caller has no token either — send them to the login screen with the new
  password.
- The code is single-use; replaying the same request gets `400`.
- `newPassword`: 8–100 characters, same rule as registration.
- An **unknown email fails exactly like a wrong code** (`400`, same message). Don't try to
  distinguish them.

## 6. Errors

Standard RFC 9457 problem details, `detail` localized by `Accept-Language` as everywhere else.
Both flows deliberately collapse several causes into **one** message:

| Status | Code | When | en `detail` | ar `detail` |
|---|---|---|---|---|
| `400` | `auth.invalidVerificationCode` | wrong code, expired code, no code outstanding, or attempts exhausted | The code is invalid or has expired — request a new one | الرمز غير صحيح أو انتهت صلاحيته — اطلب رمزًا جديدًا |
| `429` | `auth.verificationResendTooSoon` | resend inside the cooldown | A code was just sent — please wait before requesting another | تم إرسال رمز للتو — يرجى الانتظار قبل طلب رمز آخر |

You cannot tell *which* of the four `400` causes happened, and that is intentional — telling them
apart would leak which codes and addresses exist. The remedy is the same in every case: **offer a
"send me a new code" action.**

Validation `400`s (`code` not 6 digits, malformed `email`, short `newPassword`) carry the usual
`errors` array, so form-field highlighting works as it does elsewhere.

## 7. Code rules worth mirroring in the UI

| | |
|---|---|
| Format | exactly 6 digits, numeric — leading zeros are real, keep it a **string** |
| Lifetime | 10 minutes |
| Resend cooldown | 60 seconds from the last send |
| Wrong guesses | 5, then the code stops working entirely |
| Live codes | one per flow — a new code kills the old one; verification and reset codes are independent |

Two consequences that bite if you don't plan for them:

1. **A code from one flow will not work in the other.** A verification code submitted to
   `/password/reset` is rejected, and vice versa.
2. **After 5 wrong guesses the user may have to wait before resending.** The cooldown runs from
   when the code was *issued*, so a user who burns 5 guesses in 20 seconds must wait the remaining
   ~40 seconds before a resend is accepted. Show the countdown rather than a bare `429`.

Input UX: use `inputmode="numeric"` / `autocomplete="one-time-code"`, accept a pasted code with
spaces by stripping them client-side, and don't auto-submit until 6 digits are present.

## 8. Email language

The email is rendered in the language of the **request that triggered it**, from `Accept-Language`
(`ar` → Arabic, RTL; anything else → English). So the header you already send on every call
controls the email too — including on `register` and `password/forgot`, which run before there is
any session or saved preference. If your signup form has a language switcher, make sure the header
follows it.

## 9. Rate limiting — updated list

Add the four new paths to what you treat as rate-limited (20 requests/minute per IP per endpoint):

```
/api/auth/email/verify          /api/auth/password/forgot
/api/auth/email/verify/resend   /api/auth/password/reset
```

Joining the existing `register`, `login`, `refresh`, `me/password` and the admin `login`/`refresh`.

## 10. Suggested flows

**Verify email (nudge, not a gate)**

1. Show a dismissible banner wherever `emailVerified === false`.
2. "Verify now" → code screen → `POST /api/auth/email/verify` → replace your cached user with the
   response.
3. "Didn't get it?" → `POST /api/auth/email/verify/resend`, then disable for 60s.
4. On `400`, keep the field populated, show `detail`, and surface the resend action.

**Forgot password**

1. Email screen → `POST /api/auth/password/forgot` → always advance to the code screen, whatever
   the address was.
2. Code + new password → `POST /api/auth/password/reset` → `204`.
3. Send them to login with a success message. Do **not** try to keep them signed in — every
   session was just revoked by design.

## 11. Guide §9 corrections

These entries can come off the "not built yet" list:

- ~~Email **self-serve verification**~~ — shipped (§2, §3). Note `phoneVerified` is still
  admin-only; there is no SMS OTP flow.
- ~~Password reset ("forgot password")~~ — shipped (§4, §5).

Still not built, so keep designing around them:

- **Email change** — changing the login address still has no endpoint.
- **Phone/SMS verification** — `phoneVerified` remains admin-attested only.
- **Delivery retry** — a mail that fails at the provider is recorded and *not* retried
  automatically. If a user swears no email arrived, the resend action is the fix.
