# 2026-08-05 — المستخدمون (Users), invitations, and roles that finally bite

**Status: live on staging.** Base URL `https://rawafid.softizone.net`.

Three things land together, and they are the same thing seen from three angles:

1. The **المستخدمون** screen — an owner adds colleagues, edits them, and assigns them a role.
2. **A new public page you have to build**: `/accept-invite`, where an invited person chooses their
   password. Nothing else in the product has needed a page for someone with no session.
3. **Roles now restrict people.** The 2nd's drop told you a role changes nobody's access. That is no
   longer true. Tenant endpoints check permission codes as of this deploy.

> ### Breaking, from the drop you already have
>
> **`role:manage` no longer exists.** It is deleted from the catalog, and any role that had it ticked
> silently lost it. If you stored the code or special-cased it, remove that.
>
> Editing roles is now **owner-only with no code at all** — there is nothing to grant. Reading them is
> `role:read`. The reasoning: a delegate who could edit a role could add a permission they don't hold
> and then assign it, so the capability isn't delegable, and a checkbox that grants nothing is worse
> than an absent one. Expect exactly **three PAGE roots** from `GET /api/permissions` now:
> `page:users`, `page:roles`, `page:subscription`.

---

## 1. The page you have to build: `/accept-invite`

When an owner invites someone, they get an email with a link:

```
https://<your app>/accept-invite?u=<userId>&t=<token>
```

`u` is a UUID, `t` is a 43-character url-safe base64 token. Both are already URL-safe — don't
re-encode them. **This route must render with no session**: the person has no password yet, so they
cannot log in, and they will land here straight from their inbox.

Read both params, ask for a password, and post:

```
POST /api/auth/invitation/accept        (no Authorization header)

{ "userId": "<u>", "token": "<t>", "newPassword": "chosen-password" }
```

`200` → **the standard token pair** (`accessToken`, `tokenType`, `expiresIn`, `refreshToken`). Store
them exactly as after a login and drop the person into the app — they are signed in. Making them
retype credentials here is pure friction; the link already proved they hold it.

- The password rule is the same as everywhere: **8–100 characters**.
- `400` covers wrong token, expired token, already-used token, **and an unknown `userId`** — all the
  same answer, deliberately, so this endpoint can't be used to discover whether an account exists.
  Show one message: "This invitation link is no longer valid — ask your administrator to resend it."
- `409` `auth.accountAlreadyActivated` means this person already has a password. Send them to the
  login screen, and offer forgot-password.
- `403` `auth.accountSuspended` means the account was switched off after the invite went out.
- The endpoint is **rate limited** like the other public credential endpoints — handle `429`.

**Links expire after 7 days.** Both the mail copy and this document say 7; don't hardcode it in the UI
beyond what the email already says.

---

## 2. Trying to log in before accepting

A person who has been invited but never accepted has no password, so `POST /api/auth/login` answers:

```
403  auth.accountNotActivated
"This account has not been activated yet — use the invitation link that was emailed to you"
```

This is **not** `401 auth.invalidCredentials`, and the distinction matters for your copy: don't send
them hunting for a typo. Offer "resend invitation" wording pointing at their administrator.

---

## 3. The roster

```
GET /api/users?search=&page=0&size=20&sort=CREATED_AT&direction=DESC
```

Standard paged envelope (`content`, `page`, `size`, `totalElements`, `totalPages`), same as roles.

- `search` matches a fragment of the full name **or** the email, case-insensitive.
- `sort` ∈ `CREATED_AT` | `NAME` | `EMAIL`. Anything else is a `400`.
- `direction` ∈ `ASC` | `DESC`. `size` is clamped to **100**.
- Requires **`user:read`**.

Each row — and every single-user response in this document — is:

```json
{
  "id": "7b1de3a0-4b7e-4f7a-9c1e-2f8d1a6b3c4d",
  "firstName": "Mona",
  "lastName": "Kamal",
  "fullName": "Mona Kamal",
  "avatarUrl": "/api/public/media/1f2e...",
  "dateOfBirth": "1994-03-11",
  "email": "mona@store.com",
  "emailVerified": true,
  "phone": "+201234567890",
  "phoneVerified": false,
  "verified": false,
  "roleId": "3b9a...",
  "roleName": "Warehouse",
  "owner": false,
  "status": "ACTIVE",
  "createdAt": "2026-08-05T15:14:59.889902Z"
}
```

