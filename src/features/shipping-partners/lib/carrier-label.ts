import type { CarrierSummary } from "@/features/shipping-partners/types";

export function carrierDisplayName(
  carrier: Pick<CarrierSummary, "nameEn" | "nameAr" | "code"> & {
    nameEn?: string;
    nameAr?: string;
  },
  locale: string,
): string {
  const arabic = locale.startsWith("ar");
  const localized = arabic ? carrier.nameAr : carrier.nameEn;
  const fallback = arabic ? carrier.nameEn : carrier.nameAr;
  return localized || fallback || carrier.code;
}

export function credentialMask(hint: string | null | undefined): string {
  if (!hint) return "••••";
  return `••••${hint}`;
}
