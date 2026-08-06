import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { resendUserInvite } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/hooks/use-company-users";
import { isUserApiErrorCode } from "@/features/users/lib/user-form-errors";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useResendUserInvite() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (userId: string) => resendUserInvite(userId),
    onSuccess: (_data, userId) => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.detail(userId),
      });
      toast.success(t("toast.resendSuccess"));
    },
    onError: (error) => {
      if (isUserApiErrorCode(error, "auth.verificationResendTooSoon")) {
        toast.error(parseApiError(error).detail || t("toast.resendTooSoon"));
        return;
      }

      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.resendFailed"));
    },
  });
}
