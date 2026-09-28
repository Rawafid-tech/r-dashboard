import type { WalletTransaction } from "@/features/wallet/types";

const WALLET_CENT = 100;

export function toWalletCents(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

export function formatWalletCentsInput(cents: number): string {
  const safe = Math.max(0, Math.trunc(cents));
  const whole = Math.trunc(safe / WALLET_CENT);
  const fraction = String(safe % WALLET_CENT).padStart(2, "0");
  return `${whole}.${fraction}`;
}

export function getRefundableCents(
  chargeAmount: number,
  refundedCents: number,
): number {
  return Math.max(0, toWalletCents(chargeAmount) - refundedCents);
}

/** Sum of refund amounts, in cents, keyed by the charge they reverse. */
export function sumRefundedCents(
  rows: readonly Pick<WalletTransaction, "refundedTransactionId" | "amount">[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const row of rows) {
    if (!row.refundedTransactionId) continue;
    const current = totals[row.refundedTransactionId] ?? 0;
    totals[row.refundedTransactionId] = current + toWalletCents(row.amount);
  }

  return totals;
}
