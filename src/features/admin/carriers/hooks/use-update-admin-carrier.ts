import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateAdminCarrier } from "@/features/admin/carriers/api/admin-carriers.api";
import { adminCarrierKeys } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { carrierKeys } from "@/features/shipping-partners/hooks/query-keys";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

interface UpdateAdminCarrierInput {
  code: string;
  enabled: boolean;
}

export function useUpdateAdminCarrier() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: ({ code, enabled }: UpdateAdminCarrierInput) =>
      updateAdminCarrier(code, enabled),
    onSuccess: (_carrier, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminCarrierKeys.list() });
      void queryClient.invalidateQueries({ queryKey: carrierKeys.list() });
      toast.success(
        variables.enabled
          ? t("carriers.toast.enabled")
          : t("carriers.toast.disabled"),
      );
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      toast.error(parseApiError(error).detail || t("carriers.toast.failed"));
    },
  });
}
