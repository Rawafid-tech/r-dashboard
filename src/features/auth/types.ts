import type { MonthlyShipmentVolume, MerchantRole, UserStatus } from "@/shared/types/enums";

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  password: string;
  phone: string;
  shipFromCountry: string;
  monthlyShipmentVolume: MonthlyShipmentVolume;
  companyName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string | null;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  verified: boolean;
  role: MerchantRole;
  /** Effective permission codes for this user (from assigned role; owners receive the full set). */
  permissions: string[];
  status: UserStatus;
  avatarUrl: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  /** Exactly 6 numeric digits — keep as string to preserve leading zeros. */
  code: string;
  newPassword: string;
}
