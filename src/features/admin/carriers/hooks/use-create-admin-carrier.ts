import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createAdminCarrier } from "@/features/admin/carriers/api/admin-carriers.api";
import { adminCarrierKeys } from "@/features/admin/carriers/hooks/use-admin-carriers";
import type { CreateAdminCarrierPayload } from "@/features/admin/carriers/types";
import { carrierKeys } from "@/features/shipping-partners/hooks/query-keys";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useCreateAdminCarrier() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: CreateAdminCarrierPayload) => createAdminCarrier(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminCarrierKeys.list() });
      void queryClient.invalidateQueries({ queryKey: carrierKeys.list() });
      toast.success(t("carriers.form.toast.created"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
      }
    },
  });
}

export function createAdminCarrierErrorDetail(error: unknown): string {
  return parseApiError(error).detail;
}
