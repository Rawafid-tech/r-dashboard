import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cancelShipment } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import { orderKeys } from "@/features/orders/hooks/use-orders";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useCancelShipment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("shipments");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (id: string) => cancelShipment(id),
    onSuccess: (shipment) => {
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.counts() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.counts() });
      queryClient.setQueryData(shipmentKeys.detail(shipment.id), shipment);
      toast.success(
        t("toast.cancelled", { number: shipment.order.orderNumber }),
      );
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
