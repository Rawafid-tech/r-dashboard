import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/features/products/api/products.api";
import { productKeys } from "@/features/products/hooks/use-products";

interface UseProductOptions {
  enabled?: boolean;
}

export function useProduct(id: string | null, options: UseProductOptions = {}) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => getProduct(id!),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}
