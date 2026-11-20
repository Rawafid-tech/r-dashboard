import type { ShipmentDistrict } from "@/features/shipments/types";
import { joinDistinctNames } from "@/shared/lib/name-parts";

/** "District — Zone", or one name when they match (a governorate-wide entry). */
export function getShipmentDistrictLabel(
  district: Pick<
    ShipmentDistrict,
    "nameEn" | "nameAr" | "zoneNameEn" | "zoneNameAr"
  >,
  locale: "ar" | "en",
): string {
  const parts =
    locale === "ar"
      ? [district.nameAr, district.zoneNameAr]
      : [district.nameEn, district.zoneNameEn];
  return joinDistinctNames(parts, " — ");
}
