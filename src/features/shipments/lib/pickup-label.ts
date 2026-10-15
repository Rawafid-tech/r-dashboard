import type {
  ShipmentPickupRef,
  ShipmentPreviewPickup,
} from "@/features/shipments/types";

export function formatPickupLocationLabel(
  pickup: ShipmentPickupRef | ShipmentPreviewPickup,
): string {
  const trimmed = pickup.name?.trim();
  if (trimmed) return trimmed;
  return pickup.locationId;
}
