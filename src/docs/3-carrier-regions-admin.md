# Carrier regions — admin console contract

**Status: deployed to staging (PR #39, 2026-09-26).** Admin console only, with nothing new on the merchant
screens. The payloads below were captured from a local run synced against Bosta's staging API (2026-09-26).

Each carrier's own geography (cities → zones → districts, in the carrier's ids) is downloaded and
kept fresh, so a booking can tell which district an address is. The download runs weekly on its own and at
first boot. These screens let support look at the data and answer "where would this address go?"

Permissions reuse the carrier catalog's: `carrier:carrier:read` for list and resolve, `carrier:carrier:manage`
for sync. SUPPORT can look but not sync.

---

## 1. `POST /api/admin/carriers/{code}/regions/sync` → `200`

A "Sync now" button. It takes a few seconds for Bosta (about 3,700 districts).

```json
{ "added": 0, "updated": 0, "retired": 0, "total": 3703, "unmappedCities": [] }
```

- **Retired** districts are ones the carrier stopped listing. They are kept with `active: false` and never
  deleted.
- **`unmappedCities`** lists carrier cities we could not place in one of our governorates. Their districts
  never match an address, so show a warning when this is non-empty.
- `502` means the carrier did not answer (the usual "not responding" message), and nothing is changed.

## 2. `GET /api/admin/carriers/{code}/regions` — the district table

Params:
- `governorateId`
- `unmapped` (`true` = cities we couldn't place)
- `active`
- `search` (city, zone or district name, in either language)
- `page`, `size` (≤ 100, default 50)

Sorted by city, zone, district. Returns the standard `PageResponse`:

```json
{ "content": [ {
    "id": "…", "governorateId": "…",
    "city": { "id": "Jrb6X6ucjiYgMP4T7", "nameEn": "Alexandria", "nameAr": "الاسكندريه", "primary": true },
    "zone": { "id": "zJZWu09Vo-l", "nameEn": "Qesm ElRaml", "nameAr": "قسم الرمل" },
    "districtId": "er3YXqlqe0", "districtNameEn": "Fleming", "districtNameAr": "فليمينج",
    "pickupAvailable": true, "dropOffAvailable": true, "active": true,
    "changedAt": "2026-09-26T12:41:10.29Z" } ],
  "page": 0, "size": 50, "totalElements": 1, "totalPages": 1 }
```

- `changedAt` is when a sync last **changed** the row (added, updated, retired or revived). On a retired row, it
  is when the carrier dropped it. A sync that finds nothing new leaves it alone.
- `search` is spelling-tolerant, the same as resolve: "حدائق القبة" finds Bosta's "حداءق القبه", and "القاهرة"
  finds its "القاهره".
- `city.primary: false` marks a secondary city inside a governorate: Bosta's "North Coast" sits inside Matrouh.
- `dropOffAvailable: false` means the carrier will not deliver there. Show it as a badge.

## 3. `GET /api/admin/carriers/{code}/regions/resolve?governorateId=&district=` — "where does this go?"

A small tester: pick a governorate, type a district, and see what booking would send. Real responses:

```json
{ "method": "HEAD", "text": "سيدي بشر",
  "district": { "districtId": "0tXBv4WSWz2", "districtNameEn": "Sidi Beshr Bahri",
                "zone": { "nameEn": "ElMontazah" }, "city": { "nameEn": "Alexandria" }, "…": "…" },
  "fallbackCity": null }
```

```json
{ "method": "NONE", "text": "قرية لا يعرفها أحد", "district": null,
  "fallbackCity": { "id": "FceDyHXwpSYYF9zGW", "nameEn": "Cairo", "nameAr": "القاهره", "primary": true } }
```

| `method` | meaning |
|---|---|
| `DISTRICT` | the text is a district's own name |
| `ZONE` | the text is a zone's name, and a district of that zone stands in for it |
| `HEAD` | the text starts district names that all sit in one zone ("سيدي بشر" → its north half) |
| `NONE` | no confident match. Booking sends the city plus the typed name, and the carrier resolves it itself (Bosta does, fuzzily). `fallbackCity: null` means the carrier has no city in that governorate |

When candidates fall in two different zones, the result is `NONE` on purpose: we never guess between two
hubs. Within one zone, a district the carrier delivers to is always picked over one it doesn't. A
`fallbackCity` is only ever a governorate's *primary* city.

Errors: `404` for an unknown carrier code ("This shipping partner is not available"), localized. A missing
`governorateId` or `district` is a `400`.
