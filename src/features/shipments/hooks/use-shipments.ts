import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getShipments } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import type { ShipmentsListParams } from "@/features/shipments/types";

interface UseShipmentsOptions {
  enabled?: boolean;
}

export function useShipments(
  params: ShipmentsListParams,
  options: UseShipmentsOptions = {},
) {
  return useQuery({
    queryKey: shipmentKeys.list(params),
    queryFn: () => getShipments(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
