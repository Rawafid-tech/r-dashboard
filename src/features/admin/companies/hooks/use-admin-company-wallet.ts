import { useQuery } from "@tanstack/react-query";
import { getAdminCompanyWallet } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";

interface UseAdminCompanyWalletOptions {
  enabled?: boolean;
}

export function useAdminCompanyWallet(
  companyId: string | undefined,
  options: UseAdminCompanyWalletOptions = {},
) {
  return useQuery({
    queryKey: adminCompaniesQueryKeys.wallet(companyId ?? ""),
    queryFn: () => getAdminCompanyWallet(companyId!),
    enabled: Boolean(companyId) && (options.enabled ?? true),
  });
}
