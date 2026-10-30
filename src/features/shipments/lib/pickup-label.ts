import type {
  ShipmentPickupRef,
  ShipmentPreviewPickup,
} from "@/features/shipments/types";

/**
 * For a SENDER_LOCATION pickup, `locationId` is the carrier's area id, so it
 * is never shown; `senderFallback` stands in when the name is missing.
 */
export function formatPickupLocationLabel(
  pickup: ShipmentPickupRef | ShipmentPreviewPickup,
  senderFallback?: string,
): string {
  const trimmed = pickup.name?.trim();
  if (trimmed) return trimmed;
  if ("source" in pickup && pickup.source === "SENDER_LOCATION") {
    return senderFallback ?? "";
  }
  return pickup.locationId;
}
