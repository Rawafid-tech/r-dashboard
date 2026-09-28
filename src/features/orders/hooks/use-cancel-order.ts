import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cancelOrder } from "@/features/orders/api/orders.api";
import { orderKeys } from "@/features/orders/hooks/use-orders";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("orders");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.counts() });
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      toast.success(t("toast.cancelled", { number: order.orderNumber }));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }
      toast.error(parseApiError(error).detail || t("toast.cancelFailed"));
    },
  });
}
