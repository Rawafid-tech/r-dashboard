import { apiClient } from "@/shared/api/client";
import type { TokenResponse } from "@/shared/types/api";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "@/features/auth/types";

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

/**
 * Request a password-reset code.
 * Always returns 202 regardless of whether the email is registered —
 * never expose to the UI whether an account exists for an address.
 */
export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<void> {
  await apiClient.post("/api/auth/password/forgot", payload);
}

/**
 * Consume the 6-digit code and set a new password.
 * Returns 204. All sessions for the user are revoked — redirect to /login.
 */
export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<void> {
  await apiClient.post("/api/auth/password/reset", payload);
}
