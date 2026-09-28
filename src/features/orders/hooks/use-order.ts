import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/features/orders/api/orders.api";
import { orderKeys } from "@/features/orders/hooks/use-orders";

interface UseOrderOptions {
  enabled?: boolean;
}

export function useOrder(id: string | null, options: UseOrderOptions = {}) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => getOrder(id!),
    enabled: (options.enabled ?? true) && Boolean(id),
  });
}
