import type { TFunction } from "i18next";
import { z } from "zod";
import { requiredString } from "@/shared/lib/validators";

const MAX_DIMENSION = 999.99;

function dimensionField(t: TFunction<"shippingBoxes">, field: string) {
  return z
    .string()
    .trim()
    .min(1, t("form.validation.dimensionRequired", { field }))
    .superRefine((value, ctx) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.dimensionPositive", { field }),
        });
        return;
      }

      if (parsed > MAX_DIMENSION) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.dimensionMax", { field }),
        });
        return;
      }

      const decimalPart = value.includes(".") ? (value.split(".")[1] ?? "") : "";
      if (decimalPart.length > 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.dimensionDecimals", { field }),
        });
      }
    });
}

export function createShippingBoxFormSchema(t: TFunction<"shippingBoxes">) {
  return z.object({
    name: requiredString(t("form.validation.nameRequired")).max(
      100,
      t("form.validation.nameMax"),
    ),
    lengthCm: dimensionField(t, t("form.lengthCm")),
    widthCm: dimensionField(t, t("form.widthCm")),
    heightCm: dimensionField(t, t("form.heightCm")),
    isDefault: z.boolean(),
  });
}

export type ShippingBoxFormValues = z.infer<
  ReturnType<typeof createShippingBoxFormSchema>
>;

export const EMPTY_SHIPPING_BOX_FORM_VALUES: ShippingBoxFormValues = {
  name: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  isDefault: false,
};
