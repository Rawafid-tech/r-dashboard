import { useQuery } from "@tanstack/react-query";
import { getCarrierPlatforms } from "@/features/admin/carriers/api/admin-carriers.api";
import { adminCarrierKeys } from "@/features/admin/carriers/hooks/use-admin-carriers";

export function useCarrierPlatforms(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: adminCarrierKeys.platforms(),
    queryFn: getCarrierPlatforms,
    enabled: options.enabled ?? true,
    staleTime: 5 * 60_000,
  });
}
