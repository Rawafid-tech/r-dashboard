import { useQuery } from "@tanstack/react-query";
import { getAdminCompanyUsers } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";

export function useAdminCompanyUsers(companyId: string | undefined) {
  return useQuery({
    queryKey: adminCompaniesQueryKeys.users(companyId ?? ""),
    queryFn: () => getAdminCompanyUsers(companyId!),
    enabled: Boolean(companyId),
  });
}
