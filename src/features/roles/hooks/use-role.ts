import { useQuery } from "@tanstack/react-query";
import { getRole } from "@/features/roles/api/roles.api";
import { rolesQueryKeys } from "@/features/roles/hooks/use-roles";

interface UseRoleOptions {
  enabled?: boolean;
}

export function useRole(roleId: string | null, options: UseRoleOptions = {}) {
  return useQuery({
    queryKey: rolesQueryKeys.detail(roleId ?? ""),
    queryFn: () => getRole(roleId!),
    enabled: Boolean(roleId) && (options.enabled ?? true),
  });
}
