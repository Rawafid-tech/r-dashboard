import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { syncCarrierRegions } from "@/features/admin/carriers/api/admin-carriers.api";
import { adminCarrierKeys } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

interface UseSyncCarrierRegionsOptions {
  /** Opens the carrier's settings when the carrier refused the sync account. */
  onAccountRejected?: () => void;
}

export function useSyncCarrierRegions(
  code: string,
  { onAccountRejected }: UseSyncCarrierRegionsOptions = {},
) {
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

      // carrier.syncAccountRejected: retrying will not help, the account must change.
      if (isApiError(error, 422)) {
        toast.error(
          parseApiError(error).detail ||
            t("carriers.regions.sync.accountRejected"),
          {
            duration: 10_000,
            action: onAccountRejected
              ? {
                  label: t("carriers.regions.sync.openSettings"),
                  onClick: onAccountRejected,
                }
              : undefined,
          },
        );
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
