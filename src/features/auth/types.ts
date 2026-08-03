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
  status: UserStatus;
  avatarUrl: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
