# 2026-10-17 — Returns on Accurate carriers

> Also in `2026-10-17.md` as Part 3. Builds on `2026-10-16.md` Part 1 (returns) and `2026-10-17.md` Part 1 (Accurate carriers).

**Status: deployed to staging (PR #57, 2026-10-17).** On staging every Accurate carrier still
has returns **off**: an admin turned Arco's on, a merchant saw `capabilities.returns: true`, and it
was turned off again; a bad value was refused (`400`, checked in Arabic); Bosta still offers returns
and exchanges. No return was booked at an Accurate carrier. Accurate carriers (Arco and the other
21) can now take **returns**, with or without a refund. **Each carrier's returns are off until a
platform admin turns them on**, one carrier at a time, once its returns are proven.
**Exchanges on Accurate carriers are still not offered.**

**What it is.** The return flow from `2026-10-16.md` Part 1 now works on an Accurate connection
whose carrier has returns turned on. Nothing in that flow changes for the merchant screens: same
preview, same `POST /api/shipments/returns`, same statuses and notifications. The changes are what
an Accurate connection reports, and one new switch in the admin carrier form.

**How it was checked.** Arco's API was read without booking anything: its own list of shipment
types, and how its existing returns are shaped. The refund-free shape is the one our earlier
production integration books every day. Booking, the refund, tracking to *Returned*, status pushes
and cancelling were tested end to end against a local stand-in of the API. **No real return has
been booked at an Accurate carrier yet**, which is why each carrier's returns start off.

---

## Changes to the earlier drops

| Drop | Where | Was | Now |
|---|---|---|---|
| `2026-10-17.md` Part 1 §1 | an Accurate partner's / connection's `capabilities.returns` | always `false` | `true` once an admin turns returns on for that carrier, else `false`. `exchanges` stays `false` |
| `2026-10-17.md` Part 1 §2 | `GET /api/admin/carrier-platforms` → `carrierFields` | `{ key, required }`; `baseUrl`, `clientId` | each field gains `kind` (`TEXT` / `BOOLEAN`) and `defaultValue`; a third field `returns` (`BOOLEAN`, optional, default `false`) |
| `2026-10-17.md` Part 1 §2 | a carrier's `settings` | `baseUrl`, `clientId` | may also hold `"returns": "true"` |
| `2026-10-17.md` Part 1 §3 | not built yet | returns and exchanges on Accurate carriers | exchanges only |

---

## 1. Merchant screens

- **`GET /api/carriers`** and the connection response: an Accurate partner whose returns are on
  answers

  ```json
  "capabilities": { "labels": false, "cancel": true, "tracking": true, "returns": true, "exchanges": false }
  ```

  and `"returns": false` while they are off. Read the flag; never assume it from the platform.
- **`GET /api/shipments/return-preview`**: lists an Accurate connection in `connections` only while
  its carrier's returns are on. With none to offer, hide *Return*, as before.
- **`POST /api/shipments/returns`** on an Accurate connection: unchanged request and response
  (`2026-10-16.md` Part 1). `refundAmount` is accepted; the courier hands it to the customer at
  pickup. On a connection whose carrier has returns off it answers the existing `422` *"This
  shipping partner cannot collect returns. Choose another connection."*
- **Statuses**: the same road as any return: `BOOKED` → `IN_TRANSIT` (collected from the customer) →
  `RETURNED` (handed back to the merchant), or `CANCELLED` if cancelled or given up before
  collection. If the carrier reports the return as *returned to sender* (`RTRN`), Rawafid does not
  take it as received: the status stays where it was and the shipment shows an **issue**
  (`issueCode: "RTRN"`, reason *تم الارجاع للراسل*) for the merchant to check with the carrier.
- **No label**, as for every return.

---

## 2. Admin console: turning returns on for a carrier

`GET /api/admin/carrier-platforms` now describes each field fully, so the form can show a switch:

```json
[ { "platform": "ACCURATE", "carrierFields": [
    { "key": "baseUrl",  "kind": "TEXT",    "required": true,  "defaultValue": null },
    { "key": "clientId", "kind": "TEXT",    "required": true,  "defaultValue": null },
    { "key": "returns",  "kind": "BOOLEAN", "required": false, "defaultValue": false } ] } ]
```

- Show `returns` as a switch (*Returns on* / *تفعيل المرتجعات*), off by default.
- Settings are strings: send `"returns": "true"` or `"false"`. Anything else is the usual `400`
  with `"field": "returns"`.
- `PATCH /api/admin/carriers/{code}` replaces **all** of `settings`, so send `baseUrl` and
  `clientId` with it:

  ```json
  { "settings": { "baseUrl": "https://arco.lg.accuratess.com:8443/graphql", "clientId": "arco", "returns": "true" } }
  ```

- As with any settings change, saving it starts a quiet re-sync of the carrier's areas.

---

## 3. Not built yet

- Exchanges on Accurate carriers.
