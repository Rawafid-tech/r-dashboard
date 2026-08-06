import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { acceptInvitation } from "@/features/auth/api/auth.api";
import type { AcceptInviteFormValues } from "@/features/auth/accept-invite/schema";
import { getApiErrorCode } from "@/features/roles/lib/role-form-errors";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
import { useAuthStore } from "@/stores/auth.store";

interface AcceptInviteParams extends AcceptInviteFormValues {
  userId: string;
  token: string;
}

export function useAcceptInvite() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: ({ userId, token, newPassword }: AcceptInviteParams) =>
      acceptInvitation({ userId, token, newPassword }),
    onSuccess: (tokens) => {
      if (!tokens.accessToken || !tokens.refreshToken) {
        toast.error(t("acceptInvite.errors.generic"));
        return;
      }

      setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
      toast.success(t("acceptInvite.success"));
      navigate("/", { replace: true });
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      if (isApiError(error, 409)) {
        if (getApiErrorCode(error) === "auth.accountAlreadyActivated") {
          toast.error(t("acceptInvite.errors.alreadyActivated"));
          navigate("/login", { replace: true });
          return;
        }
      }

      if (isApiError(error, 403)) {
        if (getApiErrorCode(error) === "auth.accountSuspended") {
          toast.error(parseApiError(error).detail || t("acceptInvite.errors.suspended"));
          return;
        }
      }

      if (isApiError(error, 400)) {
        if (!getFieldErrors(error)) {
          toast.error(
            parseApiError(error).detail || t("acceptInvite.errors.invalidLink"),
          );
        }
        return;
      }

      toast.error(parseApiError(error).detail || t("acceptInvite.errors.generic"));
    },
  });
}

export function applyAcceptInviteFieldErrors(
  error: unknown,
  setError: (
    name: keyof AcceptInviteFormValues,
    error: { type: string; message: string },
  ) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name as keyof AcceptInviteFormValues, {
      type: "server",
      message: reason,
    });
  }
}
