import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { bookShipment } from "@/features/shipments/api/shipments.api";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import { parseShipmentBookingError } from "@/features/shipments/lib/shipment-booking-errors";
import type { BookShipmentPayload } from "@/features/shipments/types";
import { orderKeys } from "@/features/orders/hooks/use-orders";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useBookShipment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("shipments");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: BookShipmentPayload) => bookShipment(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.counts() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.counts() });
      queryClient.setQueryData(
        shipmentKeys.detail(result.shipment.id),
        result.shipment,
      );

      if (result.status === 201 && result.shipment.status === "BOOKED") {
        toast.success(
          t("toast.booked", {
            tracking: result.shipment.trackingNumber ?? "—",
          }),
        );
      }
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      const parsed = parseShipmentBookingError(error);
      toast.error(parsed.detail || parseApiError(error).detail);
    },
  });
}
