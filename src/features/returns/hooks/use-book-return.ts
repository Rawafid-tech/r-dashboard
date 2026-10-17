import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { bookReturn } from "@/features/returns/api/returns.api";
import { returnKeys } from "@/features/returns/hooks/query-keys";
import { parseReturnBookingError } from "@/features/returns/lib/return-booking-errors";
import type { BookReturnPayload } from "@/features/returns/types";
import { orderKeys } from "@/features/orders/hooks/use-orders";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useBookReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("returns");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: BookReturnPayload) => bookReturn(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.counts() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: returnKeys.previews() });
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
      } else if (result.status === 202 || result.shipment.status === "BOOKING") {
        toast.success(t("toast.booking"));
      }
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      const parsed = parseReturnBookingError(error);
      toast.error(parsed.detail || parseApiError(error).detail);
    },
  });
}
