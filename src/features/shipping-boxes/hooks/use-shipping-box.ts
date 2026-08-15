import { useQuery } from "@tanstack/react-query";
import { getShippingBox } from "@/features/shipping-boxes/api/shipping-boxes.api";
import { shippingBoxKeys } from "@/features/shipping-boxes/hooks/use-shipping-boxes";

interface UseShippingBoxOptions {
  enabled?: boolean;
}

export function useShippingBox(
  id: string | null,
  options: UseShippingBoxOptions = {},
) {
  return useQuery({
    queryKey: shippingBoxKeys.detail(id ?? ""),
    queryFn: () => getShippingBox(id!),
    enabled: (options.enabled ?? true) && Boolean(id),
  });
}
