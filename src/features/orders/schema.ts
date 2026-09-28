import type { TFunction } from "i18next";
import { z } from "zod";
import { optionalTrimmedString, requiredString } from "@/shared/lib/validators";

const MAX_DIMENSION = 999.99;
const MAX_WEIGHT = 999.999;
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Western digits and a dot, so "٣٠,٥" and "30,5" validate the same as "30.5". */
export function normalizeNumericInput(value: string): string {
  let out = "";

  for (const char of value.trim()) {
    const arabic = ARABIC_DIGITS.indexOf(char);
    if (arabic >= 0) {
      out += String(arabic);
      continue;
    }

    const persian = PERSIAN_DIGITS.indexOf(char);
    if (persian >= 0) {
      out += String(persian);
      continue;
    }

    if (char === "٫" || char === "," || char === "،") {
      out += ".";
      continue;
    }

    if (char === "٬" || char === " " || char === "\u00a0") continue;
    out += char;
  }

  return out;
}

function limitDecimals(value: string, places: number): string {
  const normalized = normalizeNumericInput(value);
  if (!normalized.includes(".")) return normalized;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return normalized;
  return parsed.toFixed(places).replace(/\.?0+$/, "");
}

function asNumericString(places?: number) {
  return (value: unknown) => {
    if (typeof value !== "string") return value;
    return places == null ? normalizeNumericInput(value) : limitDecimals(value, places);
  };
}

function orderPhoneField(t: TFunction<"orders">, required: boolean) {
  let schema = z.string().trim();
  if (required) {
    schema = schema.min(1, t("form.validation.phoneRequired"));
  }
  return schema.superRefine((value, ctx) => {
    if (!value) return;
    const normalized = value.replace(/\s/g, "");
    if (!/^\+?\d{8,15}$/.test(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("form.validation.phoneInvalid"),
      });
    }
  });
}

function dimensionField(t: TFunction<"orders">, field: string) {
  return z.preprocess(
    asNumericString(2),
    z
      .string()
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
        }
      }),
  );
}

function weightField(t: TFunction<"orders">) {
  return z.preprocess(
    asNumericString(3),
    z
      .string()
      .min(1, t("form.validation.weightRequired"))
      .superRefine((value, ctx) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("form.validation.weightPositive"),
          });
          return;
        }
        if (parsed > MAX_WEIGHT) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("form.validation.weightMax"),
          });
        }
      }),
  );
}

function positiveIntField(message: string) {
  return z.preprocess(
    asNumericString(),
    z
      .string()
      .min(1, message)
      .superRefine((value, ctx) => {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 1) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message });
        }
      }),
  );
}

function moneyField(message: string) {
  return z.preprocess(
    asNumericString(2),
    z
      .string()
      .min(1, message)
      .superRefine((value, ctx) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message });
        }
      }),
  );
}

export function createOrderItemSchema(t: TFunction<"orders">) {
  return z.object({
    name: requiredString(t("form.validation.itemNameRequired")).max(255),
    sku: optionalTrimmedString(100),
    unitPrice: moneyField(t("form.validation.unitPriceRequired")),
    quantity: positiveIntField(t("form.validation.quantityRequired")),
  });
}

export function createOrderPackageSchema(t: TFunction<"orders">) {
  return z.object({
    boxName: optionalTrimmedString(100),
    lengthCm: dimensionField(t, t("form.lengthCm")),
    widthCm: dimensionField(t, t("form.widthCm")),
    heightCm: dimensionField(t, t("form.heightCm")),
    weightKg: weightField(t),
  });
}

export function createOrderStep1Schema(t: TFunction<"orders">) {
  return z.object({
    receiverFirstName: requiredString(t("form.validation.firstNameRequired")).max(
      100,
    ),
    receiverLastName: optionalTrimmedString(100),
    receiverPhone: orderPhoneField(t, true),
    receiverAltPhone: orderPhoneField(t, false),
    receiverEmail: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => !value || z.string().email().safeParse(value).success,
        t("form.validation.emailInvalid"),
      ),
    governorateId: requiredString(t("form.validation.governorateRequired")),
    area: requiredString(t("form.validation.areaRequired")).max(255),
    addressLine: requiredString(t("form.validation.addressLineRequired")).max(500),
    street: optionalTrimmedString(255),
    buildingNumber: optionalTrimmedString(50),
    floor: optionalTrimmedString(20),
    apartment: optionalTrimmedString(20),
    landmark: optionalTrimmedString(255),
    postalCode: optionalTrimmedString(20),
  });
}

export function createOrderStep2Schema(t: TFunction<"orders">) {
  return z
    .object({
      orderNumber: optionalTrimmedString(50),
      senderLocationId: optionalTrimmedString(64),
      paymentMethod: z.enum(["COD", "PREPAID"]),
      orderValue: moneyField(t("form.validation.orderValueRequired")),
      codAmount: optionalTrimmedString(20),
      invoiceNumber: optionalTrimmedString(100),
      description: optionalTrimmedString(500),
      deliveryNotes: optionalTrimmedString(500),
      items: z.array(createOrderItemSchema(t)).max(100),
      packages: z
        .array(createOrderPackageSchema(t))
        .min(1, t("form.validation.packageRequired"))
        .max(20),
    })
    .superRefine((values, ctx) => {
      const orderValue = Number(values.orderValue);
      if (values.paymentMethod === "COD" && orderValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("form.validation.codOrderValuePositive"),
          path: ["orderValue"],
        });
      }

      if (values.paymentMethod === "COD" && values.codAmount?.trim()) {
        const cod = Number(values.codAmount);
        if (!Number.isFinite(cod) || cod <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("form.validation.codAmountPositive"),
            path: ["codAmount"],
          });
        }
      }
    });
}

export type OrderStep1Values = z.infer<ReturnType<typeof createOrderStep1Schema>>;
export type OrderStep2Values = z.infer<ReturnType<typeof createOrderStep2Schema>>;
export type OrderFormValues = OrderStep1Values & OrderStep2Values;

export const EMPTY_ORDER_ITEM: OrderFormValues["items"][number] = {
  name: "",
  sku: "",
  unitPrice: "",
  quantity: "1",
};

export const EMPTY_ORDER_PACKAGE: OrderFormValues["packages"][number] = {
  boxName: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  weightKg: "",
};

export const EMPTY_ORDER_FORM_VALUES: OrderFormValues = {
  orderNumber: "",
  senderLocationId: "",
  receiverFirstName: "",
  receiverLastName: "",
  receiverPhone: "",
  receiverAltPhone: "",
  receiverEmail: "",
  governorateId: "",
  area: "",
  addressLine: "",
  street: "",
  buildingNumber: "",
  floor: "",
  apartment: "",
  landmark: "",
  postalCode: "",
  paymentMethod: "COD",
  orderValue: "",
  codAmount: "",
  invoiceNumber: "",
  description: "",
  deliveryNotes: "",
  items: [],
  packages: [{ ...EMPTY_ORDER_PACKAGE }],
};
