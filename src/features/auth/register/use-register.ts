import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { loginUser, registerUser } from "@/features/auth/api/auth.api";
import type { RegisterFormValues } from "@/features/auth/register/schema";
import type { RegisterRequest } from "@/features/auth/types";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
import { useAuthStore } from "@/stores/auth.store";

function toRegisterPayload(values: RegisterFormValues): RegisterRequest {
  const payload: RegisterRequest = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    password: values.password,
    phone: values.phone.trim(),
    shipFromCountry: values.shipFromCountry,
    monthlyShipmentVolume: values.monthlyShipmentVolume,
  };

  if (values.dateOfBirth) {
    payload.dateOfBirth = values.dateOfBirth;
  }

  const companyName = values.companyName?.trim();
  if (companyName) {
    payload.companyName = companyName;
  }

  return payload;
}

export function useRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const payload = toRegisterPayload(values);
      await registerUser(payload);
      return loginUser({ email: payload.email, password: payload.password });
    },
    onSuccess: (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
      toast.success(t("register.success"));
      navigate("/", { replace: true });
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      if (isApiError(error, 409)) {
        toast.error(t("register.errors.emailTaken"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("register.errors.generic"));
    },
  });
}

export function applyRegisterFieldErrors(
  error: unknown,
  setError: (
    name: keyof RegisterFormValues,
    error: { type: string; message: string },
  ) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name as keyof RegisterFormValues, {
      type: "server",
      message: reason,
    });
  }
}
