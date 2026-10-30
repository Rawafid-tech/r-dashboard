/**
 * Carriers whose courier collects their own delivery charge on top of the
 * amount to collect (Wavex 2026-10-24 Part 1). The API has no flag for this yet.
 */
const CARRIERS_ADDING_COD_FEE: ReadonlySet<string> = new Set(["wavex"]);

/**
 * Whether the customer pays more than the amount to collect. A shipment with
 * nothing to collect is sent as prepaid, so the courier collects nothing.
 */
export function carrierAddsCodFee(
  carrierCode: string | null | undefined,
  codAmount: number | null | undefined,
): boolean {
  if (!carrierCode || !codAmount || codAmount <= 0) return false;
  return CARRIERS_ADDING_COD_FEE.has(carrierCode);
}
