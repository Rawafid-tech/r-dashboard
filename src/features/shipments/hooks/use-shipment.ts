import { useQuery } from "@tanstack/react-query";
import { getShipment } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";

const DETAIL_REFETCH_MS = 60_000;

interface UseShipmentOptions {
  enabled?: boolean;
  /** When true, refetch on window focus and every minute (tracking detail). */
  live?: boolean;
}

export function useShipment(
  id: string | null,
  options: UseShipmentOptions = {},
) {
  const live = options.live ?? false;

  return useQuery({
    queryKey: shipmentKeys.detail(id ?? ""),
    queryFn: ({ signal }) => getShipment(id!, signal),
    enabled: Boolean(id) && (options.enabled ?? true),
    refetchOnWindowFocus: live,
    refetchInterval: live ? DETAIL_REFETCH_MS : false,
  });
}
