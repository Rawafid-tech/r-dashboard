import { isProductHandling } from "@/features/products/schema";
import {
  PRODUCT_HANDLING_VALUES,
  type ProductHandling,
} from "@/features/products/types";
import type { SupportedLocale } from "@/shared/lib/constants";

const HANDLING_LABELS: Record<SupportedLocale, Record<ProductHandling, string>> =
  {
    en: {
      GENERAL: "General",
      FRAGILE: "Fragile",
      LIQUID: "Liquid",
      BATTERY: "Battery",
      FLAMMABLE: "Flammable",
    },
    ar: {
      GENERAL: "عام",
      FRAGILE: "قابل للكسر",
      LIQUID: "سائل",
      BATTERY: "بطارية",
      FLAMMABLE: "قابل للاشتعال",
    },
  };

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

const LABEL_TO_KEY = new Map<string, ProductHandling>();

for (const key of PRODUCT_HANDLING_VALUES) {
  LABEL_TO_KEY.set(normalize(key), key);
  LABEL_TO_KEY.set(normalize(HANDLING_LABELS.en[key]), key);
  LABEL_TO_KEY.set(normalize(HANDLING_LABELS.ar[key]), key);
}

export function handlingLabel(
  key: ProductHandling,
  locale: SupportedLocale,
): string {
  return HANDLING_LABELS[locale][key];
}

export function handlingLabelsForLocale(locale: SupportedLocale): string[] {
  return PRODUCT_HANDLING_VALUES.map((key) => HANDLING_LABELS[locale][key]);
}

export function resolveHandlingValue(value: string): string {
  return LABEL_TO_KEY.get(normalize(value)) ?? value.trim();
}

export function enumDisplayValue(
  columnKey: string,
  rawValue: string,
  locale: SupportedLocale,
): string {
  if (columnKey === "handling" && isProductHandling(rawValue)) {
    return handlingLabel(rawValue, locale);
  }

  return rawValue;
}
