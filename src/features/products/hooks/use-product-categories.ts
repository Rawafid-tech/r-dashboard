import { useQuery } from "@tanstack/react-query";
import { getProductCategories } from "@/features/products/api/product-categories.api";

export const productCategoryKeys = {
  all: ["product-categories"] as const,
  tree: () => [...productCategoryKeys.all, "tree"] as const,
};

interface UseProductCategoriesOptions {
  enabled?: boolean;
}

export function useProductCategories(
  options: UseProductCategoriesOptions = {},
) {
  return useQuery({
    queryKey: productCategoryKeys.tree(),
    queryFn: getProductCategories,
    enabled: options.enabled ?? true,
  });
}
