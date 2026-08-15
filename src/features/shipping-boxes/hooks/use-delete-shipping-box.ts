import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { deleteShippingBox } from "@/features/shipping-boxes/api/shipping-boxes.api";
import { shippingBoxKeys } from "@/features/shipping-boxes/hooks/use-shipping-boxes";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useDeleteShippingBox() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("shippingBoxes");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (boxId: string) => deleteShippingBox(boxId),
    onSuccess: (_data, boxId) => {
      void queryClient.invalidateQueries({ queryKey: shippingBoxKeys.lists() });
      queryClient.removeQueries({ queryKey: shippingBoxKeys.detail(boxId) });
      toast.success(t("toast.deleted"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 404)) {
        void queryClient.invalidateQueries({ queryKey: shippingBoxKeys.all });
        toast.error(parseApiError(error).detail || t("toast.notFound"));
        return;
      }

      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.deleteFailed"));
    },
  });
}
