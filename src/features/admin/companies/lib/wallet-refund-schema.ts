import type { TFunction } from "i18next";
import { z } from "zod";
import { toWalletCents } from "@/features/wallet/lib/wallet-refund";

const MAX_REFUND_CENTS = 100_000_000;

export function createWalletRefundSchema(
  t: TFunction<"admin">,
  maxCents: number,
) {
  const cap = Math.min(Math.max(0, maxCents), MAX_REFUND_CENTS);

  return z.object({
    amount: z
      .string()
      .trim()
      .min(1, t("companies.detail.wallet.validation.amount"))
      .refine(
        (value) => /^\d+(\.\d{1,2})?$/.test(value),
        t("companies.detail.wallet.validation.amount"),
      )
      .refine(
        (value) => toWalletCents(Number(value)) >= 1,
        t("companies.detail.wallet.validation.amount"),
      )
      .refine(
        (value) => toWalletCents(Number(value)) <= cap,
        t("companies.detail.wallet.validation.amountAboveRefundable"),
      ),
    note: z
      .string()
      .trim()
      .min(1, t("companies.detail.wallet.validation.noteRequired"))
      .max(500, t("companies.detail.wallet.validation.noteMax")),
  });
}

export type WalletRefundFormValues = z.infer<
  ReturnType<typeof createWalletRefundSchema>
>;

export function parseWalletRefundAmount(amount: string): number {
  return toWalletCents(Number(amount)) / 100;
}
