// In local Vite dev, use same-origin `/api` (proxied). In production builds, hit the API host.
export const API_BASE_URL = import.meta.env.DEV
  ? ""
  : "https://rawafid.softizone.net";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "rawafid-access-token",
  REFRESH_TOKEN: "rawafid-refresh-token",
  THEME: "rawafid-theme",
  LOCALE: "rawafid-locale",
} as const;

/** Access token TTL fallback when API omits `expiresIn` (15 minutes). */
export const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 900;

/** Refresh token lifetime per API contract (7 days). */
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "ar";

export const DEFAULT_THEME = "dark" as const;
export type DefaultTheme = typeof DEFAULT_THEME;