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

/** Auth endpoints that must never trigger the token-refresh interceptor. */
const NO_REFRESH_URLS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/admin/auth/login",
  "/api/admin/auth/refresh",
] as const;

/** Login/register — do not attach a stale Bearer token. */
const PUBLIC_AUTH_URLS = [
  "/api/auth/login",
  "/api/auth/register",
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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
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

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken(plane);
    if (!refreshToken) {
      isRefreshing = false;
      redirectToLogin(plane);
      return Promise.reject(error);
    }

    try {
      const refreshUrl =
        plane === "admin" ? "/api/admin/auth/refresh" : "/api/auth/refresh";

      const { data } = await axios.post<TokenResponse>(
        `${API_BASE_URL || ""}${refreshUrl}`,
        { refreshToken },
      );

      setAuthTokens(
        plane,
        data.accessToken,
        data.refreshToken,
        data.expiresIn,
      );
      syncAuthStore(plane, data.accessToken, data.refreshToken);

      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin(plane);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
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
  window.location.href = loginPath;
}
