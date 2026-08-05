import { useQuery } from "@tanstack/react-query";
import { getPermissionsCatalog } from "@/features/roles/api/permissions.api";
import { API_BASE_URL } from "@/shared/lib/constants";
import { useLocaleStore } from "@/stores/locale.store";

export const permissionsQueryKeys = {
  all: ["permissions-catalog"] as const,
  tree: (locale: string, apiBase: string) =>
    [...permissionsQueryKeys.all, locale, apiBase] as const,
};

interface UsePermissionsCatalogOptions {
  enabled?: boolean;
}

export function usePermissionsCatalog(
  options: UsePermissionsCatalogOptions = {},
) {
  const locale = useLocaleStore((state) => state.locale);
  const apiBase = API_BASE_URL || window.location.origin;

  return useQuery({
    queryKey: permissionsQueryKeys.tree(locale, apiBase),
    queryFn: getPermissionsCatalog,
    staleTime: 30 * 60 * 1000,
    enabled: options.enabled ?? true,
  });
}
