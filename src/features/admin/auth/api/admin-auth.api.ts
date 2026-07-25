import { apiClient } from "@/shared/api/client";
import type { TokenResponse } from "@/shared/types/api";
import type {
  AdminLoginRequest,
  AdminUser,
} from "@/features/admin/auth/types";

export async function loginAdmin(
  payload: AdminLoginRequest,
): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    "/api/admin/auth/login",
    payload,
  );
  return data;
}

export async function logoutAdmin(refreshToken: string): Promise<void> {
  await apiClient.post("/api/admin/auth/logout", { refreshToken });
}

export async function getAdminMe(): Promise<AdminUser> {
  const { data } = await apiClient.get<AdminUser>("/api/admin/auth/me");
  return data;
}
