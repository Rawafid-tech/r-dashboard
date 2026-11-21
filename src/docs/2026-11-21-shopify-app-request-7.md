# Shopify app: request 7 (home page statistics)

21 November 2026. **Status: live on staging (rawafid.softizone.net) since 21 November 2026 (PR #90).**

## The call

```
GET /api/integrations/channels/current/stats?from=2026-11-15&to=2026-11-22
X-Api-Key: rwf_…
```

- **Only with the store's key.** It counts the orders **this channel** sent: not the company's other
  stores, and not orders typed in the dashboard. A signed-in person gets 400
  `integration.channel.keyOnly`.
- `from` and `to` are calendar days (`YYYY-MM-DD`) in **Cairo time**. `to` is **exclusive**, as you
  asked:

  | Range | from | to |
  |---|---|---|
  | Today (21 Nov) | 2026-11-21 | 2026-11-22 |
  | Last 7 days | 2026-11-15 | 2026-11-22 |
  | Last 30 days | 2026-10-23 | 2026-11-22 |

- An order counts by when it was **created in Rawafid**, which is when your app sent it.

## The answer

```json
{
  "from": "2026-11-15", "to": "2026-11-22", "timeZone": "Africa/Cairo",
  "orders": { "pending": 3, "booked": 5, "delivered": 12, "returned": 2,
              "cancelled": 1, "total": 23 },
  "deliveryRate": 0.8571,
  "returnRate": 0.1429,
  "codOfDeliveredOrders": [ { "currency": "EGP", "amount": 4520.00 } ]
}
```

- **`orders`**: each order counts once, under its status **now**. A returned order can be booked
  again, and then counts as whatever that booking ends as. `returned` also includes a parcel the
  carrier lost.
- **`deliveryRate`** = delivered / (delivered + returned), and **`returnRate`** = returned /
  (delivered + returned). They are fractions with 4 decimals (0.8571 = 85.71 %). Both are **null**
  until something is delivered or returned, so show "—" rather than 0 %.
- **`codOfDeliveredOrders`**: the cash-on-delivery amounts of the delivered orders, one entry per
  currency (in practice one EGP entry). The list is empty when nothing was delivered. **Rawafid
  doesn't collect this money**: the carrier collects it and pays the merchant. So please label it
  "COD of delivered orders", not "collected". We don't track what was actually paid out.
- An order sent again after its order was cancelled (your 8b) counts as two orders: the cancelled
  one and the new one, as in the order list. If you'd rather count it once, tell us.

## Errors

- **400 `integration.stats.badRange`**: `from` must be before `to`, at most 366 days apart, with both dates between 2000 and 2100.
- **400** when a date is missing or isn't `YYYY-MM-DD`.
- Messages follow `Accept-Language` (en or ar), as everywhere else.
