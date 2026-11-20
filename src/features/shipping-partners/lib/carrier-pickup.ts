import type { Carrier } from "@/features/shipping-partners/types";

/**
 * Whether the merchant can pick where this carrier collects from. Carriers
 * such as Wingezz and Turbo collect from the address on their own account,
 * so they list no `PICKUP_LOCATION` field and have nothing to map.
 *
 * Unknown carriers (catalog still loading, or disabled since) keep the
 * pickup action, as before.
 */
export function carrierHasPickup(
  carrier: Pick<Carrier, "fields"> | null | undefined,
): boolean {
  if (!carrier) return true;
  return carrier.fields.some((field) => field.kind === "PICKUP_LOCATION");
}
