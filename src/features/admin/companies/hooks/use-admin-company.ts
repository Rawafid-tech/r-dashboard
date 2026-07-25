import { useQuery } from "@tanstack/react-query";
import { getAdminCompany } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";

export function useAdminCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: adminCompaniesQueryKeys.detail(companyId ?? ""),
    queryFn: () => getAdminCompany(companyId!),
    enabled: Boolean(companyId),
  });
}
