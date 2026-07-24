export const API_BASE_URL = "https://rawafid.softizone.net";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "rawafid-access-token",
  REFRESH_TOKEN: "rawafid-refresh-token",
  THEME: "rawafid-theme",
  LOCALE: "rawafid-locale",
} as const;

export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "ar";
