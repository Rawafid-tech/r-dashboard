import type { CarrierField } from "@/features/shipping-partners/types";

/**
 * TEXT options that hold a mobile number the carrier calls, e.g. Turbo's
 * `followupPhone` (2026-11-05 Turbo Part 1). The API has no phone kind yet.
 */
const MOBILE_OPTION_KEYS: ReadonlySet<string> = new Set(["followupPhone"]);

/** Egyptian mobile: 01[0125] + 8 digits, with an optional +20 / 0020 prefix. */
const EGYPTIAN_MOBILE = /^(?:\+20|0020|20)?0?1[0125]\d{8}$/;

const ARABIC_INDIC_ZERO = 0x0660;
const EASTERN_ARABIC_INDIC_ZERO = 0x06f0;

export function isMobileOptionField(field: Pick<CarrierField, "key" | "kind">): boolean {
  return field.kind === "TEXT" && MOBILE_OPTION_KEYS.has(field.key);
}

/** Latin digits, no spaces, dashes or brackets: what the carrier expects. */
export function normalizeMobile(value: string): string {
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
  return EGYPTIAN_MOBILE.test(normalizeMobile(value));
}
