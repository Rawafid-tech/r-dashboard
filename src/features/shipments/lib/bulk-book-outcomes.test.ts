import { describe, expect, it } from "vitest";
import { heldBulkLine } from "@/features/shipments/lib/bulk-book-outcomes";
import type { BulkBookResultRow, Shipment } from "@/features/shipments/types";

function shipment(overrides: Partial<Shipment>): Shipment {
  return {
    id: "shp-1",
    status: "BOOKING",
    failure: null,
    ...overrides,
  } as Shipment;
}

describe("heldBulkLine", () => {
  it("reads a rejected line answering trackingNumberTaken", () => {
    const row: BulkBookResultRow = {
      orderId: "ord-1",
      outcome: "REJECTED",
      shipment: null,
      error: {
        code: "shipment.trackingNumberTaken",
        message: "Held",
        status: 409,
        details: { shipmentId: "shp-9" },
      },
    };
    expect(heldBulkLine(row)).toEqual({
      orderId: "ord-1",
      shipmentId: "shp-9",
      message: "Held",
    });
  });

  it("reads a BOOKING shipment that has a failure", () => {
    const row: BulkBookResultRow = {
      orderId: "ord-2",
      outcome: "BOOKING",
      shipment: shipment({
        failure: { code: "shipment.trackingNumberTaken", message: "Held" },
      }),
      error: null,
    };
    expect(heldBulkLine(row)).toEqual({
      orderId: "ord-2",
      shipmentId: "shp-1",
      message: "Held",
    });
  });

  it("ignores a booking still in flight and other rejections", () => {
    expect(
      heldBulkLine({
        orderId: "ord-3",
        outcome: "BOOKING",
        shipment: shipment({}),
        error: null,
      }),
    ).toBeNull();
    expect(
      heldBulkLine({
        orderId: "ord-4",
        outcome: "REJECTED",
        shipment: null,
        error: { code: "shipment.rejected", message: "No", status: 422 },
      }),
    ).toBeNull();
  });
});
