import type { ShipmentConnectionRef } from "@/features/shipments/types";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";

export function shipmentCarrierLabel(
  connection: Pick<
    ShipmentConnectionRef,
    "carrierCode" | "carrierNameEn" | "carrierNameAr"
  >,
  locale: string,
): string {
  return carrierDisplayName(
    {
      code: connection.carrierCode,
      nameEn: connection.carrierNameEn,
      nameAr: connection.carrierNameAr,
    },
    locale,
  );
}
