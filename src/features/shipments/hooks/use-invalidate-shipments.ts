import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";

export function useInvalidateShipments() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: shipmentKeys.counts() });
  }, [queryClient]);
}
