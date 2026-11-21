# Shipments changed since a time

20 November 2026. **Status: live on staging (rawafid.softizone.net) since 20 November 2026.**

Small addition to `GET /api/shipments` (built for store apps syncing by time; the dashboard
doesn't need it, but it may use it):

| Param | Meaning |
| --- | --- |
| `updatedSince` | ISO 8601 instant, inclusive: only shipments changed at or after it. A bad value is `400` |
| `sort=UPDATED_AT` | New sort value, next to `CREATED_AT` and `BOOKED_AT` |

Nothing else changed. Shipment webhooks to store apps have no dashboard screen.
