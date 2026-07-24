import { useQuery } from "@tanstack/react-query";
import { getCompany } from "@/features/company/api/company.api";

export const companyQueryKeys = {
  all: ["company"] as const,
  detail: () => [...companyQueryKeys.all, "detail"] as const,
};

export function useCompany() {
  return useQuery({
    queryKey: companyQueryKeys.detail(),
    queryFn: getCompany,
  });
}
