import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "@/features/orders/api/orders.api";
import type { OrdersListParams } from "@/features/orders/types";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: OrdersListParams) => [...orderKeys.lists(), params] as const,
  counts: () => [...orderKeys.all, "counts"] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

interface UseOrdersOptions {
  enabled?: boolean;
}

export function useOrders(
  params: OrdersListParams,
  options: UseOrdersOptions = {},
) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrders(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
