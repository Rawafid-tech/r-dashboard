import { describe, expect, it } from "vitest";
import {
  carrierStateText,
  isHeldForSupport,
} from "@/features/shipments/lib/shipment-held";
import type { ShipmentFailure } from "@/features/shipments/types";

const failure: ShipmentFailure = {
  code: "shipment.trackingNumberTaken",
  message: "Held",
};

const t = (key: string) => `t:${key}`;

describe("isHeldForSupport", () => {
  it("is true for a BOOKING shipment with a failure", () => {
    expect(isHeldForSupport({ status: "BOOKING", failure })).toBe(true);
  });

  it("is false while a booking is still in flight", () => {
    expect(isHeldForSupport({ status: "BOOKING", failure: null })).toBe(false);
  });

  it("is false for a failed shipment", () => {
    expect(isHeldForSupport({ status: "FAILED", failure })).toBe(false);
  });

  it("is false without a shipment", () => {
    expect(isHeldForSupport(null)).toBe(false);
    expect(isHeldForSupport(undefined)).toBe(false);
  });
});

describe("carrierStateText", () => {
  it("prefers the carrier's own label", () => {
    expect(carrierStateText({ code: "X", label: "Out for delivery" }, t)).toBe(
      "Out for delivery",
    );
  });

  it("writes Rawafid's text for a known code without a label", () => {
    expect(carrierStateText({ code: "NUMBER_REUSED", label: null }, t)).toBe(
      "t:carrierCodes.NUMBER_REUSED",
    );
  });

  it("shows nothing for an unknown code without a label", () => {
    expect(carrierStateText({ code: "SOMETHING", label: null }, t)).toBeNull();
    expect(carrierStateText({ code: "SOMETHING", label: "  " }, t)).toBeNull();
  });

  it("shows nothing without a state", () => {
    expect(carrierStateText(null, t)).toBeNull();
  });
});
