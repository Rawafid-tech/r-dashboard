import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { syncCarrierRegions } from "@/features/admin/carriers/api/admin-carriers.api";
import { adminCarrierKeys } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useSyncCarrierRegions(code: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: () => syncCarrierRegions(code),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: adminCarrierKeys.regions(code),
      });

      if (result.unmappedCities.length > 0) {
        toast.warning(t("carriers.regions.sync.unmappedTitle"));
        return;
      }

      toast.success(t("carriers.regions.sync.success"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 502)) {
        toast.error(
          parseApiError(error).detail ||
            t("carriers.regions.sync.notResponding"),
        );
        return;
      }

      toast.error(
        parseApiError(error).detail || t("carriers.regions.sync.failed"),
      );
    },
  });
}
