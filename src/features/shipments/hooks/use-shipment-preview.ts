import { useQuery } from "@tanstack/react-query";
import { getShipmentPreview } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import type { ShipmentPreviewParams } from "@/features/shipments/types";

interface UseShipmentPreviewOptions {
  enabled?: boolean;
}

export function useShipmentPreview(
  params: ShipmentPreviewParams | null,
  options: UseShipmentPreviewOptions = {},
) {
  const enabled =
    Boolean(params?.orderId && params?.connectionId) &&
    (options.enabled ?? true);

  return useQuery({
    queryKey: shipmentKeys.preview(params ?? { orderId: "", connectionId: "" }),
    queryFn: ({ signal }) => getShipmentPreview(params!, signal),
    enabled,
    staleTime: 0,
    retry: false,
  });
}
