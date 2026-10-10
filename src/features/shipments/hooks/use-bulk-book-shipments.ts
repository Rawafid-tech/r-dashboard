import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postBulkShipments } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import type { BulkBookPayload } from "@/features/shipments/types";
import { orderKeys } from "@/features/orders/hooks/use-orders";

export function useBulkBookShipments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkBookPayload) => postBulkShipments(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
