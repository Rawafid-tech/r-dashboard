import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getBatchShipmentLabels,
  getShipmentLabel,
} from "@/features/shipments/api/shipments.api";
import {
  reservePdfWindow,
  shipmentLabelFilename,
  showPdfBlob,
} from "@/features/shipments/lib/open-shipment-label";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useShipmentLabel() {
  const { t } = useTranslation("shipments");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: async ({
      id,
      trackingNumber,
    }: {
      id: string;
      trackingNumber: string | null;
    }) => {
      const blob = await getShipmentLabel(id);
      return { blob, trackingNumber };
    },
    onMutate: () => ({ reserved: reservePdfWindow() }),
    onSuccess: ({ blob, trackingNumber }, _variables, context) => {
      const opened = showPdfBlob(
        blob,
        shipmentLabelFilename(trackingNumber),
        context.reserved,
      );
      if (!opened) {
        toast.info(t("toast.labelPopupBlocked"));
      }
    },
    onError: (error, _variables, context) => {
      context?.reserved?.close();
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }
      toast.error(parseApiError(error).detail || t("toast.labelFailed"));
    },
  });
}

export function useBatchShipmentLabels() {
  const { t } = useTranslation("shipments");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (shipmentIds: string[]) =>
      getBatchShipmentLabels({ shipmentIds }),
    onMutate: () => ({ reserved: reservePdfWindow() }),
    onSuccess: (blob, _variables, context) => {
      const opened = showPdfBlob(blob, "labels-batch.pdf", context.reserved);
      if (!opened) {
        toast.info(t("toast.labelPopupBlocked"));
      }
    },
    onError: (error, _variables, context) => {
      context?.reserved?.close();
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }
      toast.error(parseApiError(error).detail || t("toast.labelFailed"));
    },
  });
}
