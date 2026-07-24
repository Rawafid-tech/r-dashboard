import { z } from "zod";
import type { TFunction } from "i18next";
import { MonthlyShipmentVolume } from "@/shared/types/enums";
import {
  emailField,
  optionalPastDateField,
  optionalTrimmedString,
  passwordField,
  phoneField,
  requiredString,
} from "@/shared/lib/validators";

const volumeValues = Object.values(MonthlyShipmentVolume) as [
  MonthlyShipmentVolume,
  ...MonthlyShipmentVolume[],
];

export const REGISTER_COUNTRIES = [
  "EG",
  "SA",
  "AE",
  "KW",
  "QA",
  "BH",
  "OM",
  "JO",
] as const;

export type RegisterCountry = (typeof REGISTER_COUNTRIES)[number];

export function createRegisterSchema(t: TFunction<"auth">) {
  return z
    .object({
      firstName: requiredString(t("register.errors.required")).max(255),
      lastName: requiredString(t("register.errors.required")).max(255),
      email: emailField({
        required: t("register.errors.required"),
        invalid: t("register.errors.email"),
      }),
      phone: phoneField({
        required: t("register.errors.required"),
        invalid: t("register.errors.phone"),
      }),
      password: passwordField({
        min: t("register.errors.passwordMin"),
        max: t("register.errors.passwordMax"),
      }),
      confirmPassword: requiredString(t("register.errors.required")),
      dateOfBirth: optionalPastDateField(t("register.errors.dateOfBirthPast")),
      companyName: optionalTrimmedString(255),
      shipFromCountry: z.enum(REGISTER_COUNTRIES, {
        errorMap: () => ({ message: t("register.errors.country") }),
      }),
      monthlyShipmentVolume: z.enum(volumeValues, {
        errorMap: () => ({ message: t("register.errors.required") }),
      }),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("register.errors.passwordMismatch"),
          path: ["confirmPassword"],
        });
      }
    });
}

export type RegisterFormValues = z.infer<
  ReturnType<typeof createRegisterSchema>
>;

export const REGISTER_STEP_FIELDS = {
  1: [
    "firstName",
    "lastName",
    "email",
    "phone",
    "password",
    "confirmPassword",
    "dateOfBirth",
  ],
  2: ["companyName", "shipFromCountry", "monthlyShipmentVolume"],
} as const satisfies Record<1 | 2, readonly (keyof RegisterFormValues)[]>;
