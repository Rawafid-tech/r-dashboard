/** ISO 3166-1 alpha-2 codes supported for ship-from country selection. */
export const SHIP_FROM_COUNTRIES = [
  "EG",
  "SA",
  "AE",
  "KW",
  "QA",
  "BH",
  "OM",
  "JO",
] as const;

export type ShipFromCountry = (typeof SHIP_FROM_COUNTRIES)[number];
