import { z } from "zod";
import type { TFunction } from "i18next";

export function createRoleSchema(t: TFunction<"roles">) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t("form.validation.nameRequired"))
      .max(100, t("form.validation.nameMax")),
    description: z
      .string()
      .trim()
      .max(500, t("form.validation.descriptionMax"))
      .optional()
      .or(z.literal("")),
    permissionIds: z
      .array(z.string())
      .max(500, t("form.validation.permissionsMax")),
  });
}

export type RoleFormValues = z.infer<ReturnType<typeof createRoleSchema>>;

export const EMPTY_ROLE_FORM_VALUES: RoleFormValues = {
  name: "",
  description: "",
  permissionIds: [],
};
