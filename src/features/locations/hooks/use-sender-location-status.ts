import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  activateSenderLocation,
  deactivateSenderLocation,
} from "@/features/locations/api/sender-locations.api";
import { senderLocationKeys } from "@/features/locations/hooks/use-sender-locations";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useActivateSenderLocation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("locations");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (id: string) => activateSenderLocation(id),
    onSuccess: (location) => {
      void queryClient.invalidateQueries({
        queryKey: senderLocationKeys.lists(),
      });
      queryClient.setQueryData(
        senderLocationKeys.detail(location.id),
        location,
      );
      toast.success(t("toast.activated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.statusFailed"));
    },
  });
}

export function useDeactivateSenderLocation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("locations");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (id: string) => deactivateSenderLocation(id),
    onSuccess: (location) => {
      void queryClient.invalidateQueries({
        queryKey: senderLocationKeys.lists(),
      });
      queryClient.setQueryData(
        senderLocationKeys.detail(location.id),
        location,
      );
      toast.success(t("toast.deactivated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 409)) {
        toast.error(parseApiError(error).detail || t("toast.defaultDeactivateBlocked"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.statusFailed"));
    },
  });
}
