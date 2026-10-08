import { useQuery } from "@tanstack/react-query";
import { getAdminCarriers } from "@/features/admin/carriers/api/admin-carriers.api";
import type { CarrierRegionsListParams } from "@/features/admin/carriers/types";

export const adminCarrierKeys = {
  all: ["admin-carriers"] as const,
  list: () => [...adminCarrierKeys.all, "list"] as const,
  regions: (code: string) =>
    [...adminCarrierKeys.all, "regions", code] as const,
  regionList: (code: string, params: CarrierRegionsListParams) =>
    [...adminCarrierKeys.regions(code), params] as const,
};

export function useAdminCarriers() {
  return useQuery({
    queryKey: adminCarrierKeys.list(),
    queryFn: getAdminCarriers,
  });
}
