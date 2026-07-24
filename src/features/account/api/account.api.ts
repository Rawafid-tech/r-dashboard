import { apiClient } from "@/shared/api/client";
import type { User } from "@/features/auth/types";

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/api/auth/me");
  return data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiClient.post("/api/auth/logout", { refreshToken });
}
