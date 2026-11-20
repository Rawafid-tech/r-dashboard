import type {
  Shipment,
  ShipmentCarrierState,
} from "@/features/shipments/types";

/**
 * The carrier gave this booking a tracking number another shipment still
 * holds; the booking stays in `BOOKING` until support checks both.
 */
export const TRACKING_NUMBER_TAKEN = "shipment.trackingNumberTaken";

/** Carrier-state codes Rawafid sets itself, without a carrier label. */
const KNOWN_CARRIER_CODES: ReadonlySet<string> = new Set(["NUMBER_REUSED"]);

/**
 * A `BOOKING` shipment with a `failure` is held for support, not still
 * booking: the parcel exists at the carrier, so it must not be booked again.
 */
export function isHeldForSupport(
  shipment: Pick<Shipment, "status" | "failure"> | null | undefined,
): boolean {
  return shipment?.status === "BOOKING" && shipment.failure != null;
}

/**
 * Text for a carrier state: the carrier's own label, else Rawafid's text for
 * a code it set itself. Null when there is nothing worth showing.
 */
export function carrierStateText(
  state: ShipmentCarrierState | null | undefined,
  t: (key: string) => string,
): string | null {
  if (!state) return null;
  const label = state.label?.trim();
  if (label) return label;
  if (KNOWN_CARRIER_CODES.has(state.code)) {
    return t(`carrierCodes.${state.code}`);
  }
  return null;
}
