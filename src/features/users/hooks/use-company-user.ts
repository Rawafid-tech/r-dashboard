import { useQuery } from "@tanstack/react-query";
import { getCompanyUser } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/hooks/use-company-users";

interface UseCompanyUserOptions {
  enabled?: boolean;
}

export function useCompanyUser(
  userId: string | null,
  options: UseCompanyUserOptions = {},
) {
  return useQuery({
    queryKey: usersQueryKeys.detail(userId ?? ""),
    queryFn: () => getCompanyUser(userId!),
    enabled: Boolean(userId) && (options.enabled ?? true),
  });
}
