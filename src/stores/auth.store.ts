import { create } from "zustand";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  migrateLegacyTokenStorage,
  setAuthTokens,
} from "@/shared/lib/auth-tokens";
import { resetServerState } from "@/shared/api/query-client";

migrateLegacyTokenStorage();

interface AuthState {
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
  return !!(getAccessToken("merchant") || getRefreshToken("merchant"));
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getAccessToken("merchant"),
  refreshToken: getRefreshToken("merchant"),
  isAuthenticated: hasSession(),

  setTokens: (accessToken, refreshToken, expiresIn) => {
    resetServerState();
    setAuthTokens("merchant", accessToken, refreshToken, expiresIn);
    set({
      accessToken: getAccessToken("merchant"),
      refreshToken: getRefreshToken("merchant"),
      isAuthenticated: hasSession(),
    });
  },

  clearTokens: () => {
    clearAuthTokens("merchant");
    resetServerState();
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
