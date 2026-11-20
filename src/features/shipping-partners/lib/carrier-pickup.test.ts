import { describe, expect, it } from "vitest";
import { carrierHasPickup } from "@/features/shipping-partners/lib/carrier-pickup";
import type { CarrierField } from "@/features/shipping-partners/types";

function field(key: string, kind: CarrierField["kind"]): CarrierField {
  return { key, kind, required: false, label: key, defaultValue: null, options: [] };
}

describe("carrierHasPickup", () => {
  it("is false for a carrier collecting from its own account (Turbo)", () => {
    expect(
      carrierHasPickup({
        fields: [
          field("apiKey", "SECRET"),
          field("clientCode", "SECRET"),
          field("followupPhone", "TEXT"),
          field("allowOpen", "BOOLEAN"),
        ],
      }),
    ).toBe(false);
  });

  it("is true for a carrier with a pickup location field", () => {
    expect(
      carrierHasPickup({
        fields: [field("apiKey", "SECRET"), field("pickupLocationId", "PICKUP_LOCATION")],
      }),
    ).toBe(true);
  });

  it("keeps the action while the carrier is unknown", () => {
    expect(carrierHasPickup(undefined)).toBe(true);
    expect(carrierHasPickup(null)).toBe(true);
  });
});
