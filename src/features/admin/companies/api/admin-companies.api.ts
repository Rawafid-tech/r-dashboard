import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type { AdminUser } from "@/features/admin/users/types";
import type { Subscription } from "@/features/subscription/types";
import type {
  AdminCompaniesListParams,
  AdminCompany,
  AssignSubscriptionRequest,
} from "@/features/admin/companies/types";
import { sumRefundedCents } from "@/features/wallet/lib/wallet-refund";
import type {
  AdminWallet,
  AdminWalletTransaction,
  WalletAdjustmentRequest,
  WalletRefundRequest,
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

const REFUND_PAGE_SIZE = 100;
const MAX_REFUND_PAGES = 20;

/**
 * Pages through REFUND rows and sums them per charge, in cents.
 * A truncated index can only over-state what is left; the server still rejects an over-refund.
 */
export async function listAdminCompanyRefundTotals(
  companyId: string,
): Promise<Record<string, number>> {
  const totals: Record<string, number> = {};
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < MAX_REFUND_PAGES) {
    const data = await getAdminCompanyWalletTransactions(companyId, {
      page,
      size: REFUND_PAGE_SIZE,
      sort: "CREATED_AT",
      direction: "DESC",
      type: "REFUND",
    });

    const pageTotals = sumRefundedCents(data.content);
    for (const [chargeId, cents] of Object.entries(pageTotals)) {
      totals[chargeId] = (totals[chargeId] ?? 0) + cents;
    }

    totalPages = data.totalPages;
    if (data.content.length === 0) break;
    page += 1;
  }

  return totals;
}

export async function refundAdminCompanyWallet(
  companyId: string,
  transactionId: string,
  body: WalletRefundRequest,
): Promise<AdminWalletTransaction> {
  const response = await apiClient.post<AdminWalletTransaction>(
    `/api/admin/companies/${companyId}/wallet/transactions/${transactionId}/refunds`,
    body,
    {
      validateStatus: (status) => status === 200 || status === 201,
    },
  );
  return response.data;
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
