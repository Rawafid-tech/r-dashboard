import type { ShipmentKind, ShipmentStatus } from "@/features/shipments/types";

export function exchangeStatusLabelKey(
  status: ShipmentStatus,
  swappedAt: string | null | undefined,
): string {
  if (status === "RETURNING") {
    return swappedAt
      ? "status.exchange.RETURNING_swapped"
      : "status.exchange.RETURNING";
  }
  if (status === "RETURNED") {
    return swappedAt
      ? "status.exchange.RETURNED_swapped"
      : "status.exchange.RETURNED";
  }

  const directKeys: Partial<Record<ShipmentStatus, string>> = {
    BOOKING: "status.exchange.BOOKING",
    BOOKED: "status.exchange.BOOKED",
    IN_TRANSIT: "status.exchange.IN_TRANSIT",
    CANCELLED: "status.exchange.CANCELLED",
    LOST: "status.exchange.LOST",
    FAILED: "status.exchange.FAILED",
  };

  return directKeys[status] ?? `status.${status}`;
}

export function shipmentStatusLabelKey(
  status: ShipmentStatus,
  kind: ShipmentKind,
  swappedAt?: string | null,
): string {
  if (kind === "RETURN_PICKUP") {
    return `status.returnPickup.${status}`;
  }
  if (kind === "EXCHANGE") {
    return exchangeStatusLabelKey(status, swappedAt);
  }
  return `status.${status}`;
}
