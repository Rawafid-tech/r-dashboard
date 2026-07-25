import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { assignAdminCompanySubscription } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";
import type { AssignSubscriptionRequest } from "@/features/admin/companies/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useAssignCompanySubscription(companyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (body: AssignSubscriptionRequest) =>
      assignAdminCompanySubscription(companyId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminCompaniesQueryKeys.subscriptions(companyId),
      });
      void queryClient.invalidateQueries({
        queryKey: adminCompaniesQueryKeys.detail(companyId),
      });
      void queryClient.invalidateQueries({
        queryKey: adminCompaniesQueryKeys.lists(),
      });
      toast.success(t("companies.toast.assigned"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 404)) {
        toast.error(t("companies.toast.companyNotFound"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("companies.toast.assignFailed"));
    },
  });
}
