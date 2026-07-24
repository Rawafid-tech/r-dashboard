import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "@/shared/lib/auth-tokens";
import { API_BASE_URL, STORAGE_KEYS } from "@/shared/lib/constants";
import type { TokenResponse } from "@/shared/types/api";
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

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
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

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      const isAdminRoute = originalRequest.url?.startsWith("/api/admin/");
      const refreshUrl = isAdminRoute
        ? "/api/admin/auth/refresh"
        : "/api/auth/refresh";

      const { data } = await axios.post<TokenResponse>(
        `${API_BASE_URL || ""}${refreshUrl}`,
        { refreshToken },
      );

      setAuthTokens(data.accessToken, data.refreshToken, data.expiresIn);
      useAuthStore.setState({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
      });

      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

function redirectToLogin() {
  useAuthStore.getState().clearTokens();

  const loginPath = window.location.pathname.startsWith("/admin")
    ? "/admin/login"
    : "/login";

  // Already on a guest auth page — avoid a full reload that hides error toasts.
  if (window.location.pathname === loginPath) return;

  window.location.href = loginPath;
}
