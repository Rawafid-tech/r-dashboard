import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAdminCompanyWalletTransactions } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";
import type { WalletTransactionsListParams } from "@/features/wallet/types";

interface UseAdminCompanyWalletTransactionsOptions {
  enabled?: boolean;
}

export function useAdminCompanyWalletTransactions(
  companyId: string | undefined,
  params: WalletTransactionsListParams,
  options: UseAdminCompanyWalletTransactionsOptions = {},
) {
  return useQuery({
    queryKey: adminCompaniesQueryKeys.walletTransactions(companyId ?? "", params),
    queryFn: () => getAdminCompanyWalletTransactions(companyId!, params),
    placeholderData: keepPreviousData,
    enabled: Boolean(companyId) && (options.enabled ?? true),
  });
}
