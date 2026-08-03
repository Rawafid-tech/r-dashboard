import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { forgotPassword } from "@/features/auth/api/auth.api";
import { isApiError } from "@/shared/api/error-handler";
import type { ForgotPasswordFormValues } from "@/features/auth/forgot-password/schema";

export function useForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) =>
      forgotPassword({ email: values.email.trim() }),
    onSuccess: (_data, variables) => {
      /**
       * Always advance to the reset screen — the API always returns 202
       * regardless of whether the email is registered. Passing the email
       * through router state avoids asking the user to type it again.
       */
      navigate("/reset-password", {
        state: { email: variables.email.trim() },
        replace: false,
      });
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      toast.error(t("forgotPassword.errors.generic"));
    },
  });
}
