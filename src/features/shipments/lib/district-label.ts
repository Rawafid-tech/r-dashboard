import type { ShipmentDistrict } from "@/features/shipments/types";

export function getShipmentDistrictLabel(
  district: ShipmentDistrict,
  locale: "ar" | "en",
): string {
  if (locale === "ar") {
    return `${district.nameAr} — ${district.zoneNameAr}`;
  }
  return `${district.nameEn} — ${district.zoneNameEn}`;
}
