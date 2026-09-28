import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PaymentStatusBadge } from "@/features/wallet/components/wallet-payment-status-badge";
import { getPaymentGatewayLabel } from "@/features/wallet/lib/payment-gateway-label";
import type { Payment } from "@/features/wallet/types";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";

interface WalletPaymentDetailSheetProps {
  payment: Payment | null;
  intlLocale: string;
  dateFormat?: "DD_MM_YYYY" | "MM_DD_YYYY" | "YYYY_MM_DD";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletPaymentDetailSheet({
  payment,
  intlLocale,
  dateFormat = "DD_MM_YYYY",
  open,
  onOpenChange,
}: WalletPaymentDetailSheetProps) {
  const { t } = useTranslation("wallet");
  const [copied, setCopied] = useState(false);

  const handleCopyId = useCallback(async () => {
    if (!payment?.id) return;
    try {
      await navigator.clipboard.writeText(payment.id);
      setCopied(true);
      toast.success(t("payments.detail.copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable — fail silently
    }
  }, [payment?.id, t]);

  if (!payment) return null;

  const formattedAmount = formatCurrency(payment.amount, payment.currency, intlLocale);
  const isSettling = payment.status === "COMPLETED" && !payment.credited;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <div className="px-4 pb-6 sm:px-6">
          <SheetHeader className="p-0 pt-4">
            <SheetTitle>{t("payments.detail.title")}</SheetTitle>
            <SheetDescription dir="ltr" className="text-start font-mono text-xs">
              {payment.id}
            </SheetDescription>
          </SheetHeader>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                {t("payments.detail.status")}
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <PaymentStatusBadge
                  status={payment.status}
                  credited={payment.credited}
                />
                {isSettling ? (
                  <p className="text-xs text-muted-foreground">
                    {t("payments.settlingHint")}
                  </p>
                ) : null}
              </dd>
            </div>

            <DetailItem
              label={t("payments.detail.amount")}
              value={formattedAmount}
              dir="ltr"
              valueClassName="tabular-nums font-semibold"
            />
            <DetailItem
              label={t("payments.detail.currency")}
              value={payment.currency}
              dir="ltr"
            />
            <DetailItem
              label={t("payments.detail.gateway")}
              value={getPaymentGatewayLabel(payment.gateway, t)}
              dir="ltr"
            />

            {payment.paymentMethod ? (
              <DetailItem
                label={t("payments.detail.method")}
                value={[payment.paymentMethod, payment.paymentMethodDetail]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ) : null}

            <DetailItem
              label={t("payments.detail.credited")}
              value={payment.credited
                ? t("payments.detail.creditedYes")
                : t("payments.detail.creditedNo")}
            />

            {/* failureReason is English-only from gateway — show as supporting detail */}
            {payment.failureReason ? (
              <div className="sm:col-span-2 space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  {t("payments.detail.failureReason")}
                </dt>
                <dd className="rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2 text-sm text-destructive" dir="ltr">
                  {payment.failureReason}
                </dd>
              </div>
            ) : null}

            <DetailItem
              label={t("payments.detail.createdAt")}
              value={formatDate(payment.createdAt, dateFormat)}
              dir="ltr"
            />
            <DetailItem
              label={t("payments.detail.updatedAt")}
              value={formatDate(payment.updatedAt, dateFormat)}
              dir="ltr"
            />

            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                {t("payments.detail.id")}
              </dt>
              <dd className="flex flex-wrap items-center gap-2">
                <code
                  dir="ltr"
                  className="rounded-md bg-muted px-2 py-1 text-xs tabular-nums break-all"
                >
                  {payment.id}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopyId()}
                  aria-live="polite"
                >
                  {copied
                    ? t("payments.detail.copied")
                    : t("payments.detail.copyId")}
                </Button>
              </dd>
            </div>
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
        className={`mt-1 text-sm text-foreground ${valueClassName ?? ""}`}
      >
        {dir ? (
          <span dir={dir} className="inline-block">
            {value}
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
