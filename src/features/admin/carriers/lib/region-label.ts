import type { CarrierUnmappedCity } from "@/features/admin/carriers/types";

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

export function localizedName(
  nameEn: string | null | undefined,
  nameAr: string | null | undefined,
  locale: string,
): string {
  const arabic = locale.startsWith("ar");
  const primary = (arabic ? nameAr : nameEn)?.trim();
  const fallback = (arabic ? nameEn : nameAr)?.trim();
  return primary || fallback || "";
}

export function secondaryName(
  nameEn: string | null | undefined,
  nameAr: string | null | undefined,
  locale: string,
): string {
  const arabic = locale.startsWith("ar");
  const secondary = (arabic ? nameEn : nameAr)?.trim() ?? "";
  const primary = localizedName(nameEn, nameAr, locale);
  if (!secondary || secondary === primary) return "";
  return secondary;
}

export function unmappedCityLabel(
  city: CarrierUnmappedCity,
  locale: string,
): string {
  if (typeof city === "string") return city.trim();
  return (
    localizedName(city.nameEn, city.nameAr, locale) ||
    city.name?.trim() ||
    city.id?.trim() ||
    ""
  );
}

export function formatRegionChangedAt(
  iso: string | null | undefined,
  locale: string,
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const cacheKey = locale.startsWith("ar") ? "ar-EG" : "en-GB";
  let formatter = dateTimeFormatters.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(cacheKey, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    dateTimeFormatters.set(cacheKey, formatter);
  }

  return formatter.format(date);
}
