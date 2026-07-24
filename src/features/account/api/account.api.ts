import { apiClient } from "@/shared/api/client";
import type { ChangePasswordRequest, User } from "@/features/auth/types";
import type {
  UpdateProfileRequest,
  UpdateSettingsRequest,
  UserSettings,
} from "@/features/account/types";

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/api/auth/me");
  return data;
}

export async function updateMe(payload: UpdateProfileRequest): Promise<User> {
  const { data } = await apiClient.put<User>("/api/auth/me", payload);
  return data;
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<void> {
  await apiClient.post("/api/auth/me/password", payload);
}

export async function getSettings(): Promise<UserSettings> {
  const { data } = await apiClient.get<UserSettings>("/api/auth/me/settings");
  return data;
}

export async function updateSettings(
  payload: UpdateSettingsRequest,
): Promise<UserSettings> {
  const { data } = await apiClient.put<UserSettings>(
    "/api/auth/me/settings",
    payload,
  );
  return data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiClient.post("/api/auth/logout", { refreshToken });
}
