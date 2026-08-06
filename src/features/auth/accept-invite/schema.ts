import { z } from "zod";
import type { TFunction } from "i18next";
import { passwordField, requiredString } from "@/shared/lib/validators";

export function createAcceptInviteSchema(t: TFunction<"auth">) {
  return z
    .object({
      newPassword: passwordField({
        min: t("acceptInvite.errors.passwordMin"),
        max: t("acceptInvite.errors.passwordMax"),
      }),
      confirmPassword: requiredString(t("acceptInvite.errors.required")),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("acceptInvite.errors.passwordMismatch"),
          path: ["confirmPassword"],
        });
      }
    });
}

export type AcceptInviteFormValues = z.infer<
  ReturnType<typeof createAcceptInviteSchema>
>;
