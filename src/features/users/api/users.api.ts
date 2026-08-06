import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type {
  CompanyUser,
  InviteUserPayload,
  RevealInviteLinkResponse,
  SetUserPasswordPayload,
  UpdateUserPayload,
  UpdateUserRolePayload,
  UsersListParams,
} from "@/features/users/types";

export async function getCompanyUsers(
  params: UsersListParams = {},
): Promise<PaginatedResponse<CompanyUser>> {
  const { data } = await apiClient.get<PaginatedResponse<CompanyUser>>(
    "/api/users",
    { params },
  );
  return data;
}

export async function getCompanyUser(userId: string): Promise<CompanyUser> {
  const { data } = await apiClient.get<CompanyUser>(`/api/users/${userId}`);
  return data;
}

export async function inviteCompanyUser(
  payload: InviteUserPayload,
): Promise<CompanyUser> {
  const { data } = await apiClient.post<CompanyUser>("/api/users", payload);
  return data;
}

export async function resendUserInvite(userId: string): Promise<void> {
  await apiClient.post(`/api/users/${userId}/invite/resend`);
}

export async function revealUserInviteLink(
  userId: string,
): Promise<RevealInviteLinkResponse> {
  const { data } = await apiClient.post<RevealInviteLinkResponse>(
    `/api/users/${userId}/invite/link`,
  );
  return data;
}

export async function setCompanyUserPassword(
  userId: string,
  payload: SetUserPasswordPayload,
): Promise<CompanyUser> {
  const { data } = await apiClient.put<CompanyUser>(
    `/api/users/${userId}/password`,
    payload,
  );
  return data;
}

export async function updateCompanyUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<CompanyUser> {
  const { data } = await apiClient.put<CompanyUser>(
    `/api/users/${userId}`,
    payload,
  );
  return data;
}

export async function updateCompanyUserRole(
  userId: string,
  payload: UpdateUserRolePayload,
): Promise<CompanyUser> {
  const { data } = await apiClient.put<CompanyUser>(
    `/api/users/${userId}/role`,
    payload,
  );
  return data;
}

export async function activateCompanyUser(userId: string): Promise<CompanyUser> {
  const { data } = await apiClient.post<CompanyUser>(
    `/api/users/${userId}/activate`,
  );
  return data;
}

export async function deactivateCompanyUser(
  userId: string,
): Promise<CompanyUser> {
  const { data } = await apiClient.post<CompanyUser>(
    `/api/users/${userId}/deactivate`,
  );
  return data;
}

export async function deleteCompanyUser(userId: string): Promise<void> {
  await apiClient.delete(`/api/users/${userId}`);
}
