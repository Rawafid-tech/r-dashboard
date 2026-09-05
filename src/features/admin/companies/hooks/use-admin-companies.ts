import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAdminCompanies } from "@/features/admin/companies/api/admin-companies.api";
import type { AdminCompaniesListParams } from "@/features/admin/companies/types";
import type { WalletTransactionsListParams } from "@/features/wallet/types";

export const adminCompaniesQueryKeys = {
  all: ["admin-companies"] as const,
  lists: () => [...adminCompaniesQueryKeys.all, "list"] as const,
  list: (params: AdminCompaniesListParams) =>
    [...adminCompaniesQueryKeys.lists(), params] as const,
  details: () => [...adminCompaniesQueryKeys.all, "detail"] as const,
  detail: (companyId: string) =>
    [...adminCompaniesQueryKeys.details(), companyId] as const,
  subscriptions: (companyId: string) =>
    [...adminCompaniesQueryKeys.all, "subscriptions", companyId] as const,
  users: (companyId: string) =>
    [...adminCompaniesQueryKeys.all, "users", companyId] as const,
  wallet: (companyId: string) =>
    [...adminCompaniesQueryKeys.all, "wallet", companyId] as const,
  walletTransactions: (companyId: string, params: WalletTransactionsListParams) =>
    [...adminCompaniesQueryKeys.wallet(companyId), "transactions", params] as const,
};

export function useAdminCompanies(params: AdminCompaniesListParams) {
  return useQuery({
    queryKey: adminCompaniesQueryKeys.list(params),
    queryFn: () => getAdminCompanies(params),
    placeholderData: keepPreviousData,
  });
}
