import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  type AuthPlane,
} from "@/shared/lib/auth-tokens";
import { API_BASE_URL, STORAGE_KEYS } from "@/shared/lib/constants";
import type { TokenResponse } from "@/shared/types/api";
import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { useAuthStore } from "@/stores/auth.store";
import { loginUrlReturningHere } from "@/features/auth/lib/return-to";

/** Auth endpoints that must never trigger the token-refresh interceptor. */
const NO_REFRESH_URLS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/invitation/accept",
  "/api/admin/auth/login",
  "/api/admin/auth/refresh",
] as const;

/** Login/register — do not attach a stale Bearer token. */
const PUBLIC_AUTH_URLS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/invitation/accept",
  "/api/admin/auth/login",
] as const;

function matchesUrl(url: string | undefined, paths: readonly string[]) {
  if (!url) return false;
  return paths.some((path) => url.includes(path));
}

function resolveAuthPlane(url: string | undefined): AuthPlane {
  return url?.startsWith("/api/admin/") ? "admin" : "merchant";
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const REFRESH_TIMEOUT_MS = 15_000;

/** One in-flight refresh per plane; concurrent 401s wait on the same one. */
const pendingRefresh: Partial<Record<AuthPlane, Promise<string>>> = {};

/**
 * The access token another tab produced, if it already rotated the refresh token we hold. Refresh
 * tokens are single-use, so the second tab's refresh would be refused and must not log anyone out.
 */
function tokenRotatedElsewhere(plane: AuthPlane, refreshToken: string): string | null {
  const latest = getRefreshToken(plane);
  if (!latest || latest === refreshToken) return null;
  return getAccessToken(plane) ?? null;
}

function refreshAccessToken(plane: AuthPlane, refreshToken: string) {
  const pending = pendingRefresh[plane];
  if (pending) return pending;

  const refreshUrl =
    plane === "admin" ? "/api/admin/auth/refresh" : "/api/auth/refresh";

  const doRefresh = async () => {
    // Another tab may have refreshed while this one waited for the lock.
    const rotated = tokenRotatedElsewhere(plane, refreshToken);
    if (rotated) return rotated;

    const { data } = await axios.post<TokenResponse>(
      `${API_BASE_URL || ""}${refreshUrl}`,
      { refreshToken },
      { timeout: REFRESH_TIMEOUT_MS },
    );
    setAuthTokens(plane, data.accessToken, data.refreshToken, data.expiresIn);
    syncAuthStore(plane, data.accessToken, data.refreshToken);
    return data.accessToken;
  };

  // One refresh at a time across all tabs of this browser (the cookies are shared).
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  const request = (locks ? locks.request(`rawafid-refresh-${plane}`, doRefresh) : doRefresh()).finally(() => {
    delete pendingRefresh[plane];
  });

  pendingRefresh[plane] = request;
  return request;
}

/** True when the refresh endpoint itself refused the token (the session is really over). */
function refreshWasRefused(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 400 || status === 401 || status === 403;
}

function syncAuthStore(plane: AuthPlane, accessToken: string, refreshToken: string) {
  if (plane === "admin") {
    useAdminAuthStore.setState({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
    return;
  }

  useAuthStore.setState({
    accessToken,
    refreshToken,
    isAuthenticated: true,
  });
}

apiClient.interceptors.request.use((config) => {
  const plane = resolveAuthPlane(config.url);
  const token = getAccessToken(plane);

  if (token && !matchesUrl(config.url, PUBLIC_AUTH_URLS)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const locale = localStorage.getItem(STORAGE_KEYS.LOCALE) || "ar";
  config.headers["Accept-Language"] = locale;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      matchesUrl(originalRequest.url, NO_REFRESH_URLS)
    ) {
      return Promise.reject(error);
    }

    const plane = resolveAuthPlane(originalRequest.url);
    originalRequest._retry = true;

    // Another request (or tab, via the shared cookie) may already have
    // rotated the token since this one was sent; retry with it directly.
    const sentToken = String(originalRequest.headers?.Authorization ?? "").replace(
      /^Bearer /,
      "",
    );
    const currentToken = getAccessToken(plane);
    if (currentToken && currentToken !== sentToken) {
      originalRequest.headers.Authorization = `Bearer ${currentToken}`;
      return apiClient(originalRequest);
    }

    const refreshToken = getRefreshToken(plane);
    if (!refreshToken) {
      redirectToLogin(plane);
      return Promise.reject(error);
    }

    try {
      const accessToken = await refreshAccessToken(plane, refreshToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      if (refreshWasRefused(refreshError)) {
        // Last chance: another tab may have rotated the token just before ours was refused.
        const rotated = tokenRotatedElsewhere(plane, refreshToken);
        if (rotated) {
          originalRequest.headers.Authorization = `Bearer ${rotated}`;
          return apiClient(originalRequest);
        }
        redirectToLogin(plane);
      }
      // A timeout, offline, 5xx or 429 is not the end of the session: keep the tokens (and any
      // half-filled form) and let this request fail; the next one refreshes again.
      return Promise.reject(refreshError);
    }
  },
);

function redirectToLogin(plane: AuthPlane) {
  if (plane === "admin") {
    useAdminAuthStore.getState().clearTokens();
    const loginPath = "/admin/login";
    if (window.location.pathname === loginPath) return;
    window.location.href = loginPath;
    return;
  }

  useAuthStore.getState().clearTokens();
  const loginPath = "/login";
  if (window.location.pathname === loginPath) return;
  // Come back to this page (query included) after signing in again.
  window.location.href = loginUrlReturningHere(loginPath);
}
