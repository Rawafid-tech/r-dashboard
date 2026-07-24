import { z } from "zod";
import type { TFunction } from "i18next";
import { emailField, requiredString } from "@/shared/lib/validators";

export function createLoginSchema(t: TFunction<"auth">) {
  return z.object({
    email: emailField({
      required: t("login.errors.required"),
      invalid: t("login.errors.email"),
    }),
    password: requiredString(t("login.errors.required")),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
