import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postBulkShipments } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import type { BulkBookPayload } from "@/features/shipments/types";
import { orderKeys } from "@/features/orders/hooks/use-orders";

export function useBulkBookShipments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkBookPayload) => postBulkShipments(payload),
    // On error too: a timeout or a dropped connection may still have booked orders on the server,
    // and a 422 REJECTED leaves a FAILED shipment behind. Lists and counts must not stay stale.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
