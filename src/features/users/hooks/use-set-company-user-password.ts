import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { setCompanyUserPassword } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/hooks/use-company-users";
import { isUserApiErrorCode } from "@/features/users/lib/user-form-errors";
import type { SetUserPasswordPayload } from "@/features/users/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useSetCompanyUserPassword(userId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: SetUserPasswordPayload) =>
      setCompanyUserPassword(userId, payload),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.setQueryData(usersQueryKeys.detail(user.id), user);
      toast.success(t("toast.passwordSet"));
    },
    onError: (error) => {
      if (isUserApiErrorCode(error, "auth.ownerNotModifiable")) {
        toast.error(parseApiError(error).detail || t("toast.ownerLocked"));
        return;
      }

      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.passwordSetFailed"));
    },
  });
}
