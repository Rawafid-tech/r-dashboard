import { z } from "zod";
import type { TFunction } from "i18next";
import { emailField, passwordField } from "@/shared/lib/validators";

export function createResetPasswordSchema(t: TFunction<"auth">) {
  return z
    .object({
      email: emailField({
        required: t("resetPassword.errors.required"),
        invalid: t("resetPassword.errors.email"),
      }),
      /**
       * Exactly 6 numeric digits. Stored as string to preserve leading zeros.
       * Spaces are stripped client-side before validation to support paste UX.
       */
      code: z
        .string()
        .transform((v) => v.replace(/\s/g, ""))
        .pipe(
          z
            .string()
            .regex(/^\d{6}$/, t("resetPassword.errors.codeFormat")),
        ),
      newPassword: passwordField({
        required: t("resetPassword.errors.required"),
        min: t("resetPassword.errors.passwordMin"),
        max: t("resetPassword.errors.passwordMax"),
      }),
      confirmPassword: z
        .string()
        .min(1, t("resetPassword.errors.required")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("resetPassword.errors.passwordMismatch"),
      path: ["confirmPassword"],
    });
}

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
