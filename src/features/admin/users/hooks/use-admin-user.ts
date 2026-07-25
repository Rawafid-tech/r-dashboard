import { useQuery } from "@tanstack/react-query";
import { getAdminUser } from "@/features/admin/users/api/admin-users.api";
import { adminUsersQueryKeys } from "@/features/admin/users/hooks/use-admin-users";

export function useAdminUser(userId: string | undefined) {
  return useQuery({
    queryKey: adminUsersQueryKeys.detail(userId ?? ""),
    queryFn: () => getAdminUser(userId!),
    enabled: Boolean(userId),
  });
}
