import { useQuery } from "@tanstack/react-query";
import { listAdminCompanyRefundTotals } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";

interface UseAdminCompanyWalletRefundsOptions {
  enabled?: boolean;
}

export function useAdminCompanyWalletRefunds(
  companyId: string | undefined,
  options: UseAdminCompanyWalletRefundsOptions = {},
) {
  return useQuery({
    queryKey: adminCompaniesQueryKeys.walletRefunds(companyId ?? ""),
    queryFn: () => listAdminCompanyRefundTotals(companyId!),
    enabled: Boolean(companyId) && (options.enabled ?? true),
  });
}
