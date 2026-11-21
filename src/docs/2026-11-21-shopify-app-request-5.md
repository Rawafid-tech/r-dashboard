# Shopify app: request 5 (public tracking page)

21 November 2026. **Status: live on staging (rawafid.softizone.net) since 21 November 2026 (PR #87).** The page itself is being built in the
dashboard; until it ships, the link opens nothing useful, so don't put it in customer emails yet. We'll
tell you when both are live.

## What you get

Every shipment response now carries `trackingUrl`. That includes the `GET /api/shipments/{id}` you
call after a webhook, the list, and the book responses:

```json
{ "trackingNumber": "6278566198",
  "trackingUrl": "https://<dashboard domain>/track/k3v9x0q2m7c4t8b1w6zr" }
```

- Pass it to Shopify as the fulfilment's tracking URL, next to the tracking number and the carrier
  name.
- It's always set, and it never changes for a shipment. A rebooked order is a new shipment, so it
  gets a new link.
- The code is random (about 103 bits) and isn't the shipment id. Anyone with the link can see the
  page, so treat it like the tracking number, not like a secret.

## What the page shows

Status with a three-step bar (booked, picked up, then delivered; or returned if it comes back), the
carrier's name and logo, the tracking number, the last update time, the current delivery issue, the
number of attempts, and the company's name and logo. It's in Arabic and English and built for
mobile.

It never shows the customer's name, phone or address, cash on delivery, or the order number.

## Differences from your list

- **No "out for delivery" step.** Rawafid's tracking model doesn't separate it from "in transit"
  across carriers yet. When it does, it will appear as an extra step; the field shape won't change.
- The store name is the **company's** name (and logo), not the Shopify store's name.
- **The delivery issue is shown as a fact, not in the carrier's words.** The page says the courier had a problem with the last attempt. The carrier's reason is free text and can name the customer or the address, so it stays off a public page. Your key still reads it on `GET /api/shipments/{id}` (`issue.reason`).

## If you want the data instead of the page

`GET /api/public/track/{code}` is the page's own JSON, anonymous, cached for 60 seconds. You don't
need it: your key already reads the full shipment.
