import type { TFunction } from "i18next";
import { z } from "zod";

export function createWalletAdjustSchema(t: TFunction<"admin">) {
  return z.object({
    direction: z.enum(["CREDIT", "DEBIT"]),
    amount: z
      .string()
      .trim()
      .min(1, t("companies.detail.wallet.validation.amount"))
      .refine((value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0.01 && parsed <= 1_000_000;
      }, t("companies.detail.wallet.validation.amount"))
      .refine((value) => {
        const parsed = Number(value);
        return Math.round(parsed * 100) === parsed * 100;
      }, t("companies.detail.wallet.validation.amountDecimals")),
    note: z
      .string()
      .trim()
      .min(1, t("companies.detail.wallet.validation.noteRequired"))
      .max(500, t("companies.detail.wallet.validation.noteMax")),
  });
}

export type WalletAdjustFormValues = z.infer<
  ReturnType<typeof createWalletAdjustSchema>
>;

export function parseWalletAdjustAmount(amount: string): number {
  return Number(amount);
}
