import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { inviteCompanyUser } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/hooks/use-company-users";
import {
  isUserApiErrorCode,
} from "@/features/users/lib/user-form-errors";
import type { InviteUserPayload } from "@/features/users/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useInviteCompanyUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: InviteUserPayload) => inviteCompanyUser(payload),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.setQueryData(usersQueryKeys.detail(user.id), user);
      toast.success(t("toast.inviteCreated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isUserApiErrorCode(error, "auth.emailAlreadyUsed")) {
        return;
      }

      if (isUserApiErrorCode(error, "auth.inviteQuotaExceeded")) {
        toast.error(parseApiError(error).detail || t("toast.inviteQuotaExceeded"));
        return;
      }

      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.inviteFailed"));
    },
  });
}
