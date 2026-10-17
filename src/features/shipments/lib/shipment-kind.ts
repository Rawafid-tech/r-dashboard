import type { Shipment, ShipmentKind } from "@/features/shipments/types";

export function getShipmentKind(
  shipment: Pick<Shipment, "kind">,
): ShipmentKind {
  return shipment.kind ?? "DELIVERY";
}

export function isReturnPickup(shipment: Pick<Shipment, "kind">): boolean {
  return getShipmentKind(shipment) === "RETURN_PICKUP";
}

export function isExchange(shipment: Pick<Shipment, "kind">): boolean {
  return getShipmentKind(shipment) === "EXCHANGE";
}
