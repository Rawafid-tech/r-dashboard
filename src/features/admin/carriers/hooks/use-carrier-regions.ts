import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCarrierRegions } from "@/features/admin/carriers/api/admin-carriers.api";
import { adminCarrierKeys } from "@/features/admin/carriers/hooks/use-admin-carriers";
import type { CarrierRegionsListParams } from "@/features/admin/carriers/types";

export function useCarrierRegions(
  code: string,
  params: CarrierRegionsListParams,
) {
  return useQuery({
    queryKey: adminCarrierKeys.regionList(code, params),
    queryFn: ({ signal }) => getCarrierRegions(code, params, signal),
    enabled: code.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
