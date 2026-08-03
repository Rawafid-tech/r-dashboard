import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { resetPassword } from "@/features/auth/api/auth.api";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
import type { ResetPasswordFormValues } from "@/features/auth/reset-password/schema";

export function useResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword({
        email: values.email.trim(),
        code: values.code,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      /**
       * Every session was revoked by the API — do NOT try to keep the user
       * signed in. Navigate to /login with a success flag so the login page
       * can show a one-time success banner.
       */
      navigate("/login", {
        replace: true,
        state: { passwordReset: true },
      });
      toast.success(t("resetPassword.success"));
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      if (isApiError(error, 400)) {
        const apiError = parseApiError(error);
        // Field-level validation errors are handled by the form via applyResetPasswordFieldErrors.
        // auth.invalidVerificationCode collapses wrong/expired/exhausted into one message.
        if (!getFieldErrors(error)) {
          toast.error(apiError.detail || t("resetPassword.errors.invalidCode"));
        }
        return;
      }

      toast.error(t("resetPassword.errors.generic"));
    },
  });
}

export function applyResetPasswordFieldErrors(
  error: unknown,
  setError: (
    name: keyof ResetPasswordFormValues,
    error: { type: string; message: string },
  ) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name as keyof ResetPasswordFormValues, {
      type: "server",
      message: reason,
    });
  }
}
