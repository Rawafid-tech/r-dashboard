import { useQuery } from "@tanstack/react-query";
import { getAdminCompanySubscriptions } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";

export function useAdminCompanySubscriptions(companyId: string | undefined) {
  return useQuery({
    queryKey: adminCompaniesQueryKeys.subscriptions(companyId ?? ""),
    queryFn: () => getAdminCompanySubscriptions(companyId!),
    enabled: Boolean(companyId),
  });
}
