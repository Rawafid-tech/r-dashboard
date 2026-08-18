import type { TFunction } from "i18next";
import { z } from "zod";
import {
  PRODUCT_HANDLING_VALUES,
  type ProductHandling,
} from "@/features/products/types";
import { requiredString } from "@/shared/lib/validators";

const MAX_PRICE = 9999999999.99;
const MAX_WEIGHT = 9999.999;
const MAX_DIMENSION = 999.99;

const HS_CODE_PATTERN = /^[\d.]+$/;

function optionalTrimmed(max: number) {
  return z.string().trim().max(max).optional().or(z.literal(""));
}

function decimalField(
  t: TFunction<"products">,
  field: string,
  options: {
    required: boolean;
    max: number;
    maxDecimals: number;
    minExclusive?: number;
    minInclusive?: number;
  },
) {
  return z.string().superRefine((value, ctx) => {
    const trimmed = value.trim();

    if (!trimmed) {
      if (options.required) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.fieldRequired", { field }),
        });
      }
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("form.validation.fieldInvalid", { field }),
      });
      return;
    }

    if (options.minExclusive != null && parsed <= options.minExclusive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("form.validation.fieldPositive", { field }),
      });
      return;
    }

    if (options.minInclusive != null && parsed < options.minInclusive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("form.validation.fieldMinZero", { field }),
      });
      return;
    }

    if (parsed > options.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("form.validation.fieldMax", { field, max: options.max }),
      });
      return;
    }

    const decimalPart = trimmed.includes(".")
      ? (trimmed.split(".")[1] ?? "")
      : "";
    if (decimalPart.length > options.maxDecimals) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("form.validation.fieldDecimals", {
          field,
          decimals: options.maxDecimals,
        }),
      });
    }
  });
}

export function createProductFormSchema(t: TFunction<"products">) {
  return z
    .object({
      name: requiredString(t("form.validation.nameRequired")).max(
        200,
        t("form.validation.nameMax"),
      ),
      sku: requiredString(t("form.validation.skuRequired")).max(
        64,
        t("form.validation.skuMax"),
      ),
      barcode: optionalTrimmed(64),
      hsCode: optionalTrimmed(20).superRefine((value, ctx) => {
        if (!value) return;
        if (
          !HS_CODE_PATTERN.test(value) ||
          value.startsWith(".") ||
          value.endsWith(".") ||
          value.includes("..")
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("form.validation.hsCodeInvalid"),
          });
        }
      }),
      description: optionalTrimmed(1000),
      price: decimalField(t, t("form.price"), {
        required: true,
        max: MAX_PRICE,
        maxDecimals: 2,
        minInclusive: 0,
      }),
      weightKg: decimalField(t, t("form.weightKg"), {
        required: true,
        max: MAX_WEIGHT,
        maxDecimals: 3,
        minExclusive: 0,
      }),
      lengthCm: decimalField(t, t("form.lengthCm"), {
        required: false,
        max: MAX_DIMENSION,
        maxDecimals: 2,
        minExclusive: 0,
      }),
      widthCm: decimalField(t, t("form.widthCm"), {
        required: false,
        max: MAX_DIMENSION,
        maxDecimals: 2,
        minExclusive: 0,
      }),
      heightCm: decimalField(t, t("form.heightCm"), {
        required: false,
        max: MAX_DIMENSION,
        maxDecimals: 2,
        minExclusive: 0,
      }),
      handling: z.enum(PRODUCT_HANDLING_VALUES),
      categoryId: z.string().optional().or(z.literal("")),
      imageMediaId: z.string().optional().or(z.literal("")),
    })
    .superRefine((values, ctx) => {
      const dims = [values.lengthCm, values.widthCm, values.heightCm].map(
        (value) => value.trim(),
      );
      const filled = dims.filter(Boolean).length;

      if (filled > 0 && filled < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.dimensionsAllOrNone"),
          path: ["lengthCm"],
        });
      }
    });
}

export type ProductFormValues = z.infer<
  ReturnType<typeof createProductFormSchema>
>;

export const EMPTY_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: "",
  sku: "",
  barcode: "",
  hsCode: "",
  description: "",
  price: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  handling: "GENERAL",
  categoryId: "",
  imageMediaId: "",
};

export function createCategoryFormSchema(t: TFunction<"products">) {
  return z.object({
    name: requiredString(t("categories.form.validation.nameRequired")).max(
      100,
      t("categories.form.validation.nameMax"),
    ),
    parentId: z.string().optional().or(z.literal("")),
  });
}

export type CategoryFormValues = z.infer<
  ReturnType<typeof createCategoryFormSchema>
>;

export const EMPTY_CATEGORY_FORM_VALUES: CategoryFormValues = {
  name: "",
  parentId: "",
};

export function isProductHandling(value: string): value is ProductHandling {
  return PRODUCT_HANDLING_VALUES.includes(value as ProductHandling);
}
