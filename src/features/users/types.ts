import type { UserStatus } from "@/shared/types/enums";

export type UsersSortField = "CREATED_AT" | "NAME" | "EMAIL";

export interface UsersListParams {
  page?: number;
  size?: number;
  sort?: UsersSortField;
  direction?: "ASC" | "DESC";
  search?: string;
}

export interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  verified: boolean;
  roleId: string | null;
  roleName: string;
  owner: boolean;
  status: UserStatus;
  createdAt: string;
}

export interface InviteUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId?: string | null;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: string | null;
}

export interface UpdateUserRolePayload {
  roleId: string | null;
}

export interface SetUserPasswordPayload {
  newPassword: string;
}

export interface RevealInviteLinkResponse {
  link: string;
}
