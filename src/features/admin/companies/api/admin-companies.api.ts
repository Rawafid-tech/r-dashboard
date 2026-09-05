import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type { AdminUser } from "@/features/admin/users/types";
import type { Subscription } from "@/features/subscription/types";
import type {
  AdminCompaniesListParams,
  AdminCompany,
  AssignSubscriptionRequest,
} from "@/features/admin/companies/types";
import type {
  AdminWallet,
  AdminWalletTransaction,
  WalletAdjustmentRequest,
  WalletTransactionsListParams,
} from "@/features/wallet/types";

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

export async function assignAdminCompanySubscription(
  companyId: string,
  body: AssignSubscriptionRequest,
): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>(
    `/api/admin/companies/${companyId}/subscription`,
    body,
  );
  return data;
}

export async function getAdminCompanyWallet(
  companyId: string,
): Promise<AdminWallet> {
  const { data } = await apiClient.get<AdminWallet>(
    `/api/admin/companies/${companyId}/wallet`,
  );
  return data;
}

export async function getAdminCompanyWalletTransactions(
  companyId: string,
  params: WalletTransactionsListParams = {},
): Promise<PaginatedResponse<AdminWalletTransaction>> {
  const { data } = await apiClient.get<
    PaginatedResponse<AdminWalletTransaction>
  >(`/api/admin/companies/${companyId}/wallet/transactions`, { params });
  return data;
}

export async function adjustAdminCompanyWallet(
  companyId: string,
  body: WalletAdjustmentRequest,
): Promise<AdminWalletTransaction> {
  const response = await apiClient.post<AdminWalletTransaction>(
    `/api/admin/companies/${companyId}/wallet/adjustments`,
    body,
    {
      validateStatus: (status) => status === 200 || status === 201,
    },
  );
  return response.data;
}
