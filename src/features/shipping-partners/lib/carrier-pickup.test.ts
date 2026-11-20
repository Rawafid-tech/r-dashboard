import { describe, expect, it } from "vitest";
import {
  carrierHasPickup,
  needsPickupChoice,
} from "@/features/shipping-partners/lib/carrier-pickup";
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

describe("needsPickupChoice", () => {
  const warehouse = (isDefault: boolean) => ({ isDefault });

  it("warns for several warehouses, none default, nothing picked", () => {
    expect(needsPickupChoice([warehouse(false), warehouse(false)], "")).toBe(true);
  });

  it("stays quiet once a warehouse is picked", () => {
    expect(
      needsPickupChoice([warehouse(false), warehouse(false)], "Giza Store"),
    ).toBe(false);
  });

  it("stays quiet when the account marks a default", () => {
    expect(needsPickupChoice([warehouse(true), warehouse(false)], "")).toBe(false);
  });

  it("stays quiet for a single warehouse or before the test", () => {
    expect(needsPickupChoice([warehouse(false)], "")).toBe(false);
    expect(needsPickupChoice([], "")).toBe(false);
  });
});
