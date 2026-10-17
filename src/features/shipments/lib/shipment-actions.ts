import { isReturnPickup } from "@/features/shipments/lib/shipment-kind";
import type {
  Shipment,
  ShipmentCounts,
  ShipmentStatus,
  ShipmentsListTab,
} from "@/features/shipments/types";

const LABEL_STATUSES: ShipmentStatus[] = [
  "BOOKED",
  "IN_TRANSIT",
  "RETURNING",
  "DELIVERED",
  "RETURNED",
  "LOST",
];

export function statusesForTab(tab: ShipmentsListTab): ShipmentStatus[] {
  switch (tab) {
    case "AWAITING_PICKUP":
      return ["BOOKED"];
    case "CURRENTLY_SHIPPING":
      return ["IN_TRANSIT", "RETURNING"];
    case "DELIVERED":
      return ["DELIVERED"];
    case "RETURNED":
      return ["RETURNED", "LOST"];
    case "BOOKING":
      return ["BOOKING"];
    case "FAILED":
      return ["FAILED"];
    case "CANCELLED":
      return ["CANCELLED"];
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export function tabCountFromCounts(
  tab: ShipmentsListTab,
  counts: ShipmentCounts | undefined,
): number | undefined {
  if (!counts) return undefined;
  return statusesForTab(tab).reduce((sum, status) => sum + (counts[status] ?? 0), 0);
}

export function canCancelShipment(status: ShipmentStatus): boolean {
  return status === "BOOKED";
}

export function canPrintShipmentLabel(
  shipment: Pick<Shipment, "status" | "kind">,
): boolean {
  if (isReturnPickup(shipment)) return false;
  return LABEL_STATUSES.includes(shipment.status);
}
