import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getBatchShipmentLabels,
  getShipmentLabel,
} from "@/features/shipments/api/shipments.api";
import {
  openPdfBlob,
  shipmentLabelFilename,
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
    onSuccess: ({ blob, trackingNumber }) => {
      const opened = openPdfBlob(blob, shipmentLabelFilename(trackingNumber));
      if (!opened) {
        toast.error(t("toast.labelPopupBlocked"));
      }
    },
    onError: (error) => {
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
    onSuccess: (blob) => {
      const opened = openPdfBlob(blob, "labels-batch.pdf");
      if (!opened) {
        toast.error(t("toast.labelPopupBlocked"));
      }
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }
      toast.error(parseApiError(error).detail || t("toast.labelFailed"));
    },
  });
}
