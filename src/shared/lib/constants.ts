// Always use same-origin `/api`. In dev, Vite proxies to the API host.
// In production, Vercel rewrites `/api/*` to the API host (see `vercel.json`).
// This avoids CORS entirely because the browser sees requests as same-origin.
export const API_BASE_URL = "";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "rawafid-access-token",
  REFRESH_TOKEN: "rawafid-refresh-token",
  ADMIN_ACCESS_TOKEN: "rawafid-admin-access-token",
  ADMIN_REFRESH_TOKEN: "rawafid-admin-refresh-token",
  THEME: "rawafid-theme",
  LOCALE: "rawafid-locale",
  SIDEBAR_COLLAPSED: "rawafid-sidebar-collapsed",
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

/** Google Maps JavaScript API key (Maps + Places for coordinate picker). */
export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";

/** Merchant billing upgrade / support contact. */
export const SUPPORT_EMAIL = "support@rawafid.com";