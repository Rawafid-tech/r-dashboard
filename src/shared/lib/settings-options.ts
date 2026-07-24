import { FontScale } from "@/shared/types/enums";

/** Common IANA zones for merchant operations — validated server-side on save. */
export const SETTINGS_TIMEZONES = [
  "Africa/Cairo",
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Kuwait",
  "Asia/Qatar",
  "Asia/Bahrain",
  "Asia/Muscat",
  "Asia/Amman",
  "Europe/London",
  "UTC",
] as const;

export type SettingsTimezone = (typeof SETTINGS_TIMEZONES)[number];

/** Stored verbatim by the API — align with merchant route paths. */
export const DEFAULT_HOME_PAGES = [
  { value: "home", route: "/" },
  { value: "shipments", route: "/shipments" },
  { value: "returns", route: "/returns" },
  { value: "products", route: "/products" },
  { value: "wallet", route: "/wallet" },
] as const;

export const FONT_SCALE_OPTIONS = FontScale;
