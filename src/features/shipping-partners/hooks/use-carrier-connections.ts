import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCarrierConnections } from "@/features/shipping-partners/api/shipping-partners.api";
import { carrierConnectionKeys } from "@/features/shipping-partners/hooks/query-keys";
import type { CarrierConnectionsListParams } from "@/features/shipping-partners/types";

interface UseCarrierConnectionsOptions {
  enabled?: boolean;
}

export function useCarrierConnections(
  params: CarrierConnectionsListParams,
  options: UseCarrierConnectionsOptions = {},
) {
  return useQuery({
    queryKey: carrierConnectionKeys.list(params),
    queryFn: () => getCarrierConnections(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
