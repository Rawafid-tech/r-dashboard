import { useQuery } from "@tanstack/react-query";
import { getConnectionPickupLocations } from "@/features/shipping-partners/api/shipping-partners.api";
import { carrierConnectionKeys } from "@/features/shipping-partners/hooks/query-keys";

interface UseConnectionPickupLocationsOptions {
  enabled?: boolean;
}

export function useConnectionPickupLocations(
  connectionId: string | null,
  options: UseConnectionPickupLocationsOptions = {},
) {
  return useQuery({
    queryKey: carrierConnectionKeys.pickupLocations(connectionId ?? ""),
    queryFn: ({ signal }) =>
      getConnectionPickupLocations(connectionId!, signal),
    enabled: Boolean(connectionId) && (options.enabled ?? true),
    staleTime: 0,
    gcTime: 5 * 60_000,
  });
}