That `createdAt` is copied verbatim from a live staging response — note the **microsecond precision**. `new Date(...)` and `Temporal` both handle it; a hand-rolled or strict parser expecting whole seconds will not. `avatarUrl` and `dateOfBirth` are genuinely `null` for most rows.

Three fields need explaining.

**`status` is `INVITED` | `ACTIVE` | `SUSPENDED`** — this is your الحالة column. `INVITED` means the
person has never set a password; it is *derived*, not stored, and it wins the display over the other
two. Once they accept, the same account becomes `ACTIVE` (or `SUSPENDED` if an owner switched it off).
So "invited" and "suspended" are independent facts, and an invited person **can** be suspended — you
just won't see it until they accept.

**`owner` is true for exactly one account per company** — the person who registered. Hide or disable
every row action for them: edit, role, activate, deactivate, delete all answer `409`
`auth.ownerNotModifiable`. There is no API to create a second owner or to transfer it, so this is not
a permission thing you can grant your way around. The owner edits themselves through
`/api/auth/me`.

**`roleName` is the authored name** ("Warehouse"), not the coarse `OWNER`/`AGENT` claim. Someone on no
real role shows `Agent`, the built-in that grants nothing.

`GET /api/users/{userId}` returns the same object. Another company's id is a plain `404`, identical
to an id that doesn't exist.

---

## 4. Inviting

```
POST /api/users                                   → 201, the object above
{
  "firstName": "Mona",
  "lastName": "Kamal",
  "email": "mona@store.com",
  "phone": "+201234567890",
  "roleId": "3b9a..."          // optional
}
```

Requires **`user:manage`**. Creates the account **with no password** and mails the link, so the
response comes back `status: "INVITED"`.

- Omit `roleId` (or send `null`) to start them on the built-in **AGENT** role, which grants nothing.
- `phone` is the same pattern as registration: `^\+?[0-9]{8,15}$`.
- `409` `auth.emailAlreadyUsed` — the address is the login identifier and is unique across the
  **whole platform**, case-insensitively. Another company having it still collides.
- `429` `auth.inviteQuotaExceeded` — **20 new accounts per company per day**. Rolling 24-hour window,
  counted from account creation. Surface it as a real limit, not a retry.

### Resending

```
POST /api/users/{userId}/invite/resend            → 204
```

Requires `user:manage`. Mails a **fresh** link, which **invalidates the previous one** — say so in
your confirmation copy, because a person holding the old email will find it stops working.

`429` `auth.verificationResendTooSoon` while the last send is inside its 60-second cooldown. Disable
the button for a minute after a successful send.

> **A `201` means the account was created, not that the email arrived.** Delivery is queued and happens
> after the response, deliberately — an unreachable mail server must not fail the request that created
> the person. But there is no retry yet, and nothing reports a failed send back to you: the row simply
> stays `INVITED`, which looks identical whether the mail was delivered or died at the provider.
>
> Two consequences for your copy. Say "invitation created — we've sent them a link" rather than
> promising delivery. And **keep إعادة إرسال الدعوة visible on every `INVITED` row**, not hidden behind
> an overflow menu: it is the only recovery path, and the recipient cannot ask for it themselves
> because they don't know the account exists. Revealing the link is the fallback when mail is the
> problem.

This also works on someone who has already activated, where it amounts to "send them a set-password
link" — the link goes to their own mailbox, so it is safe. Label it accordingly if you expose it for
active users.

---

## 5. The two dangerous actions

Both of these leave the caller able to sign in **as** that person. Each has its own permission code,
each is logged server-side, and neither should be a bare item in a `…` menu — put a confirmation in
front of them that says what they do.

### Reveal the link

```
POST /api/users/{userId}/invite/link              → 200
{ "link": "https://app.../accept-invite?u=...&t=..." }
```

Requires **`user:invite:reveal`**. For when email isn't reaching someone: you get the raw link to
pass on out of band.

- **Only for `INVITED` accounts.** `409` `auth.accountAlreadyActivated` otherwise — you cannot use
  this to reset an active colleague's password.
