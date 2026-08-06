import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateCompanyUserRole } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/hooks/use-company-users";
import { isUserApiErrorCode } from "@/features/users/lib/user-form-errors";
import type { UpdateUserRolePayload } from "@/features/users/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useUpdateCompanyUserRole(userId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: UpdateUserRolePayload) =>
      updateCompanyUserRole(userId, payload),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.setQueryData(usersQueryKeys.detail(user.id), user);
      toast.success(t("toast.roleUpdated"));
    },
    onError: (error) => {
      if (isUserApiErrorCode(error, "auth.cannotGrantBeyondOwnPermissions")) {
        toast.error(parseApiError(error).detail || t("toast.cannotGrantRole"));
        return;
      }

      if (isUserApiErrorCode(error, "auth.roleNotAssignable")) {
        toast.error(parseApiError(error).detail || t("toast.roleNotAssignable"));
        return;
      }

      if (isUserApiErrorCode(error, "auth.ownerNotModifiable")) {
        toast.error(parseApiError(error).detail || t("toast.ownerLocked"));
        return;
      }

      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.roleUpdateFailed"));
    },
  });
}
