import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { bookExchange } from "@/features/exchanges/api/exchanges.api";
import { exchangeKeys } from "@/features/exchanges/hooks/query-keys";
import { parseExchangeBookingError } from "@/features/exchanges/lib/exchange-booking-errors";
import type { BookExchangePayload } from "@/features/exchanges/types";
import { orderKeys } from "@/features/orders/hooks/use-orders";
import { returnKeys } from "@/features/returns/hooks/query-keys";
import { shipmentKeys } from "@/features/shipments/hooks/query-keys";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useBookExchange() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("exchanges");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: BookExchangePayload) => bookExchange(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: shipmentKeys.counts() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: exchangeKeys.previews() });
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

      const parsed = parseExchangeBookingError(error);
      toast.error(parsed.detail || parseApiError(error).detail);
    },
  });
}