- **Issuing it invalidates any link already emailed.** Warn before, not after.
- A link delivered this way **does not** mark their email verified (see §7).
- Treat the string as a credential: don't log it, don't put it in analytics, and prefer copy-to-
  clipboard over rendering it in a screenshot-able panel.

### Set their password outright

```
PUT /api/users/{userId}/password                  → 200, the user object
{ "newPassword": "chosen-password" }
```

Requires **`user:password:set`**. For staff who can't receive mail at all. 8–100 characters. Ends all
their current sessions. `409` for the owner.

---

## 6. Editing, roles, activation, deletion

```
PUT /api/users/{userId}                           → 200
{ "firstName": "Mona", "lastName": "Kamal", "phone": "+201234567890", "dateOfBirth": "1994-03-11" }
```

Requires `user:manage`. `dateOfBirth` is optional/nullable.

**There is no `email` field, and sending one changes nothing.** Not an oversight: password reset
resolves an account by address alone, so anyone able to repoint a colleague's email could point the
owner's row at their own address and take the company over with a forgotten-password request.
Changing a staff email needs its own verified flow, which doesn't exist yet — so don't build the input.

Changing the phone silently clears `phoneVerified`.

```
PUT /api/users/{userId}/role                      → 200
{ "roleId": "3b9a..." }        // null / omitted → back to the built-in AGENT
```

