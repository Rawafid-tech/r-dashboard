import {
  isHeldForSupport,
  TRACKING_NUMBER_TAKEN,
} from "@/features/shipments/lib/shipment-held";
import type { BulkBookResponse, BulkBookResultRow } from "@/features/shipments/types";

export interface HeldBulkLine {
  orderId: string;
  shipmentId: string | null;
  message: string;
}

/**
 * A bulk line held for support (`shipment.trackingNumberTaken`), whether the
 * API answers it as a rejected line or as a `BOOKING` shipment with a failure.
 */
export function heldBulkLine(row: BulkBookResultRow): HeldBulkLine | null {
  if (row.error?.code === TRACKING_NUMBER_TAKEN) {
    const detailsId = row.error.details?.shipmentId;
    return {
      orderId: row.orderId,
      shipmentId:
        typeof detailsId === "string" ? detailsId : (row.shipment?.id ?? null),
      message: row.error.message,
    };
  }
  if (row.shipment && isHeldForSupport(row.shipment)) {
    return {
      orderId: row.orderId,
      shipmentId: row.shipment.id,
      message: row.shipment.failure?.message ?? "",
    };
  }
  return null;
}

export function bookedShipmentIds(response: BulkBookResponse): string[] {
  return response.results
    .filter(
      (row): row is BulkBookResultRow & { shipment: NonNullable<BulkBookResultRow["shipment"]> } =>
        row.outcome === "BOOKED" && row.shipment !== null,
    )
    .map((row) => row.shipment.id);
}

export function groupBookedIdsByConnection(
  response: BulkBookResponse,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of response.results) {
    if (row.outcome !== "BOOKED" || !row.shipment) continue;
    const connectionId = row.shipment.connection.id;
    const list = map.get(connectionId) ?? [];
    list.push(row.shipment.id);
    map.set(connectionId, list);
  }
  return map;
}
