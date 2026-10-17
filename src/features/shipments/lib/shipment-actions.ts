import { isReturnPickup } from "@/features/shipments/lib/shipment-kind";
import type {
  Shipment,
  ShipmentCounts,
  ShipmentStatus,
  ShipmentsListTab,
} from "@/features/shipments/types";
import {
  connectionSupportsCancel,
  connectionSupportsLabels,
} from "@/shared/types/carrier-capabilities";

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

type ShipmentActionContext = Pick<Shipment, "status" | "kind" | "connection">;

export function canCancelShipment(shipment: ShipmentActionContext): boolean {
  if (shipment.status !== "BOOKED") return false;
  return connectionSupportsCancel(shipment.connection.capabilities);
}

export function canPrintShipmentLabel(shipment: ShipmentActionContext): boolean {
  if (isReturnPickup(shipment)) return false;
  if (!LABEL_STATUSES.includes(shipment.status)) return false;
  return connectionSupportsLabels(shipment.connection.capabilities);
}
