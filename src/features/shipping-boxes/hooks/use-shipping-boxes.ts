import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getShippingBoxes } from "@/features/shipping-boxes/api/shipping-boxes.api";
import type { ShippingBoxesListParams } from "@/features/shipping-boxes/types";

export const shippingBoxKeys = {
  all: ["shipping-boxes"] as const,
  lists: () => [...shippingBoxKeys.all, "list"] as const,
  list: (params: ShippingBoxesListParams) =>
    [...shippingBoxKeys.lists(), params] as const,
  details: () => [...shippingBoxKeys.all, "detail"] as const,
  detail: (id: string) => [...shippingBoxKeys.details(), id] as const,
};

interface UseShippingBoxesOptions {
  enabled?: boolean;
}

export function useShippingBoxes(
  params: ShippingBoxesListParams,
  options: UseShippingBoxesOptions = {},
) {
  return useQuery({
    queryKey: shippingBoxKeys.list(params),
    queryFn: () => getShippingBoxes(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
