import { z } from "zod";
import type { TFunction } from "i18next";
import { emailField, requiredString } from "@/shared/lib/validators";

export function createAdminLoginSchema(t: TFunction<"admin">) {
  return z.object({
    email: emailField({
      required: t("login.errors.required"),
      invalid: t("login.errors.email"),
    }),
    password: requiredString(t("login.errors.required")),
  });
}

export type AdminLoginFormValues = z.infer<
  ReturnType<typeof createAdminLoginSchema>
>;
