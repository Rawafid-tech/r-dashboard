import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import {
  isTrackingNumberTakenError,
  parseShipmentBookingError,
} from "@/features/shipments/lib/shipment-booking-errors";

function apiError(status: number, data: Record<string, unknown>): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response = {
    status,
    statusText: "",
    headers: {},
    config,
    data: { status, detail: "Held for support", ...data },
  } as AxiosResponse;
  return new AxiosError("Request failed", undefined, config, null, response);
}

describe("parseShipmentBookingError — trackingNumberTaken", () => {
  it("reads a 409 code as held for support, with the shipment id", () => {
    const error = apiError(409, {
      code: "shipment.trackingNumberTaken",
      shipmentId: "shp-1",
    });
    expect(isTrackingNumberTakenError(error)).toBe(true);
    expect(parseShipmentBookingError(error)).toEqual({
      detail: "Held for support",
      action: "heldForSupport",
      shipmentId: "shp-1",
    });
  });

  it("also accepts the code as the problem's reason", () => {
    const error = apiError(409, { reason: "shipment.trackingNumberTaken" });
    expect(parseShipmentBookingError(error).action).toBe("heldForSupport");
  });

  it("works without a shipment id", () => {
    const error = apiError(409, { code: "shipment.trackingNumberTaken" });
    expect(parseShipmentBookingError(error)).toMatchObject({
      action: "heldForSupport",
      shipmentId: undefined,
    });
  });

  it("ignores the code on another status", () => {
    const error = apiError(422, { code: "shipment.trackingNumberTaken" });
    expect(isTrackingNumberTakenError(error)).toBe(false);
    expect(parseShipmentBookingError(error).action).toBe("editOrder");
  });

  it("keeps the other 409 answers unchanged", () => {
    const error = apiError(409, { detail: "Booking not confirmed" });
    expect(parseShipmentBookingError(error).action).toBe("retry");
  });
});
