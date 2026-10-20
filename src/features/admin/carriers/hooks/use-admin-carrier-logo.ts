import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  deleteAdminCarrierLogo,
  uploadAdminCarrierLogo,
} from "@/features/admin/carriers/api/admin-carriers.api";
import { adminCarrierKeys } from "@/features/admin/carriers/hooks/use-admin-carriers";
import type { AdminCarrier } from "@/features/admin/carriers/types";
import {
  carrierConnectionKeys,
  carrierKeys,
} from "@/features/shipping-partners/hooks/query-keys";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

interface CarrierLogoInput {
  code: string;
  file: File;
}

function patchCarrierInList(
  carriers: AdminCarrier[] | undefined,
  updated: AdminCarrier,
): AdminCarrier[] | undefined {
  if (!carriers) return carriers;
  return carriers.map((c) => (c.code === updated.code ? { ...c, ...updated } : c));
}

export function useUploadAdminCarrierLogo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: ({ code, file }: CarrierLogoInput) =>
      uploadAdminCarrierLogo(code, file),
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminCarrier[]>(
        adminCarrierKeys.list(),
        (prev) => patchCarrierInList(prev, updated),
      );
      void queryClient.invalidateQueries({ queryKey: adminCarrierKeys.list() });
      void queryClient.invalidateQueries({ queryKey: carrierKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: carrierConnectionKeys.lists(),
      });
      toast.success(t("carriers.logo.updated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }
      toast.error(parseApiError(error).detail);
    },
  });
}

export function useDeleteAdminCarrierLogo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (code: string) => deleteAdminCarrierLogo(code),
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminCarrier[]>(
        adminCarrierKeys.list(),
        (prev) => patchCarrierInList(prev, updated),
      );
      void queryClient.invalidateQueries({ queryKey: adminCarrierKeys.list() });
      void queryClient.invalidateQueries({ queryKey: carrierKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: carrierConnectionKeys.lists(),
      });
      toast.success(t("carriers.logo.removed"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }
      toast.error(parseApiError(error).detail);
    },
  });
}
