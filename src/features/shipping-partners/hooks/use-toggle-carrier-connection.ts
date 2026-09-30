import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  activateCarrierConnection,
  deactivateCarrierConnection,
} from "@/features/shipping-partners/api/shipping-partners.api";
import { carrierConnectionKeys } from "@/features/shipping-partners/hooks/query-keys";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

interface ToggleCarrierConnectionInput {
  id: string;
  active: boolean;
}

export function useToggleCarrierConnection() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("shippingPartners");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: ({ id, active }: ToggleCarrierConnectionInput) =>
      active
        ? activateCarrierConnection(id)
        : deactivateCarrierConnection(id),
    onSuccess: (connection) => {
      void queryClient.invalidateQueries({
        queryKey: carrierConnectionKeys.lists(),
      });
      queryClient.setQueryData(
        carrierConnectionKeys.detail(connection.id),
        connection,
      );
      toast.success(
        connection.active ? t("toast.activated") : t("toast.deactivated"),
      );
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 404)) {
        void queryClient.invalidateQueries({
          queryKey: carrierConnectionKeys.lists(),
        });
        toast.error(parseApiError(error).detail || t("toast.notFound"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.toggleFailed"));
    },
  });
}
