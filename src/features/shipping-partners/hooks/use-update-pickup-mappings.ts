import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateConnectionPickupMappings } from "@/features/shipping-partners/api/shipping-partners.api";
import { carrierConnectionKeys } from "@/features/shipping-partners/hooks/query-keys";
import type { UpdatePickupMappingsPayload } from "@/features/shipping-partners/types";

export function useUpdatePickupMappings(connectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePickupMappingsPayload) =>
      updateConnectionPickupMappings(connectionId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(
        carrierConnectionKeys.pickupLocations(connectionId),
        data,
      );
      void queryClient.invalidateQueries({
        queryKey: carrierConnectionKeys.detail(connectionId),
      });
    },
  });
}
