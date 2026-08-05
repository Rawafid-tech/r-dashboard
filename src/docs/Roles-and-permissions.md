# 2026-08-02 — Roles & the permission catalog

> **Corrected 2026-08-04 — re-read this, it replaces the version you got on the 2nd.** The feature is
> the same feature, but it was renamed before anyone built against it: what was called a **role
> template** is now simply a **role**. That changes the URL, three permission codes and four error
> codes. Everything structural — the tree, the closure rule, the paged envelope — is unchanged. If you
> already started, the diff is at the [bottom](#what-changed-since-the-2nd).
>
> **Status: live on staging as of 2026-08-05 with the naming in this document.** Point at
> `https://rawafid.softizone.net`; `/api/role-templates` no longer exists.

New in this drop: the **الأدوار (Roles)** screen under الإدارة. An owner defines named bundles of
permissions by ticking boxes in a tree of capabilities. Two endpoints: the catalog you render the tree
from, and CRUD over the roles themselves.

**The one rule to internalize: a role does not do anything yet.** There is no way to assign one to a
user, so creating a role changes nobody's access, and `userCount` is `0` on every row until the next
drop. Build the screen — it is real and it persists — but do **not** ship copy promising that a role
restricts anyone, and do not build the "apply role to a user" action yet. Tenant endpoints are still
gated on the coarse role (`OWNER` vs `AGENT`) exactly as before.

Second rule, smaller but it will bite: **only owners can reach either endpoint.** An `AGENT` token
gets `403` on both, including the read-only catalog. Hide the whole menu entry for non-owners rather
than letting them click into a 403.

Third: **a user holds exactly one role.** There is no separate "user type" axis beside it — the role
*is* the type. If you have a design showing نوع المستخدم and اسم نموذج الدور as two columns, that is one
column here. Every new staff member starts on the built-in `AGENT` role, which grants nothing; giving
them one of these roles *replaces* that rather than adding to it, and un-assigning puts them back on
`AGENT`.

---

## 1. The permission catalog

```
GET /api/permissions
Authorization: Bearer <owner token>
```

`200` → an **array of root nodes**, each nesting its own `children`. This is the real response today:

```json
[
  {
    "id": "9e2a7b89-5d56-4cad-a392-eda1dc35b1c5",
    "code": "page:roles",
    "kind": "PAGE",
    "label": "Roles",
    "children": [
      { "id": "68f75acc-8363-48e7-ba2d-eb1b5bea69ef", "code": "role:read",   "kind": "ACTION",
        "label": "View roles",   "children": [] },
      { "id": "de81bf03-1bc4-4066-bddc-a5a429155cbe", "code": "role:manage", "kind": "ACTION",
        "label": "Manage roles", "children": [] }
    ]
  }
]
```

| Field | Notes |
|---|---|
| `id` | What you send back in `permissionIds`. **Not stable across environments** — see §6 |
| `code` | Stable identifier. `page:*` for screens, `module:resource:action` for capabilities |
| `kind` | `PAGE` or `ACTION` — this is the نوع المعاملة chip (الصفحة / الإجراء) |
| `label` | Already localized from `Accept-Language`. Render it as-is; don't build your own map |
| `children` | Arbitrary depth. Recurse — do not assume two levels |

Order is meaningful: nodes come back in the order they should be displayed, so render them in array
order rather than sorting.

**The catalog is deliberately small right now — one page and two actions.** It grows as features ship;
each new screen adds its own `PAGE` plus the `ACTION`s under it. Your tree component will look sparse
on day one, and that is expected, not a bug. Don't hardcode against these three, and recurse even
though nothing nests deeper than two levels yet.

## 2. List roles

```
GET /api/roles?search=&page=0&size=20&sort=CREATED_AT&direction=DESC
Authorization: Bearer <owner token>
```

Standard paged envelope:

```json
{
  "content": [
    { "id": "5ef42589-…", "name": "Warehouse staff",
      "description": "Packs shipments; no billing.",
      "userCount": 0, "permissionCount": 2,
      "createdAt": "2026-08-04T20:39:58.708721Z" }
  ],
  "page": 0, "size": 20, "totalElements": 1, "totalPages": 1
}
```

- `search` — case-insensitive substring of the **name only**; the description is not searched. LIKE
  metacharacters are escaped, so a user typing `%` searches for a literal `%` and matches nothing.
- `sort` — `CREATED_AT` (default) or `NAME`. Anything else is a `400`. `direction` — `ASC`/`DESC`.
- `size` — clamped to 100.
- `description` — the owner's own note, or `null`. It's here so you can render it as a subtitle under
  the name without a second request.
- **`userCount` is the عدد المستخدمين column, and it is `0` for everyone today.** Render the column; it
  becomes real when assignment ships.
- **`OWNER` and `AGENT` never appear in this list.** They are platform-seeded and belong to no company,
  so they are not yours to rename or delete — and they are a `404` by id too (§6).

## 3. Get one role

```
GET /api/roles/{id}
Authorization: Bearer <owner token>
```

```json
{
  "id": "5ef42589-…",
  "name": "Warehouse staff",
  "description": "Packs shipments; no billing.",
  "permissionIds":   ["9e2a7b89-…", "de81bf03-…"],
  "permissionCodes": ["page:roles", "role:manage"],
  "createdAt": "…", "updatedAt": "…"
}
```

`permissionCodes` is there so you can debug and log against something readable — `permissionIds` is
what the edit form round-trips.

## 4. Create / update

```
POST /api/roles
PUT  /api/roles/{id}
Authorization: Bearer <owner token>
Content-Type: application/json

{
  "name": "Warehouse staff",
  "description": "Packs shipments; no billing.",
  "permissionIds": ["de81bf03-…"]
}
```

`201` / `200` → the object from §3.

- **Both send the complete tick state, not a delta.** `PUT` replaces the permission set wholesale; an
  id you leave out is removed.
- `name`: required, ≤100 chars, unique per company **case-insensitively** — "Warehouse" and "warehouse"
  collide.
- `description`: **optional**, ≤500 chars. Free prose, the owner's note about who the role is for.
  Surrounding whitespace is trimmed, and **blank or omitted stores `null`** — so on `PUT`, leaving the
  field out clears an existing description rather than keeping it. If your form only edits the name,
  send the description back too or you will silently wipe it.
- `permissionIds`: required (send `[]`, never omit it), ≤500 entries. An empty set is legal — an owner
  may name a role before filling it in.

### The closure rule — read this one

**Ticking an ACTION implies the PAGE it sits under.** Your modal should auto-tick the parent when a
child is selected (and it is reasonable to grey the parent out so it can't be unticked while a child is
on). The server enforces the same rule regardless, walking the *whole* ancestor chain — so:

> **The response may contain more ids than you sent.** Re-hydrate the form from the response's
> `permissionIds`, not from your local state, or your checkboxes will drift out of sync with what is
> actually stored.

The inverse is fine: a `PAGE` with none of its actions is a valid "can see the screen, can't do
anything on it" selection. Unticking a parent should untick its subtree client-side — the server has
nothing to enforce there, since an empty subtree is legitimate.

## 5. Delete

```
DELETE /api/roles/{id}
Authorization: Bearer <owner token>
```

`204`. Returns `409` while any user still holds the role — impossible to trigger today (nothing assigns
them), but wire the error case now so the button behaves once assignment lands. When it does, the fix
is always **move those users to another role first**; there is no force-delete, deliberately, because
silently reassigning people is how you strip someone's access without anyone noticing.

## 6. Errors

RFC 9457 problem details, `detail` localized by `Accept-Language` as everywhere else.

| Status | Code | When | en `detail` | ar `detail` |
|---|---|---|---|---|
| `404` | `auth.roleNotFound` | unknown id, another company's, **or** a seeded global role | Role not found | الدور غير موجود |
| `409` | `auth.roleNameTaken` | name already used in this company | A role with this name already exists | يوجد دور بهذا الاسم بالفعل |
| `400` | `auth.unknownPermission` | an id in `permissionIds` is unknown | The selection contains a permission that does not exist | يحتوي الاختيار على صلاحية غير موجودة |
| `409` | `auth.roleInUse` | delete while users hold it | This role is still assigned to users | هذا الدور ما زال مُسندًا إلى مستخدمين |

Two things worth planning for:

**A foreign role is a `404`, never a `403`.** Deliberate — the API must not confirm that some other
company owns that id. Same for `OWNER`/`AGENT`: as far as your token is concerned those ids do not
exist. Treat all of it as "gone" in the UI.

**`auth.unknownPermission` almost always means stale ids.** Permission ids are generated per database,
so an id from staging is meaningless in production and vice versa. If you cache the catalog, key the
cache by environment and re-fetch on `400` rather than retrying. **Never hardcode a permission id** —
hardcode `code` if you must pin something, and look the id up from the catalog.

Validation `400`s (blank `name`, >100 chars, missing `permissionIds`, >500 ids) carry the usual `errors`
array for field highlighting.

## 7. Authorization summary

| Caller | `GET /api/permissions` | `/api/roles` |
|---|---|---|
| Tenant `OWNER` | ✅ | ✅ |
| Tenant `AGENT` | `403` | `403` |
| Platform admin token | `403` | `403` |
| No token | `401` | `401` |

## 8. Suggested screen

1. **List** — table of الاسم / عدد المستخدمين, per-column filter driven by `search`, 10 or 20 per page.
   `description` reads well as a muted subtitle under the name. "إضافة دور" opens the modal empty.
2. **Modal** — `name` field, an optional `description` textarea, a search box filtering the tree
   client-side (the catalog is small; no server-side search for it), and the recursive tree with the
   نوع المعاملة chip from `kind`.
3. On save, replace the row from the response. On `409`, keep the modal open and mark the name field.
4. **Edit** — `GET` the role, fill name + description, tick from `permissionIds`, submit all three
   again. Remember the description clears if you omit it.

## 9. Not built yet — keep designing around these

- **Assigning a role to a user.** The whole point of the feature, and it is the next drop. Until then
  `userCount` is always `0` and roles grant nothing.
- **Per-user permission overrides** (تعديل الأدوار / استعادة الأدوار) — no endpoint, and the
  "لديه دور مخصص" column has nothing to read.
- **Tenant users management** — no endpoint to create a staff user under a company.
- **Permission-gated tenant endpoints.** Everything still keys off the coarse `OWNER` vs `AGENT` role,
  so don't build client-side gating from a role's contents yet.

## What changed since the 2nd

Only relevant if you already started against the earlier version:

| | was | now |
|---|---|---|
| base path | `/api/role-templates` | `/api/roles` |
| page code | `page:roleTemplates` | `page:roles` |
| action codes | `role:template:read` / `role:template:manage` | `role:read` / `role:manage` |
| error codes | `auth.roleTemplate{NotFound,NameTaken,InUse}` | `auth.role{NotFound,NameTaken,InUse}` |
| labels | Role templates / نماذج الأدوار | Roles / الأدوار |
| wording throughout | "role template" | "role" |

Unchanged: the `GET /api/permissions` response shape, the paged envelope, the closure rule and the
re-hydration warning, `auth.unknownPermission`, and the authorization table.

Three additions rather than renames:

- **`description`** — a new optional field on the request and on both responses (§2, §3, §4). Read the
  clearing rule; it is the one that bites.
- `OWNER`/`AGENT` are now `404` by id and absent from the list (§2, §6).
- The `409`-on-delete section says explicitly that there is no force-delete (§5).

**Permission ids also changed** if you were pointing at staging — but they were never safe to hardcode
anyway (§6).
