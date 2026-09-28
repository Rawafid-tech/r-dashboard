import type { TFunction } from "i18next";
import { formatCurrency } from "@/shared/lib/formatters";
import type {
  WalletTransaction,
  WalletTransactionDirection,
  WalletTransactionType,
} from "@/features/wallet/types";

const KNOWN_TYPE_LABEL_KEYS: Record<string, string> = {
  ADMIN_CREDIT: "transactionTypes.ADMIN_CREDIT",
  ADMIN_DEBIT: "transactionTypes.ADMIN_DEBIT",
  SUBSCRIPTION_NEW: "transactionTypes.SUBSCRIPTION_NEW",
  SUBSCRIPTION_RENEWAL: "transactionTypes.SUBSCRIPTION_RENEWAL",
  TOP_UP: "transactionTypes.TOP_UP",
  REFUND: "transactionTypes.REFUND",
};

export function getWalletTransactionTypeLabel(
  type: WalletTransactionType,
  direction: WalletTransactionDirection,
  t: TFunction<"wallet">,
): string {
  const key = KNOWN_TYPE_LABEL_KEYS[type];

  if (key) {
    return t(key);
  }

  return direction === "CREDIT"
    ? t("transactionTypes.unknownCredit")
    : t("transactionTypes.unknownDebit");
}

type WalletTransactionLabelSource = Pick<
  WalletTransaction,
  "id" | "type" | "direction" | "createdAt" | "refundedTransactionId"
>;

/**
 * Refunds name the charge they reverse when that row is already on the
 * current page. There is no single-transaction endpoint, so a charge on
 * another page stays the plain "Refund" label.
 */
export function getWalletTransactionDisplayLabel(
  transaction: WalletTransactionLabelSource,
  transactions: readonly WalletTransactionLabelSource[],
  t: TFunction<"wallet">,
  formatChargeDate: (iso: string) => string,
): string {
  const base = getWalletTransactionTypeLabel(
    transaction.type,
    transaction.direction,
    t,
  );

  if (transaction.type !== "REFUND" || !transaction.refundedTransactionId) {
    return base;
  }

  const charge = transactions.find(
    (row) => row.id === transaction.refundedTransactionId,
  );
  if (!charge) return base;

  return t("transactionTypes.refundOf", {
    charge: getWalletTransactionTypeLabel(charge.type, charge.direction, t),
    date: formatChargeDate(charge.createdAt),
  });
}

export function formatSignedWalletAmount(
  amount: number,
  direction: WalletTransactionDirection,
  currency: string,
  intlLocale: string,
): string {
  const absolute = formatCurrency(amount, currency, intlLocale);
  return direction === "CREDIT" ? `+${absolute}` : `−${absolute}`;
}

export function getSignedWalletAmountClassName(
  direction: WalletTransactionDirection,
): string {
  return direction === "CREDIT"
    ? "font-medium tabular-nums text-emerald-600 dark:text-emerald-400"
    : "font-medium tabular-nums text-destructive";
}

export function truncateAdminId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}
