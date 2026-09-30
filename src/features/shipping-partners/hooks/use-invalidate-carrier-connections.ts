import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { carrierConnectionKeys } from "@/features/shipping-partners/hooks/query-keys";
import type { CarrierConnection } from "@/features/shipping-partners/types";

export function useInvalidateCarrierConnections() {
  const queryClient = useQueryClient();

  return useCallback(
    (connection?: CarrierConnection) => {
      void queryClient.invalidateQueries({
        queryKey: carrierConnectionKeys.lists(),
      });
      if (connection) {
        queryClient.setQueryData(
          carrierConnectionKeys.detail(connection.id),
          connection,
        );
      }
    },
    [queryClient],
  );
}
