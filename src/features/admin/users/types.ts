import type { MerchantRole, UserStatus } from "@/shared/types/enums";

export interface AdminUser {
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
  createdAt: string;
}

export interface ModerateUserRequest {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  status?: UserStatus;
}
