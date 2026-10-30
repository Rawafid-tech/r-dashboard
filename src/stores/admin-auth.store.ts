import { create } from "zustand";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "@/shared/lib/auth-tokens";
import { resetServerState } from "@/shared/api/query-client";

interface AdminAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    expiresIn?: number,
  ) => void;
  clearTokens: () => void;
}

/**
 * The access cookie expires after ~15 minutes, but the refresh cookie lasts
 * days; the API client refreshes on the first 401, so either token is enough.
 */
function hasSession() {
  return !!(getAccessToken("admin") || getRefreshToken("admin"));
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: getAccessToken("admin"),
  refreshToken: getRefreshToken("admin"),
  isAuthenticated: hasSession(),

  setTokens: (accessToken, refreshToken, expiresIn) => {
    resetServerState();
    setAuthTokens("admin", accessToken, refreshToken, expiresIn);
    set({
      accessToken: getAccessToken("admin"),
      refreshToken: getRefreshToken("admin"),
      isAuthenticated: hasSession(),
    });
  },

  clearTokens: () => {
    clearAuthTokens("admin");
    resetServerState();
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
