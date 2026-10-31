import { describe, expect, it } from "vitest";
import {
  isExchangeActionAvailable,
  isReturnActionAvailable,
} from "@/features/orders/lib/reverse-logistics-availability";
import type { ExchangePreview } from "@/features/exchanges/types";
import type { ReturnPreview } from "@/features/returns/types";

function preview(
  overrides: Partial<ReturnPreview> = {},
): ReturnPreview & ExchangePreview {
  return {
    bookable: true,
    existingReturn: null,
    connections: [{ id: "conn-1" }],
    ...overrides,
  } as unknown as ReturnPreview & ExchangePreview;
}

describe.each([
  ["return", isReturnActionAvailable],
  ["exchange", isExchangeActionAvailable],
])("%s availability", (_kind, isAvailable) => {
  it("is available for a bookable order with a carrier connection", () => {
    expect(isAvailable(preview())).toBe(true);
  });

  it("is unavailable without a preview", () => {
    expect(isAvailable(undefined)).toBe(false);
  });

  it("is unavailable when a return already exists", () => {
    expect(
      isAvailable(
        preview({
          existingReturn: {
            shipmentId: "s-1",
            status: "BOOKED",
            kind: "RETURN_PICKUP",
          },
        }),
      ),
    ).toBe(false);
  });

  it("is unavailable when not bookable or without connections", () => {
    expect(isAvailable(preview({ bookable: false }))).toBe(false);
    expect(isAvailable(preview({ connections: [] }))).toBe(false);
  });
});
