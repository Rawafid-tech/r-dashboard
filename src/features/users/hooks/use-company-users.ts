import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCompanyUsers } from "@/features/users/api/users.api";
import type { UsersListParams } from "@/features/users/types";

export const usersQueryKeys = {
  all: ["company-users"] as const,
  lists: () => [...usersQueryKeys.all, "list"] as const,
  list: (params: UsersListParams) =>
    [...usersQueryKeys.lists(), params] as const,
  details: () => [...usersQueryKeys.all, "detail"] as const,
  detail: (userId: string) => [...usersQueryKeys.details(), userId] as const,
};

interface UseCompanyUsersOptions {
  enabled?: boolean;
}

export function useCompanyUsers(
  params: UsersListParams,
  options: UseCompanyUsersOptions = {},
) {
  return useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: () => getCompanyUsers(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
