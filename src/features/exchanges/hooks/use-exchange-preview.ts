import { useQuery } from "@tanstack/react-query";
import { getExchangePreview } from "@/features/exchanges/api/exchanges.api";
import { exchangeKeys } from "@/features/exchanges/hooks/query-keys";
import type { ExchangePreviewParams } from "@/features/exchanges/types";

interface UseExchangePreviewOptions {
  enabled?: boolean;
}

export function useExchangePreview(
  params: ExchangePreviewParams | null,
  options: UseExchangePreviewOptions = {},
) {
  const enabled = Boolean(params?.orderId) && (options.enabled ?? true);

  return useQuery({
    queryKey: exchangeKeys.preview(params ?? { orderId: "" }),
    queryFn: ({ signal }) => getExchangePreview(params!, signal),
    enabled,
    staleTime: 0,
    retry: false,
  });
}