Requires `user:manage`. **This ends that person's sessions** — permissions travel inside the access
token, so they must sign in again before the change takes effect for them. If an owner changes their
*own* role there is nothing to do here (they can't; see `owner`), but when an admin changes someone
else's, expect that person to be logged out.

Three refusals to handle:

- `400` `auth.roleNotAssignable` — the role belongs to another company, is a platform role, or is the
  built-in **OWNER** role. Only your own company's roles and `AGENT` are assignable. Just don't offer
  the others: `GET /api/roles` already returns exactly the assignable set.
- `403` `auth.cannotGrantBeyondOwnPermissions` — **you** don't hold everything the target role grants.
  Owners are exempt. Message it as "you can't give someone access you don't have yourself", not as a
  generic permission error.
- `409` `auth.ownerNotModifiable`.

```
POST /api/users/{userId}/activate                 → 200
POST /api/users/{userId}/deactivate               → 200
```

Requires `user:manage`. Deactivating blocks sign-in and ends every session, though an access token
already issued stays valid until it expires (at most `expiresIn` seconds). `409` for the owner.

```
DELETE /api/users/{userId}                        → 204
```

Requires `user:manage`. **Permanent**, and it frees the email address for reuse. Two `409`s:
`auth.cannotDeleteSelf` and `auth.ownerNotModifiable`. Put a typed confirmation in front of it.

---

## 7. The verified badge, and why revealing withholds it

`emailVerified` becomes `true` when someone accepts an invitation **that was emailed to them** —
following a link out of their own inbox proves they read that address, which is the same thing the
six-digit verification flow proves.

Accepting a link an owner **revealed** leaves `emailVerified` false. The owner could have walked that
link themselves, so it proves nothing about the address. Those people still need the ordinary email
verification flow. Don't paper over the difference in the UI — the badge is supposed to mean
something.

`verified` (the "Verified User" badge) stays `emailVerified && phoneVerified`, unchanged.

---

## 8. The permission codes, and what now 403s

New tenant nodes in `GET /api/permissions`:

| PAGE | ACTION | gates |
|---|---|---|
| `page:users` | `user:read` | the roster and single-user reads |
| `page:users` | `user:manage` | invite, edit, role, activate/deactivate, delete, resend |
| `page:users` | `user:invite:reveal` | revealing a link |
| `page:users` | `user:password:set` | setting someone's password |
| `page:subscription` | `subscription:read` | `GET /api/subscription` |
| `page:roles` | `role:read` | `GET /api/roles`, `GET /api/permissions` |

**The owner always passes every one of these**, and holds no permission rows at all — don't try to
compute an owner's capabilities from their granted permissions, because the set is empty. Branch on
the coarse role for owners and on codes for everyone else.

### What changed for non-owners

| endpoint | before | now |
|---|---|---|
| `GET /api/roles`, `/api/roles/{id}` | owner only | `role:read` |
| `GET /api/permissions` | owner only | `role:read` |
| `GET /api/subscription` | any tenant user | **`subscription:read`** |
| `POST/PUT/DELETE /api/roles` | owner only | owner only, unchanged |
| `PUT /api/company`, `PUT/DELETE /api/company/logo` | owner only | owner only, unchanged |

`GET /api/subscription` is the one **reduction**: a staff member who could see the billing page
before will now get `403` unless granted `subscription:read`. Every existing account is an owner
today, so nothing breaks on this deploy — but budget for it in your menu logic.

**Deliberately still open to every signed-in tenant user:** `GET /api/company` (the app header needs
the name and logo, and 403ing someone on their own company would be absurd), all of
`/api/auth/me/**`, and `/api/media` uploads — every user needs to set their own avatar.

### Editing a role logs out everyone who holds it

Saving `PUT /api/roles/{id}` revokes the refresh tokens of every user on that role, so they
re-authenticate and pick up the new permission set. Their next `refresh` returns `401`. Your existing
"401 → try refresh → else login screen" path already handles it; just don't be surprised by reports of
users being logged out after an admin edits a role.

### The one closure gotcha

Ticking `user:manage` does **not** imply `user:read`. Selecting an ACTION auto-includes its parent
PAGE and nothing else — never a sibling action. A role with only `user:manage` can invite people it
cannot then list, which looks like a bug. In the roles modal, either tick `user:read` alongside any
other user action, or warn.

---

## 9. Error summary

Everything is RFC 9457 problem+json with a localized `detail`, as before.

| status | code | when |
|---|---|---|
| 400 | `auth.invalidVerificationCode` | accept: bad, expired, spent token, or unknown `userId` |
| 400 | `auth.roleNotAssignable` | assigning OWNER, a platform role, or another company's role |
| 403 | `auth.accountNotActivated` | login before accepting the invitation |
| 403 | `auth.accountSuspended` | accepting for a switched-off account |
| 403 | `auth.cannotGrantBeyondOwnPermissions` | assigning a role richer than your own |
| 409 | `auth.emailAlreadyUsed` | inviting an address that exists anywhere |
| 409 | `auth.accountAlreadyActivated` | revealing/accepting for someone who has a password |
| 409 | `auth.ownerNotModifiable` | any write against the owner's row |
| 409 | `auth.cannotDeleteSelf` | deleting your own account |
| 429 | `auth.inviteQuotaExceeded` | 20 new accounts for this company in 24h |
| 429 | `auth.verificationResendTooSoon` | resend inside the 60s cooldown |
| 404 | `auth.userNotFound` | unknown id, **and** another company's id |

Arabic is available for every one of these — send `Accept-Language: ar`. The new permission labels are
translated too (`المستخدمون`, `عرض المستخدمين`, `إدارة المستخدمين`, `إظهار روابط الدعوة`,
`تعيين كلمة مرور مستخدم آخر`, `الاشتراك`, `عرض الاشتراك`).

---

## 10. Suggested screen

A single table under الإدارة → المستخدمون:

- Columns: الاسم (with avatar), البريد الإلكتروني (+ verified tick), الهاتف, الدور (`roleName`),
  الحالة (`status` badge — three colours), تاريخ الإضافة.
- Primary action **إضافة مستخدم** → the invite form. On success, tell them an email went out.
- Row menu, filtered by the codes the signed-in user holds:
  تعديل · تغيير الدور · تعطيل/تنشيط · إعادة إرسال الدعوة · **إظهار رابط الدعوة** ·
  **تعيين كلمة المرور** · حذف.
- Rows where `owner` is true: no menu at all.
- The row for the signed-in user: no حذف.
- `status: INVITED` rows are the only ones where the two invitation actions make sense — hide them
  elsewhere, or you will be showing buttons that 409.

---

## 11. Not built yet — keep designing around these

- **No per-user permission overrides.** One role is one permission set; there is no "except this
  person can also…". Don't design a per-user checkbox grid.
- **No email change**, for yourself or anyone else. It needs a verified flow that doesn't exist.
- **No second owner, no ownership transfer.**
- **No soft delete and no audit trail** — deletion is permanent and nothing records who did what.
  `user:invite:reveal` and `user:password:set` are logged to the server log only, not queryable.
- **No bulk actions**, no CSV import/export.
- **No `job title` field** and no user code/reference number. If your design has them, they have
  nowhere to be stored.
