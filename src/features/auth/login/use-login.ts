import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { loginUser } from "@/features/auth/api/auth.api";
import type { LoginFormValues } from "@/features/auth/login/schema";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
import { useAuthStore } from "@/stores/auth.store";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (values: LoginFormValues) =>
      loginUser({
        email: values.email.trim(),
        password: values.password,
      }),
    onSuccess: (tokens) => {
      if (!tokens.accessToken || !tokens.refreshToken) {
        toast.error(t("login.errors.generic"));
        return;
      }

      setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
      toast.success(t("login.success"));

      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? "/";

      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      if (isApiError(error, 401)) {
        toast.error(t("login.errors.invalidCredentials"));
        return;
      }

      if (isApiError(error, 403)) {
        toast.error(t("login.errors.suspended"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("login.errors.generic"));
    },
  });
}

export function applyLoginFieldErrors(
  error: unknown,
  setError: (
    name: keyof LoginFormValues,
    error: { type: string; message: string },
  ) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name as keyof LoginFormValues, {
      type: "server",
      message: reason,
    });
  }
}
