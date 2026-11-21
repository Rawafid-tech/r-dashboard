# Public tracking page

21 November 2026. **Status: live on staging (rawafid.softizone.net) since 21 November 2026 (PR #87).**

A shipment now has a public link the store gives its customer (in the Shopify fulfilment and the
shipping email). The link points at **the dashboard**, so the page is yours to build.

## §1 `trackingUrl` on every shipment

Every shipment response (`GET /api/shipments`, `GET /api/shipments/{id}`, book, bulk book, cancel)
has a new field:

```json
{ "trackingUrl": "https://<APP_BASE_URL>/track/k3v9x0q2m7c4t8b1w6zr" }
```

- Always set. The code is 20 lowercase letters and digits (older shipments have 24), random, and
  not the shipment id.
- Dashboard (optional): a "Copy tracking link" button on the shipment page.

## §2 The `/track/:code` page (new route)

- **Outside the signed-in layout. No login, no token, no refresh.** A customer opens it from an email
  on a phone: mobile first.
- Arabic and English, with a language switch; default to the browser's language.
- On load: `GET /api/public/track/{code}` (anonymous; send no `Authorization` header).

```json
{
  "status": "IN_TRANSIT",
  "kind": "DELIVERY",
  "steps": [
    { "step": "BOOKED",    "at": "2026-11-21T08:10:00Z" },
    { "step": "PICKED_UP", "at": "2026-11-21T12:40:00Z" },
    { "step": "DELIVERED", "at": null }
  ],
  "trackingNumber": "6278566198",
  "carrier": { "nameEn": "Bosta", "nameAr": "بوسطة", "logoUrl": "/api/public/media/…" },
  "company": { "name": "EreYehia Store", "logoUrl": "/api/public/media/…" },
  "hasIssue": true,
  "attempts": 1,
  "lastUpdateAt": "2026-11-21T13:05:00Z"
}
```

**What to show**

| Field | How |
| --- | --- |
| `company` | Header: logo (if any) and name, "Your order from …" |
| `steps` | A 3-step progress bar, in the given order. `at` set = reached (show the date and time), `null` = not yet |
| `status` | The headline (labels below) |
| `carrier` | Logo and name in the page's language |
| `trackingNumber` | With a copy button; may be null while `BOOKING` |
| `hasIssue` | When true, a warning box: "The courier had a problem with the last delivery attempt. The store may contact you." / "واجه المندوب مشكلة في آخر محاولة توصيل، وقد يتواصل معك المتجر." The carrier's own reason isn't sent: it's free text and can name the customer |
| `attempts` | "Delivery attempts: N" when N > 0 |
| `lastUpdateAt` | "Last update …" in the viewer's local time (when Rawafid last heard a change); null before the carrier's first report |

`logoUrl` values are paths on the **API** origin, so prefix them as you do other media.

**Step labels**

| `step` | English | Arabic |
| --- | --- | --- |
| `BOOKED` | Shipment created | تم إنشاء الشحنة |
| `PICKED_UP` | Picked up | تم الاستلام من المرسل |
| `DELIVERED` | Delivered | تم التوصيل |
| `SWAPPED` | Exchanged | تم الاستبدال |
| `RETURNED` | Returned to the store | تم الإرجاع إلى المتجر |

For `kind = RETURN_PICKUP`, label `PICKED_UP` as "Picked up from you" / "تم الاستلام منك".

**Status headline**

| `status` | English | Arabic |
| --- | --- | --- |
| `BOOKING` | Preparing your shipment | جارٍ تجهيز الشحنة |
| `BOOKED` | Waiting for pickup | في انتظار الاستلام |
| `IN_TRANSIT` | On the way | في الطريق |
| `RETURNING` | On its way back to the store | في طريق العودة إلى المتجر |
| `DELIVERED` | Delivered | تم التوصيل |
| `RETURNED` | Returned to the store | تم الإرجاع إلى المتجر |
| `LOST` | There's a problem with this shipment. Please contact the store | توجد مشكلة في هذه الشحنة، يرجى التواصل مع المتجر |
| `FAILED`, `CANCELLED` | This shipment was cancelled. Please contact the store | تم إلغاء هذه الشحنة، يرجى التواصل مع المتجر |

**Errors**
- `404` (unknown or mistyped code): a friendly "We couldn't find this shipment. Check the link" page.
  The body is a problem detail with `detail` in the request's `Accept-Language`.
- The answer may be cached for 60 seconds, so there's no need to poll faster. A refresh button is
  enough.

**Never on this page:** the customer's name, phone or address, cash on delivery, the order
number. The endpoint doesn't send them, so don't fetch them from anywhere else.

## §3 A small note from the store app team

When the district search in the booking dialog finds nothing, the field shows nothing at all, and
merchants read that as "not working". Please show a line: "No districts found" / "لا توجد مناطق
مطابقة".
