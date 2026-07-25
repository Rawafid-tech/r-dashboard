import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type {
  AdminUser,
  AdminUsersListParams,
  ModerateUserRequest,
} from "@/features/admin/users/types";

export async function getAdminUsers(
  params: AdminUsersListParams = {},
): Promise<PaginatedResponse<AdminUser>> {
  const { data } = await apiClient.get<PaginatedResponse<AdminUser>>(
    "/api/admin/users",
    { params },
  );
  return data;
}

export async function getAdminUser(userId: string): Promise<AdminUser> {
  const { data } = await apiClient.get<AdminUser>(
    `/api/admin/users/${userId}`,
  );
  return data;
}

export async function moderateAdminUser(
  userId: string,
  body: ModerateUserRequest,
): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(
    `/api/admin/users/${userId}`,
    body,
  );
  return data;
}
