import { z } from "zod";
import type { TFunction } from "i18next";
import {
  emailField,
  optionalPastDateField,
  passwordField,
  requiredString,
} from "@/shared/lib/validators";

const tenantPhoneRegex = /^\+?[0-9]{8,15}$/;

function tenantPhoneField(t: TFunction<"users">) {
  return requiredString(t("form.validation.phoneRequired")).superRefine(
    (value, ctx) => {
      if (!tenantPhoneRegex.test(value.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.phoneInvalid"),
        });
      }
    },
  );
}

export function createInviteUserSchema(t: TFunction<"users">) {
  return z.object({
    firstName: requiredString(t("form.validation.firstNameRequired")).max(255),
    lastName: requiredString(t("form.validation.lastNameRequired")).max(255),
    email: emailField({
      required: t("form.validation.emailRequired"),
      invalid: t("form.validation.emailInvalid"),
    }),
    phone: tenantPhoneField(t),
    roleId: z.string().optional().or(z.literal("")),
  });
}

export type InviteUserFormValues = z.infer<
  ReturnType<typeof createInviteUserSchema>
>;

export const EMPTY_INVITE_USER_VALUES: InviteUserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  roleId: "",
};

export function createEditUserSchema(t: TFunction<"users">) {
  return z.object({
    firstName: requiredString(t("form.validation.firstNameRequired")).max(255),
    lastName: requiredString(t("form.validation.lastNameRequired")).max(255),
    phone: tenantPhoneField(t),
    dateOfBirth: optionalPastDateField(t("form.validation.dateOfBirthPast")),
  });
}

export type EditUserFormValues = z.infer<
  ReturnType<typeof createEditUserSchema>
>;

export function createSetUserPasswordSchema(t: TFunction<"users">) {
  return z
    .object({
      newPassword: passwordField({
        min: t("form.validation.passwordMin"),
        max: t("form.validation.passwordMax"),
      }),
      confirmPassword: requiredString(t("form.validation.passwordConfirmRequired")),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.passwordMismatch"),
          path: ["confirmPassword"],
        });
      }
    });
}

export type SetUserPasswordFormValues = z.infer<
  ReturnType<typeof createSetUserPasswordSchema>
>;

export function createUserRoleSchema(_t: TFunction<"users">) {
  return z.object({
    roleId: z.string().optional().or(z.literal("")),
  });
}

export type UserRoleFormValues = z.infer<
  ReturnType<typeof createUserRoleSchema>
>;
