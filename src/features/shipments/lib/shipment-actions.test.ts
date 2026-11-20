import { describe, expect, it } from "vitest";
import { cancelsWithCarrierOnly } from "@/features/shipments/lib/shipment-actions";
import type { Shipment, ShipmentStatus } from "@/features/shipments/types";
import type { CarrierCapabilities } from "@/shared/types/carrier-capabilities";

const turboCapabilities: CarrierCapabilities = {
  labels: false,
  cancel: false,
  tracking: true,
  returns: false,
  exchanges: false,
  refunds: false,
};

function shipment(
  status: ShipmentStatus,
  capabilities?: Partial<CarrierCapabilities>,
): Pick<Shipment, "status" | "kind" | "connection"> {
  return {
    status,
    kind: "DELIVERY",
    connection: { capabilities } as Shipment["connection"],
  };
}

describe("cancelsWithCarrierOnly", () => {
  it("is true for a booked shipment whose carrier can't cancel", () => {
    expect(cancelsWithCarrierOnly(shipment("BOOKED", turboCapabilities))).toBe(true);
  });

  it("is false when the carrier can cancel, or capabilities are unknown", () => {
    expect(cancelsWithCarrierOnly(shipment("BOOKED", { cancel: true }))).toBe(false);
    expect(cancelsWithCarrierOnly(shipment("BOOKED"))).toBe(false);
  });

  it("is false once the shipment is past booking", () => {
    expect(cancelsWithCarrierOnly(shipment("IN_TRANSIT", turboCapabilities))).toBe(false);
    expect(cancelsWithCarrierOnly(shipment("CANCELLED", turboCapabilities))).toBe(false);
  });
});
