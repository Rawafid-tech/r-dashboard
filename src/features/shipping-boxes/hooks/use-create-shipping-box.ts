import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createShippingBox } from "@/features/shipping-boxes/api/shipping-boxes.api";
import { shippingBoxKeys } from "@/features/shipping-boxes/hooks/use-shipping-boxes";
import { isConcurrentDefaultConflict } from "@/features/shipping-boxes/lib/shipping-box-form-errors";
import type { ShippingBoxPayload } from "@/features/shipping-boxes/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useCreateShippingBox() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("shippingBoxes");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ShippingBoxPayload) => createShippingBox(payload),
    onSuccess: (box) => {
      void queryClient.invalidateQueries({ queryKey: shippingBoxKeys.lists() });
      queryClient.setQueryData(shippingBoxKeys.detail(box.id), box);
      toast.success(t("toast.created"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isConcurrentDefaultConflict(error)) {
        void queryClient.invalidateQueries({ queryKey: shippingBoxKeys.lists() });
        toast.error(parseApiError(error).detail || t("toast.concurrentDefault"));
        return;
      }

      if (isApiError(error, 409)) {
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.saveFailed"));
    },
  });
}
