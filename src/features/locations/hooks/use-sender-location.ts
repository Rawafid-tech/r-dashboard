import { useQuery } from "@tanstack/react-query";
import { getSenderLocation } from "@/features/locations/api/sender-locations.api";
import { senderLocationKeys } from "@/features/locations/hooks/use-sender-locations";

interface UseSenderLocationOptions {
  enabled?: boolean;
}

export function useSenderLocation(
  id: string | null,
  options: UseSenderLocationOptions = {},
) {
  return useQuery({
    queryKey: senderLocationKeys.detail(id ?? ""),
    queryFn: () => getSenderLocation(id!),
    enabled: (options.enabled ?? true) && Boolean(id),
  });
}
