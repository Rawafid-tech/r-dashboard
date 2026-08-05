import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type {
  RoleDetail,
  RoleListItem,
  RolesListParams,
  RoleUpsertPayload,
} from "@/features/roles/types";

export async function getRoles(
  params: RolesListParams = {},
): Promise<PaginatedResponse<RoleListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<RoleListItem>>(
    "/api/roles",
    { params },
  );
  return data;
}

export async function getRole(roleId: string): Promise<RoleDetail> {
  const { data } = await apiClient.get<RoleDetail>(`/api/roles/${roleId}`);
  return data;
}

export async function createRole(
  payload: RoleUpsertPayload,
): Promise<RoleDetail> {
  const { data } = await apiClient.post<RoleDetail>("/api/roles", payload);
  return data;
}

export async function updateRole(
  roleId: string,
  payload: RoleUpsertPayload,
): Promise<RoleDetail> {
  const { data } = await apiClient.put<RoleDetail>(
    `/api/roles/${roleId}`,
    payload,
  );
  return data;
}

export async function deleteRole(roleId: string): Promise<void> {
  await apiClient.delete(`/api/roles/${roleId}`);
}
