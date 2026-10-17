import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { patchAdminCarrier } from "@/features/admin/carriers/api/admin-carriers.api";
import { adminCarrierKeys } from "@/features/admin/carriers/hooks/use-admin-carriers";
import type { PatchAdminCarrierPayload } from "@/features/admin/carriers/types";
import { carrierKeys } from "@/features/shipping-partners/hooks/query-keys";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

interface PatchAdminCarrierInput {
  code: string;
  payload: PatchAdminCarrierPayload;
}

export function usePatchAdminCarrier() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: ({ code, payload }: PatchAdminCarrierInput) =>
      patchAdminCarrier(code, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminCarrierKeys.list() });
      void queryClient.invalidateQueries({ queryKey: carrierKeys.list() });
      toast.success(t("carriers.form.toast.updated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
      }
    },
  });
}

export function patchAdminCarrierErrorDetail(error: unknown): string {
  return parseApiError(error).detail;
}
