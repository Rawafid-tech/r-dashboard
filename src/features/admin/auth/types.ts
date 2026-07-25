import type { AdminRole, UserStatus } from "@/shared/types/enums";

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: UserStatus;
}
