import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateOrder } from "@/features/orders/api/orders.api";
import { orderKeys } from "@/features/orders/hooks/use-orders";
import type { OrderPayload } from "@/features/orders/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useUpdateOrder(orderId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("orders");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: OrderPayload) => updateOrder(orderId, payload),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.counts() });
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      toast.success(t("toast.updated", { number: order.orderNumber }));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }
      if (isApiError(error, 409)) {
        return;
      }
      toast.error(parseApiError(error).detail || t("toast.saveFailed"));
    },
  });
}
