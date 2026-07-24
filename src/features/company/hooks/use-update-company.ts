import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateCompany } from "@/features/company/api/company.api";
import type { UpdateCompanyRequest } from "@/features/company/types";
import { companyQueryKeys } from "@/features/company/hooks/use-company";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: UpdateCompanyRequest) => updateCompany(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.detail() });
      toast.success(t("company.success"));
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
      toast.error(apiError.detail || t("company.error"));
    },
  });
}

export function applyCompanyFieldErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name, { type: "server", message: reason });
  }
}
