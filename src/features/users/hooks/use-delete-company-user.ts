import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { deleteCompanyUser } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/hooks/use-company-users";
import { isUserApiErrorCode } from "@/features/users/lib/user-form-errors";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useDeleteCompanyUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (userId: string) => deleteCompanyUser(userId),
    onSuccess: (_data, userId) => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: usersQueryKeys.detail(userId) });
      toast.success(t("toast.deleted"));
    },
    onError: (error) => {
      if (isUserApiErrorCode(error, "auth.cannotDeleteSelf")) {
        toast.error(parseApiError(error).detail || t("toast.cannotDeleteSelf"));
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

      toast.error(parseApiError(error).detail || t("toast.deleteFailed"));
    },
  });
}
