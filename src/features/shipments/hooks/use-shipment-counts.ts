import { useQuery } from "@tanstack/react-query";
import { getShipmentCounts } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";

interface UseShipmentCountsOptions {
  enabled?: boolean;
}

export function useShipmentCounts(options: UseShipmentCountsOptions = {}) {
  return useQuery({
    queryKey: shipmentKeys.counts(),
    queryFn: getShipmentCounts,
    staleTime: 30_000,
    enabled: options.enabled ?? true,
  });
}
