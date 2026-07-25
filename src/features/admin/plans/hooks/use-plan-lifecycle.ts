import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  activateAdminPlan,
  archiveAdminPlan,
} from "@/features/admin/plans/api/admin-plans.api";
import { adminPlansQueryKeys } from "@/features/admin/plans/hooks/use-admin-plans";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useArchivePlan(planId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: () => archiveAdminPlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminPlansQueryKeys.all });
      toast.success(t("plans.toast.archived"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 409)) {
        toast.error(t("plans.toast.cannotArchiveDefault"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("plans.toast.archiveFailed"));
    },
  });
}

export function useActivatePlan(planId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: () => activateAdminPlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminPlansQueryKeys.all });
      toast.success(t("plans.toast.activated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("plans.toast.activateFailed"));
    },
  });
}
