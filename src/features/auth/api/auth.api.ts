import { apiClient } from "@/shared/api/client";
import type { TokenResponse } from "@/shared/types/api";
import type { LoginRequest, RegisterRequest, User } from "@/features/auth/types";

export async function registerUser(payload: RegisterRequest): Promise<User> {
  const { data } = await apiClient.post<User>("/api/auth/register", payload);
  return data;
}

export async function loginUser(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    "/api/auth/login",
    payload,
  );
  return data;
}
