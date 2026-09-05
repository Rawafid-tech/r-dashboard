import { useQuery } from "@tanstack/react-query";
import { getProductsByBarcode } from "@/features/products/api/products.api";
import { productKeys } from "@/features/products/hooks/use-products";

interface UseProductByBarcodeOptions {
  enabled?: boolean;
}

export function useProductByBarcode(
  barcode: string | null,
  options: UseProductByBarcodeOptions = {},
) {
  const trimmed = barcode?.trim() ?? "";
  const enabled =
    Boolean(trimmed) &&
    !trimmed.includes("/") &&
    (options.enabled ?? true);

  return useQuery({
    queryKey: productKeys.byBarcode(trimmed),
    queryFn: () => getProductsByBarcode(trimmed),
    enabled,
    staleTime: 0,
    gcTime: 0,
  });
}
