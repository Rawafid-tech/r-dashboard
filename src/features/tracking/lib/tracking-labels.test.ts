import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { statusLabelKey, statusTone, stepLabelKey } from "@/features/tracking/lib/tracking-labels";
import type { PublicTrackingStatus, PublicTrackingStep } from "@/features/tracking/types";

const STATUSES: PublicTrackingStatus[] = [
  "BOOKING",
  "BOOKED",
  "IN_TRANSIT",
  "RETURNING",
  "DELIVERED",
  "RETURNED",
  "LOST",
  "FAILED",
  "CANCELLED",
];
const STEPS: PublicTrackingStep[] = ["BOOKED", "PICKED_UP", "DELIVERED", "SWAPPED", "RETURNED"];

function resolve(locale: "ar" | "en", key: string): unknown {
  const json = JSON.parse(
    readFileSync(join(__dirname, "..", "..", "..", "i18n", "locales", locale, "tracking.json"), "utf8"),
  ) as Record<string, unknown>;
  return key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], json);
}

describe("tracking labels", () => {
  it("has an Arabic and an English headline for every status", () => {
    for (const status of STATUSES) {
      for (const locale of ["ar", "en"] as const) {
        expect(typeof resolve(locale, statusLabelKey(status)), `${locale} ${status}`).toBe("string");
      }
    }
  });

  it("has labels for every step, and says 'picked up from you' for a return pickup", () => {
    for (const step of STEPS) {
      for (const locale of ["ar", "en"] as const) {
        expect(typeof resolve(locale, stepLabelKey(step, "DELIVERY")), `${locale} ${step}`).toBe("string");
      }
    }
    expect(stepLabelKey("PICKED_UP", "RETURN_PICKUP")).toBe("steps.PICKED_UP_FROM_YOU");
    expect(resolve("en", "steps.PICKED_UP_FROM_YOU")).toBe("Picked up from you");
  });

  it("shows failed and cancelled the same way to the customer", () => {
    expect(statusLabelKey("FAILED")).toBe(statusLabelKey("CANCELLED"));
    expect(statusTone("FAILED")).toBe("danger");
    expect(statusTone("DELIVERED")).toBe("success");
  });
});
