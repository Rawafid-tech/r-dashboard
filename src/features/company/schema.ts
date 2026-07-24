import { z } from "zod";
import type { TFunction } from "i18next";
import { CompanySize, MonthlyShipmentVolume } from "@/shared/types/enums";
import { SHIP_FROM_COUNTRIES } from "@/shared/lib/countries";
import {
  optionalTrimmedString,
  requiredString,
} from "@/shared/lib/validators";

export const COMPANY_SIZE_NONE = "NONE" as const;

const sizeValues = [
  COMPANY_SIZE_NONE,
  ...Object.values(CompanySize),
] as [string, ...string[]];

const volumeValues = Object.values(MonthlyShipmentVolume) as [
  MonthlyShipmentVolume,
  ...MonthlyShipmentVolume[],
];

export function createCompanySchema(t: TFunction<"settings">) {
  return z.object({
    name: requiredString(t("validation.required")).max(255),
    size: z.enum(sizeValues, {
      errorMap: () => ({ message: t("validation.required") }),
    }),
    industry: optionalTrimmedString(255),
    website: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal(""))
      .refine(
        (value) =>
          !value || value.startsWith("http://") || value.startsWith("https://"),
        t("validation.website"),
      ),
    shipFromCountry: z.enum(SHIP_FROM_COUNTRIES, {
      errorMap: () => ({ message: t("validation.country") }),
    }),
    monthlyShipmentVolume: z.enum(volumeValues, {
      errorMap: () => ({ message: t("validation.required") }),
    }),
  });
}

export type CompanyFormValues = z.infer<
  ReturnType<typeof createCompanySchema>
>;

export function toUpdateCompanyPayload(values: CompanyFormValues) {
  return {
    name: values.name.trim(),
    size:
      values.size === COMPANY_SIZE_NONE
        ? null
        : (values.size as CompanySize),
    industry: values.industry?.trim() || null,
    website: values.website?.trim() || null,
    shipFromCountry: values.shipFromCountry,
    monthlyShipmentVolume: values.monthlyShipmentVolume,
  };
}
