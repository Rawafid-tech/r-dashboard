import { useQuery } from "@tanstack/react-query";
import { getGovernorateAreas } from "@/features/locations/api/geo.api";
import { geoQueryKeys } from "@/features/locations/hooks/use-governorates";

const GEO_STALE_TIME = 60 * 60 * 1000;

interface UseGovernorateAreasOptions {
  enabled?: boolean;
}

export function useGovernorateAreas(
  governorateId: string | null | undefined,
  options: UseGovernorateAreasOptions = {},
) {
  const id = governorateId?.trim() ?? "";

  return useQuery({
    queryKey: geoQueryKeys.areas(id),
    queryFn: () => getGovernorateAreas(id),
    enabled: (options.enabled ?? true) && id.length > 0,
    staleTime: GEO_STALE_TIME,
    gcTime: GEO_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });
}

interface UseAreaSearchOptions {
  enabled?: boolean;
}

export function useAreaSearch(
  governorateId: string | null | undefined,
  search: string,
  options: UseAreaSearchOptions = {},
) {
  const id = governorateId?.trim() ?? "";
  const term = search.trim();

  return useQuery({
    queryKey: geoQueryKeys.areas(id, term),
    queryFn: () => getGovernorateAreas(id, term),
    enabled: (options.enabled ?? true) && id.length > 0 && term.length > 0,
    staleTime: GEO_STALE_TIME,
    gcTime: GEO_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });
}
