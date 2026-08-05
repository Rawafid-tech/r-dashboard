import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRoles } from "@/features/roles/api/roles.api";
import type { RolesListParams } from "@/features/roles/types";

export const rolesQueryKeys = {
  all: ["roles"] as const,
  lists: () => [...rolesQueryKeys.all, "list"] as const,
  list: (params: RolesListParams) =>
    [...rolesQueryKeys.lists(), params] as const,
  details: () => [...rolesQueryKeys.all, "detail"] as const,
  detail: (roleId: string) => [...rolesQueryKeys.details(), roleId] as const,
};

interface UseRolesOptions {
  enabled?: boolean;
}

export function useRoles(
  params: RolesListParams,
  options: UseRolesOptions = {},
) {
  return useQuery({
    queryKey: rolesQueryKeys.list(params),
    queryFn: () => getRoles(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
