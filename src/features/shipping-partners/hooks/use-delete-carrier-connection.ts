import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { deleteCarrierConnection } from "@/features/shipping-partners/api/shipping-partners.api";
import { carrierConnectionKeys } from "@/features/shipping-partners/hooks/query-keys";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useDeleteCarrierConnection() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("shippingPartners");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (id: string) => deleteCarrierConnection(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({
        queryKey: carrierConnectionKeys.lists(),
      });
      queryClient.removeQueries({
        queryKey: carrierConnectionKeys.detail(id),
      });
      toast.success(t("toast.deleted"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 404)) {
        void queryClient.invalidateQueries({
          queryKey: carrierConnectionKeys.all,
        });
        toast.error(parseApiError(error).detail || t("toast.notFound"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.deleteFailed"));
    },
  });
}
