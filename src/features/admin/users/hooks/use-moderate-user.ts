import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { moderateAdminUser } from "@/features/admin/users/api/admin-users.api";
import { adminUsersQueryKeys } from "@/features/admin/users/hooks/use-admin-users";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";
import type { ModerateUserRequest } from "@/features/admin/users/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useModerateUser(userId: string, companyId?: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (body: ModerateUserRequest) =>
      moderateAdminUser(userId, body),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(
        adminUsersQueryKeys.detail(userId),
        updatedUser,
      );
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.lists() });

      if (companyId) {
        void queryClient.invalidateQueries({
          queryKey: adminCompaniesQueryKeys.users(companyId),
        });
      }

      toast.success(t("users.toast.updated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("users.toast.updateFailed"));
    },
  });
}
