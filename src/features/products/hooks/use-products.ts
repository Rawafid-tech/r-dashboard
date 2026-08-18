import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProducts } from "@/features/products/api/products.api";
import type { ProductsListParams } from "@/features/products/types";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductsListParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

interface UseProductsOptions {
  enabled?: boolean;
}

export function useProducts(
  params: ProductsListParams,
  options: UseProductsOptions = {},
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
