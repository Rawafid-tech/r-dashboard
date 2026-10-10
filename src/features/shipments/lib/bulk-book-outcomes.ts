import type { BulkBookResponse, BulkBookResultRow } from "@/features/shipments/types";

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
