import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderPackages } from "@/features/orders/api/orders.api";
import type { OrderPackagePayload } from "@/features/orders/types";
import { orderKeys } from "@/features/orders/hooks/use-orders";

export function useUpdateOrderPackages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      packages,
    }: {
      orderId: string;
      packages: OrderPackagePayload[];
    }) => updateOrderPackages(orderId, packages),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
    },
  });
}
