import type { LocaleMap } from "@/features/admin/plans/types";
import type { SupportedLocale } from "@/shared/lib/constants";

type MaybeLocaleMap = LocaleMap | null | undefined;

function readLocalizedText(
  map: MaybeLocaleMap,
  locale: SupportedLocale,
): string {
  if (!map) return "";

  const localized = map[locale];
  if (typeof localized === "string" && localized.trim()) {
    return localized.trim();
  }

  const en = map.en;
  if (typeof en === "string" && en.trim()) {
    return en.trim();
  }

  const ar = map.ar;
  if (typeof ar === "string" && ar.trim()) {
    return ar.trim();
  }

  return "";
}

export function getPlanDisplayName(
  name: MaybeLocaleMap,
  locale: SupportedLocale,
): string {
  return readLocalizedText(name, locale) || "—";
}

export function getPlanDescription(
  description: MaybeLocaleMap,
  locale: SupportedLocale,
): string {
  return readLocalizedText(description, locale);
}

export function getLocalizedLabel(
  map: MaybeLocaleMap,
  locale: SupportedLocale,
): string {
  return readLocalizedText(map, locale) || "—";
}
