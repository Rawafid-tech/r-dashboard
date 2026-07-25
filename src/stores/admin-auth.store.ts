import { create } from "zustand";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "@/shared/lib/auth-tokens";

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

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: getAccessToken("admin"),
  refreshToken: getRefreshToken("admin"),
  isAuthenticated: !!getAccessToken("admin"),

  setTokens: (accessToken, refreshToken, expiresIn) => {
    setAuthTokens("admin", accessToken, refreshToken, expiresIn);
    set({
      accessToken: getAccessToken("admin"),
      refreshToken: getRefreshToken("admin"),
      isAuthenticated: !!getAccessToken("admin"),
    });
  },

  clearTokens: () => {
    clearAuthTokens("admin");
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
