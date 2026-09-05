import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  formatSignedWalletAmount,
  getWalletTransactionTypeLabel,
} from "@/features/wallet/lib/wallet-transaction-label";
import type { WalletTransaction } from "@/features/wallet/types";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";

interface WalletTransactionDetailSheetProps {
  transaction: WalletTransaction | null;
  currency: string;
  intlLocale: string;
  dateFormat?: "DD_MM_YYYY" | "MM_DD_YYYY" | "YYYY_MM_DD";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletTransactionDetailSheet({
  transaction,
  currency,
  intlLocale,
  dateFormat = "DD_MM_YYYY",
  open,
  onOpenChange,
}: WalletTransactionDetailSheetProps) {
  const { t } = useTranslation("wallet");
  const [copied, setCopied] = useState(false);

  const handleCopyReference = useCallback(async () => {
    if (!transaction?.referenceId) return;

    try {
      await navigator.clipboard.writeText(transaction.referenceId);
      setCopied(true);
      toast.success(t("detail.copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable — fail silently
    }
  }, [t, transaction?.referenceId]);

  if (!transaction) return null;

  const typeLabel = getWalletTransactionTypeLabel(
    transaction.type,
    transaction.direction,
    t,
  );
  const signedAmount = formatSignedWalletAmount(
    transaction.amount,
    transaction.direction,
    currency,
    intlLocale,
  );
  const directionLabel =
    transaction.direction === "CREDIT"
      ? t("detail.directionCredit")
      : t("detail.directionDebit");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <div className="px-4 pb-6 sm:px-6">
          <SheetHeader className="p-0 pt-4">
            <SheetTitle>{t("detail.title")}</SheetTitle>
            <SheetDescription>{typeLabel}</SheetDescription>
          </SheetHeader>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailItem label={t("detail.type")} value={typeLabel} />
          <DetailItem label={t("detail.direction")} value={directionLabel} />
          <DetailItem
            label={t("detail.amount")}
            value={signedAmount}
            valueClassName="font-semibold tabular-nums"
            dir="ltr"
          />
          <DetailItem
            label={t("detail.createdAt")}
            value={formatDate(transaction.createdAt, dateFormat)}
            dir="ltr"
          />
          <DetailItem
            label={t("detail.balanceBefore")}
            value={formatCurrency(
              transaction.balanceBefore,
              currency,
              intlLocale,
            )}
            dir="ltr"
            valueClassName="tabular-nums"
          />
          <DetailItem
            label={t("detail.balanceAfter")}
            value={formatCurrency(
              transaction.balanceAfter,
              currency,
              intlLocale,
            )}
            dir="ltr"
            valueClassName="tabular-nums"
          />
          <DetailItem
            label={t("detail.note")}
            value={transaction.note ?? t("table.noNote")}
            className="sm:col-span-2"
          />
          {transaction.referenceType ? (
            <DetailItem
              label={t("detail.referenceType")}
              value={transaction.referenceType}
            />
          ) : null}
          {transaction.referenceId ? (
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                {t("detail.referenceId")}
              </dt>
              <dd className="flex flex-wrap items-center gap-2">
                <code
                  dir="ltr"
                  className="rounded-md bg-muted px-2 py-1 text-xs tabular-nums"
                >
                  {transaction.referenceId}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopyReference()}
                  aria-live="polite"
                >
                  {copied ? t("detail.copied") : t("detail.copyReference")}
                </Button>
              </dd>
            </div>
          ) : null}
          </dl>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({
  label,
  value,
  className,
  valueClassName,
  dir,
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        dir={dir}
        className={`mt-1 text-sm text-foreground ${valueClassName ?? ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
