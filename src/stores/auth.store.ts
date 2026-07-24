import { create } from "zustand";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  migrateLegacyTokenStorage,
  setAuthTokens,
} from "@/shared/lib/auth-tokens";

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

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  isAuthenticated: !!getAccessToken(),

  setTokens: (accessToken, refreshToken, expiresIn) => {
    setAuthTokens(accessToken, refreshToken, expiresIn);
    set({
      accessToken: getAccessToken(),
      refreshToken: getRefreshToken(),
      isAuthenticated: !!getAccessToken(),
    });
  },

  clearTokens: () => {
    clearAuthTokens();
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
