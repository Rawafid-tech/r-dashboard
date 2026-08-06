import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { revealUserInviteLink } from "@/features/users/api/users.api";
import { isUserApiErrorCode } from "@/features/users/lib/user-form-errors";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useRevealUserInviteLink() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (userId: string) => revealUserInviteLink(userId),
    onError: (error) => {
      if (isUserApiErrorCode(error, "auth.accountAlreadyActivated")) {
        toast.error(
          parseApiError(error).detail || t("toast.accountAlreadyActivated"),
        );
        return;
      }

      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.revealFailed"));
    },
  });
}
