import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createSenderLocation } from "@/features/locations/api/sender-locations.api";
import { applyLocationFieldErrors } from "@/features/locations/lib/location-form-errors";
import { senderLocationKeys } from "@/features/locations/hooks/use-sender-locations";
import type { SenderLocationPayload } from "@/features/locations/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useCreateSenderLocation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("locations");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: SenderLocationPayload) => createSenderLocation(payload),
    onSuccess: (location) => {
      void queryClient.invalidateQueries({
        queryKey: senderLocationKeys.lists(),
      });
      queryClient.setQueryData(
        senderLocationKeys.detail(location.id),
        location,
      );
      toast.success(t("toast.created"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 409)) {
        toast.error(parseApiError(error).detail || t("toast.createFailed"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.createFailed"));
    },
  });
}

export type CreateSenderLocationSetError = (
  name: string,
  error: { type: string; message: string },
) => void;

export function handleCreateLocationError(
  error: unknown,
  setError: CreateSenderLocationSetError,
) {
  if (isApiError(error, 409)) {
    setError("name", {
      type: "server",
      message: parseApiError(error).detail,
    });
    return;
  }

  applyLocationFieldErrors(error, setError);
}
