import { useQuery } from "@tanstack/react-query";
import { getCarriers } from "@/features/shipping-partners/api/shipping-partners.api";
import { carrierKeys } from "@/features/shipping-partners/hooks/query-keys";

interface UseCarriersOptions {
  enabled?: boolean;
}

export function useCarriers(options: UseCarriersOptions = {}) {
  return useQuery({
    queryKey: carrierKeys.list(),
    queryFn: getCarriers,
    staleTime: 60_000,
    enabled: options.enabled ?? true,
  });
}
