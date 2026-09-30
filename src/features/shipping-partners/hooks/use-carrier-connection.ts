import { useQuery } from "@tanstack/react-query";
import { getCarrierConnection } from "@/features/shipping-partners/api/shipping-partners.api";
import { carrierConnectionKeys } from "@/features/shipping-partners/hooks/query-keys";

interface UseCarrierConnectionOptions {
  enabled?: boolean;
}

export function useCarrierConnection(
  id: string | null,
  options: UseCarrierConnectionOptions = {},
) {
  return useQuery({
    queryKey: carrierConnectionKeys.detail(id ?? ""),
    queryFn: () => getCarrierConnection(id!),
    enabled: (options.enabled ?? true) && Boolean(id),
  });
}
