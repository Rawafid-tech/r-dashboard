import { z } from "zod";
import type { TFunction } from "i18next";
import {
  emailField,
  optionalTrimmedString,
  requiredString,
} from "@/shared/lib/validators";

const tenantPhoneRegex = /^\+?[0-9]{8,15}$/;

function tenantPhoneField(t: TFunction<"locations">) {
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

function optionalCoordinateField(
  t: TFunction<"locations">,
  field: "latitude" | "longitude",
) {
  const limits =
    field === "latitude"
      ? { min: -90, max: 90, invalid: t("form.validation.latitudeInvalid") }
      : { min: -180, max: 180, invalid: t("form.validation.longitudeInvalid") };

  return z
    .string()
    .optional()
    .or(z.literal(""))
    .superRefine((value, ctx) => {
      const trimmed = value?.trim() ?? "";
      if (!trimmed) return;

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: limits.invalid });
        return;
      }

      if (parsed < limits.min || parsed > limits.max) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: limits.invalid });
        return;
      }

      const decimalPart = trimmed.includes(".") ? trimmed.split(".")[1] : "";
      if (decimalPart && decimalPart.length > 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.coordinateDecimals"),
        });
      }
    });
}

export function createLocationFormSchema(t: TFunction<"locations">) {
  return z
    .object({
      name: requiredString(t("form.validation.nameRequired")).max(100),
      contactName: requiredString(t("form.validation.contactNameRequired")).max(
        150,
      ),
      contactPhone: tenantPhoneField(t),
      contactEmail: emailField({
        required: t("form.validation.emailRequired"),
        invalid: t("form.validation.emailInvalid"),
      }).max(255, t("form.validation.emailMax")),
      governorateId: requiredString(t("form.validation.governorateRequired")),
      area: requiredString(t("form.validation.areaRequired")).max(150),
      addressLine: requiredString(t("form.validation.addressLineRequired")).max(
        500,
      ),
      street: optionalTrimmedString(200),
      buildingNumber: optionalTrimmedString(50),
      postalCode: optionalTrimmedString(20),
      latitude: optionalCoordinateField(t, "latitude"),
      longitude: optionalCoordinateField(t, "longitude"),
    })
    .superRefine((data, ctx) => {
      const lat = data.latitude?.trim() ?? "";
      const lng = data.longitude?.trim() ?? "";

      if (Boolean(lat) !== Boolean(lng)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.coordinatePair"),
        });
      }
    });
}

export type LocationFormValues = z.infer<
  ReturnType<typeof createLocationFormSchema>
>;

export const EMPTY_LOCATION_FORM_VALUES: LocationFormValues = {
  name: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  governorateId: "",
  area: "",
  addressLine: "",
  street: "",
  buildingNumber: "",
  postalCode: "",
  latitude: "",
  longitude: "",
};
