import { useQuery } from "@tanstack/react-query";
import { getOrderCounts } from "@/features/orders/api/orders.api";
import { orderKeys } from "@/features/orders/hooks/use-orders";

interface UseOrderCountsOptions {
  enabled?: boolean;
}

export function useOrderCounts(options: UseOrderCountsOptions = {}) {
  return useQuery({
    queryKey: orderKeys.counts(),
    queryFn: getOrderCounts,
    staleTime: 30_000,
    enabled: options.enabled ?? true,
  });
}
