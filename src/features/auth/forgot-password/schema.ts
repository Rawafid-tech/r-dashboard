import { z } from "zod";
import type { TFunction } from "i18next";
import { emailField } from "@/shared/lib/validators";

export function createForgotPasswordSchema(t: TFunction<"auth">) {
  return z.object({
    email: emailField({
      required: t("forgotPassword.errors.required"),
      invalid: t("forgotPassword.errors.email"),
    }),
  });
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
