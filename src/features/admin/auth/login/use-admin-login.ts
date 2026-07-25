import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { loginAdmin } from "@/features/admin/auth/api/admin-auth.api";
import type { AdminLoginFormValues } from "@/features/admin/auth/login/schema";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
import { useAdminAuthStore } from "@/stores/admin-auth.store";

export function useAdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");
  const setTokens = useAdminAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (values: AdminLoginFormValues) =>
      loginAdmin({
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
          ?.pathname ?? "/admin";

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

export function applyAdminLoginFieldErrors(
  error: unknown,
  setError: (
    name: keyof AdminLoginFormValues,
    error: { type: string; message: string },
  ) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name as keyof AdminLoginFormValues, {
      type: "server",
      message: reason,
    });
  }
}
