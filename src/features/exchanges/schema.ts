import type { TFunction } from "i18next";
import { z } from "zod";
import { normalizeNumericInput } from "@/features/orders/schema";

const MAX_REASON = 500;
const MAX_NOTES = 500;
const MIN_ADDRESS = 6;
const MAX_ADDRESS = 500;
const MAX_CARRIER_AMOUNT = 30_000;

export type ExchangeMoneyMode = "none" | "collect" | "refund";

function exchangePhoneField(t: TFunction<"exchanges">) {
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

function amountField(t: TFunction<"exchanges">, messageKey: "collectInvalid" | "refundInvalid") {
  return z.preprocess(
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
            message: t(`validation.${messageKey}`),
          });
          return;
        }
        if (parsed > MAX_CARRIER_AMOUNT) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.collectTooHigh"),
          });
        }
      }),
  );
}

export function buildExchangeBookingSchema(
  t: TFunction<"exchanges">,
  maxRefundable: number,
  moneyMode: ExchangeMoneyMode,
) {
  return z
    .object({
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
      moneyAmount: amountField(
        t,
        moneyMode === "collect" ? "collectInvalid" : "refundInvalid",
      ).optional(),
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
      phone: exchangePhoneField(t),
    })
    .superRefine((data, ctx) => {
      if (moneyMode === "collect" || moneyMode === "refund") {
        const raw = data.moneyAmount;
        if (!raw) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              moneyMode === "collect"
                ? t("validation.collectRequired")
                : t("validation.refundRequired"),
            path: ["moneyAmount"],
          });
          return;
        }
        const parsed = Number(raw);
        if (moneyMode === "refund" && parsed > maxRefundable) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.refundTooHigh", {
              max: maxRefundable.toFixed(2),
            }),
            path: ["moneyAmount"],
          });
        }
      }
    });
}

export function hasExchangeItemsSelected(
  quantities: Record<string, number>,
): boolean {
  return Object.values(quantities).some((qty) => qty > 0);
}
