import { z } from "zod";
import type { TFunction } from "i18next";
import {
  DateFormat,
  Theme,
} from "@/shared/types/enums";
import {
  DEFAULT_HOME_PAGES,
  FONT_SCALE_OPTIONS,
  SETTINGS_TIMEZONES,
} from "@/shared/lib/settings-options";
import {
  optionalPastDateField,
  passwordField,
  phoneField,
  requiredString,
} from "@/shared/lib/validators";

const themeValues = Object.values(Theme) as [Theme, ...Theme[]];
const dateFormatValues = Object.values(DateFormat) as [
  DateFormat,
  ...DateFormat[],
];
const fontScaleValues = FONT_SCALE_OPTIONS.map(String) as [string, ...string[]];
const homePageValues = DEFAULT_HOME_PAGES.map((item) => item.value) as [
  string,
  ...string[],
];
const timezoneValues = [...SETTINGS_TIMEZONES] as [string, ...string[]];

export function createProfileSchema(t: TFunction<"settings">) {
  return z.object({
    firstName: requiredString(t("validation.required")).max(255),
    lastName: requiredString(t("validation.required")).max(255),
    phone: phoneField({
      required: t("validation.required"),
      invalid: t("validation.phone"),
    }),
    dateOfBirth: optionalPastDateField(t("validation.dateOfBirthPast")),
  });
}

export type ProfileFormValues = z.infer<
  ReturnType<typeof createProfileSchema>
>;

export function createPasswordSchema(t: TFunction<"settings">) {
  return z
    .object({
      currentPassword: requiredString(t("validation.required")),
      newPassword: passwordField({
        required: t("validation.required"),
        min: t("validation.passwordMin"),
        max: t("validation.passwordMax"),
      }),
      confirmNewPassword: requiredString(t("validation.required")),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword !== data.confirmNewPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.passwordMismatch"),
          path: ["confirmNewPassword"],
        });
      }
    });
}

export type PasswordFormValues = z.infer<
  ReturnType<typeof createPasswordSchema>
>;

export function createPreferencesSchema(t: TFunction<"settings">) {
  return z.object({
    theme: z.enum(themeValues, {
      errorMap: () => ({ message: t("validation.required") }),
    }),
    fontScale: z.enum(fontScaleValues, {
      errorMap: () => ({ message: t("validation.required") }),
    }),
    defaultHomePage: z.enum(homePageValues, {
      errorMap: () => ({ message: t("validation.required") }),
    }),
    timezone: z.enum(timezoneValues, {
      errorMap: () => ({ message: t("validation.timezone") }),
    }),
    dateFormat: z.enum(dateFormatValues, {
      errorMap: () => ({ message: t("validation.required") }),
    }),
    mapLat: z.string().optional().or(z.literal("")),
    mapLng: z.string().optional().or(z.literal("")),
  });
}

export type PreferencesFormValues = z.infer<
  ReturnType<typeof createPreferencesSchema>
>;
