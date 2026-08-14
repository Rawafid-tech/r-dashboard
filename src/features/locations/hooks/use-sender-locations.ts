import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSenderLocations } from "@/features/locations/api/sender-locations.api";
import type { LocationsListParams } from "@/features/locations/types";

export const senderLocationKeys = {
  all: ["sender-locations"] as const,
  lists: () => [...senderLocationKeys.all, "list"] as const,
  list: (params: LocationsListParams) =>
    [...senderLocationKeys.lists(), params] as const,
  details: () => [...senderLocationKeys.all, "detail"] as const,
  detail: (id: string) => [...senderLocationKeys.details(), id] as const,
};

interface UseSenderLocationsOptions {
  enabled?: boolean;
}

export function useSenderLocations(
  params: LocationsListParams,
  options: UseSenderLocationsOptions = {},
) {
  return useQuery({
    queryKey: senderLocationKeys.list(params),
    queryFn: () => getSenderLocations(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
