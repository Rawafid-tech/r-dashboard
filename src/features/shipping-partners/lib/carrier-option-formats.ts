import type { CarrierField } from "@/features/shipping-partners/types";

/**
 * Formats some TEXT options must follow. The API has no field kind for these
 * yet, so the option key decides:
 * - `mobile`: Turbo's `followupPhone` (2026-11-05 Turbo Part 1).
 * - `digits`: Mylerz's `merchantId` (2026-11-06 Mylerz Part 1).
 */
export type CarrierOptionFormat = "mobile" | "digits";

const OPTION_FORMATS: ReadonlyMap<string, CarrierOptionFormat> = new Map([
  ["followupPhone", "mobile"],
  ["merchantId", "digits"],
]);

/** Egyptian mobile: 01[0125] + 8 digits, with an optional +20 / 0020 prefix. */
const EGYPTIAN_MOBILE = /^(?:\+20|0020|20)?0?1[0125]\d{8}$/;
const DIGITS_ONLY = /^\d+$/;

const ARABIC_INDIC_ZERO = 0x0660;
const EASTERN_ARABIC_INDIC_ZERO = 0x06f0;

export function optionFormat(
  field: Pick<CarrierField, "key" | "kind">,
): CarrierOptionFormat | null {
  if (field.kind !== "TEXT") return null;
  return OPTION_FORMATS.get(field.key) ?? null;
}

/** Latin digits, with spaces, dashes, dots and brackets removed. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - ARABIC_INDIC_ZERO),
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - EASTERN_ARABIC_INDIC_ZERO),
    )
    .replace(/[\s\-().]/g, "");
}

export function isEgyptianMobile(value: string): boolean {
  return EGYPTIAN_MOBILE.test(normalizeDigits(value));
}

export function isDigitsOnly(value: string): boolean {
  return DIGITS_ONLY.test(normalizeDigits(value));
}

/** Whether a non-empty value fits its format; values without one always do. */
export function matchesOptionFormat(
  format: CarrierOptionFormat | null,
  value: string,
): boolean {
  if (format === "mobile") return isEgyptianMobile(value);
  if (format === "digits") return isDigitsOnly(value);
  return true;
}

/** The value to send: formatted options are sent normalized, others trimmed. */
export function optionValueToSend(
  format: CarrierOptionFormat | null,
  value: string,
): string {
  return format ? normalizeDigits(value) : value.trim();
}
