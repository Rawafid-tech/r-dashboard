import { useQuery } from "@tanstack/react-query";
import { getShipment } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";

interface UseShipmentOptions {
  enabled?: boolean;
}

export function useShipment(id: string | null, options: UseShipmentOptions = {}) {
  return useQuery({
    queryKey: shipmentKeys.detail(id ?? ""),
    queryFn: ({ signal }) => getShipment(id!, signal),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}
