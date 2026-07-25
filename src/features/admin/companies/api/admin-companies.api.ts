import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type { AdminUser } from "@/features/admin/users/types";
import type { Subscription } from "@/features/subscription/types";
import type {
  AdminCompaniesListParams,
  AdminCompany,
} from "@/features/admin/companies/types";

export async function getAdminCompanies(
  params: AdminCompaniesListParams = {},
): Promise<PaginatedResponse<AdminCompany>> {
  const { data } = await apiClient.get<PaginatedResponse<AdminCompany>>(
    "/api/admin/companies",
    { params },
  );
  return data;
}

export async function getAdminCompany(companyId: string): Promise<AdminCompany> {
  const { data } = await apiClient.get<AdminCompany>(
    `/api/admin/companies/${companyId}`,
  );
  return data;
}

export async function getAdminCompanySubscriptions(
  companyId: string,
): Promise<Subscription[]> {
  const { data } = await apiClient.get<Subscription[]>(
    `/api/admin/companies/${companyId}/subscriptions`,
  );
  return data;
}

export async function getAdminCompanyUsers(
  companyId: string,
): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUser[]>(
    `/api/admin/companies/${companyId}/users`,
  );
  return data;
}
