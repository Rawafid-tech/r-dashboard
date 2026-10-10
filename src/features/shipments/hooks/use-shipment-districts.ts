import { useQuery } from "@tanstack/react-query";
import { getShipmentDistricts } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import type { ShipmentDistrictsParams } from "@/features/shipments/types";

interface UseShipmentDistrictsOptions {
  enabled?: boolean;
}

export function useShipmentDistricts(
  params: ShipmentDistrictsParams | null,
  options: UseShipmentDistrictsOptions = {},
) {
  const enabled =
    Boolean(
      params?.connectionId &&
        params?.governorateId &&
        (params.search?.trim().length ?? 0) > 0,
    ) && (options.enabled ?? true);

  return useQuery({
    queryKey: shipmentKeys.districtSearch(
      params ?? { connectionId: "", governorateId: "", search: "" },
    ),
    queryFn: ({ signal }) => getShipmentDistricts(params!, signal),
    enabled,
    staleTime: 60_000,
  });
}
