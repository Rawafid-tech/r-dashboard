import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateAdminPlan } from "@/features/admin/plans/api/admin-plans.api";
import type { UpdatePlanRequest } from "@/features/admin/plans/types";
import { adminPlansQueryKeys } from "@/features/admin/plans/hooks/use-admin-plans";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

export function useUpdatePlan(planId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: UpdatePlanRequest) =>
      updateAdminPlan(planId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminPlansQueryKeys.all });
      toast.success(t("plans.toast.updated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("plans.toast.saveFailed"));
    },
  });
}

export function applyPlanFieldErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name, { type: "server", message: reason });
  }
}
