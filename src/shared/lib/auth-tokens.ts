import {
  DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  STORAGE_KEYS,
} from "@/shared/lib/constants";
import { getCookie, removeCookie, setCookie } from "@/shared/lib/cookies";

export type AuthPlane = "merchant" | "admin";

function tokenKeys(plane: AuthPlane) {
  return plane === "admin"
    ? {
        access: STORAGE_KEYS.ADMIN_ACCESS_TOKEN,
        refresh: STORAGE_KEYS.ADMIN_REFRESH_TOKEN,
      }
    : {
        access: STORAGE_KEYS.ACCESS_TOKEN,
        refresh: STORAGE_KEYS.REFRESH_TOKEN,
      };
}

export function getAccessToken(plane: AuthPlane = "merchant"): string | null {
  return getCookie(tokenKeys(plane).access);
}

export function getRefreshToken(plane: AuthPlane = "merchant"): string | null {
  return getCookie(tokenKeys(plane).refresh);
}

export function setAuthTokens(
  plane: AuthPlane,
  accessToken: string,
  refreshToken: string,
  expiresIn = DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS,
) {
  if (!accessToken.trim() || !refreshToken.trim()) return;

  const keys = tokenKeys(plane);
  setCookie(keys.access, accessToken, { maxAgeSeconds: expiresIn });
  setCookie(keys.refresh, refreshToken, {
    maxAgeSeconds: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearAuthTokens(plane: AuthPlane) {
  const keys = tokenKeys(plane);
  removeCookie(keys.access);
  removeCookie(keys.refresh);
}

/** One-time cleanup after moving merchant token storage from localStorage to cookies. */
export function migrateLegacyTokenStorage() {
  if (typeof localStorage === "undefined") return;

  const legacyAccess = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const legacyRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (legacyAccess && legacyRefresh && !getAccessToken("merchant")) {
    setAuthTokens("merchant", legacyAccess, legacyRefresh);
  }

  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}
