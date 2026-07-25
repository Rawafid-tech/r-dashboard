import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/features/admin/users/api/admin-users.api";
import type { AdminUsersListParams } from "@/features/admin/users/types";

export const adminUsersQueryKeys = {
  all: ["admin-users"] as const,
  lists: () => [...adminUsersQueryKeys.all, "list"] as const,
  list: (params: AdminUsersListParams) =>
    [...adminUsersQueryKeys.lists(), params] as const,
  details: () => [...adminUsersQueryKeys.all, "detail"] as const,
  detail: (userId: string) => [...adminUsersQueryKeys.details(), userId] as const,
};

export function useAdminUsers(params: AdminUsersListParams) {
  return useQuery({
    queryKey: adminUsersQueryKeys.list(params),
    queryFn: () => getAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}
