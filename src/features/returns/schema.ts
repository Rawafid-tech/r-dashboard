import type { TFunction } from "i18next";
import { z } from "zod";
import { normalizeNumericInput } from "@/features/orders/schema";

const MAX_REASON = 500;
const MAX_NOTES = 500;
const MIN_ADDRESS = 6;
const MAX_ADDRESS = 500;

function returnPhoneField(t: TFunction<"returns">) {
  return z
    .string()
    .trim()
    .optional()
    .superRefine((value, ctx) => {
      if (!value) return;
      const normalized = value.replace(/\s/g, "");
      if (!/^\+?\d{8,15}$/.test(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.phoneInvalid"),
        });
      }
    });
}

export function buildReturnBookingSchema(
  t: TFunction<"returns">,
  maxRefundable: number,
) {
  return z.object({
    reason: z
      .string()
      .trim()
      .max(MAX_REASON, t("validation.reasonTooLong"))
      .optional(),
    notes: z
      .string()
      .trim()
      .max(MAX_NOTES, t("validation.notesTooLong"))
      .optional(),
    refundAmount: z
      .preprocess(
        (value) =>
          typeof value === "string" && value.trim() === ""
            ? undefined
            : normalizeNumericInput(String(value ?? "")),
        z
          .string()
          .optional()
          .superRefine((value, ctx) => {
            if (!value) return;
            const parsed = Number(value);
            if (!Number.isFinite(parsed) || parsed <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("validation.refundInvalid"),
              });
              return;
            }
            if (parsed > maxRefundable) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("validation.refundTooHigh", {
                  max: maxRefundable.toFixed(2),
                }),
              });
            }
          }),
      )
      .optional(),
    addressLine: z
      .string()
      .trim()
      .optional()
      .superRefine((value, ctx) => {
        if (!value) return;
        if (value.length < MIN_ADDRESS || value.length > MAX_ADDRESS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.addressInvalid"),
          });
        }
      }),
    buildingNumber: z.string().trim().optional(),
    floor: z.string().trim().optional(),
    apartment: z.string().trim().optional(),
    phone: returnPhoneField(t),
  });
}

export type ReturnBookingFormValues = z.infer<
  ReturnType<typeof buildReturnBookingSchema>
>;

export function hasReturnItemsSelected(
  quantities: Record<string, number>,
): boolean {
  return Object.values(quantities).some((qty) => qty > 0);
}
