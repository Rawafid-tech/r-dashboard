import {
  DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  STORAGE_KEYS,
} from "@/shared/lib/constants";
import { getCookie, removeCookie, setCookie } from "@/shared/lib/cookies";

export function getAccessToken(): string | null {
  return getCookie(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return getCookie(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn = DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS,
) {
  if (!accessToken.trim() || !refreshToken.trim()) return;

  setCookie(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
    maxAgeSeconds: expiresIn,
  });
  setCookie(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
    maxAgeSeconds: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearAuthTokens() {
  removeCookie(STORAGE_KEYS.ACCESS_TOKEN);
  removeCookie(STORAGE_KEYS.REFRESH_TOKEN);
}

/** One-time cleanup after moving token storage from localStorage to cookies. */
export function migrateLegacyTokenStorage() {
  if (typeof localStorage === "undefined") return;

  const legacyAccess = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const legacyRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (legacyAccess && legacyRefresh && !getAccessToken()) {
    setAuthTokens(legacyAccess, legacyRefresh);
  }

  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}
