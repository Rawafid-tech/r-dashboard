import { useQuery } from "@tanstack/react-query";
import { getAdminMe } from "@/features/admin/auth/api/admin-auth.api";

export const adminAuthQueryKeys = {
  all: ["admin-auth"] as const,
  me: () => [...adminAuthQueryKeys.all, "me"] as const,
};

export function useAdminMe() {
  return useQuery({
    queryKey: adminAuthQueryKeys.me(),
    queryFn: getAdminMe,
  });
}
