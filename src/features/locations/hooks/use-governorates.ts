import { useQuery } from "@tanstack/react-query";
import { getGovernorates } from "@/features/locations/api/geo.api";

const GEO_STALE_TIME = 60 * 60 * 1000;

export const geoQueryKeys = {
  all: ["geo"] as const,
  governorates: (countryCode: string) =>
    [...geoQueryKeys.all, "governorates", countryCode] as const,
  areas: (governorateId: string, search?: string) =>
    [...geoQueryKeys.all, "areas", governorateId, search ?? ""] as const,
};

export function useGovernorates(countryCode = "EG") {
  return useQuery({
    queryKey: geoQueryKeys.governorates(countryCode),
    queryFn: () => getGovernorates(countryCode),
    staleTime: GEO_STALE_TIME,
    gcTime: GEO_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });
}
