import { useEffect, useMemo, useRef, useState } from "react";
import { AxiosError } from "axios";
import { ExternalLink, Eye, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { WalletPaymentDetailSheet } from "@/features/wallet/components/wallet-payment-detail-sheet";
import { PaymentStatusBadge } from "@/features/wallet/components/wallet-payment-status-badge";
import {
  parseTopUpMinimumError,
  useTopUpMutation,
} from "@/features/wallet/hooks/use-topup-mutation";
import type { Payment } from "@/features/wallet/types";
import { Button } from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";

interface WalletPaymentsTableProps {
  payments: Payment[];
  intlLocale: string;
  dateFormat?: "DD_MM_YYYY" | "MM_DD_YYYY" | "YYYY_MM_DD";
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}

export function WalletPaymentsTable({
  payments,
  intlLocale,
  dateFormat = "DD_MM_YYYY",
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isFetching,
}: WalletPaymentsTableProps) {
  const { t } = useTranslation(["wallet", "common"]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const retryMutation = useTopUpMutation();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const retryPayment = (payment: Payment) => {
    if (retryMutation.isPending) return;

    setRetryingId(payment.id);
    retryMutation.mutate(
      { amount: payment.amount },
      {
        onError: (error) => {
          if (!mountedRef.current) return;

          const minimumError = parseTopUpMinimumError(error);
          if (minimumError) {
            toast.error(
              t("topup.errorBelowMinimum", {
                amount: formatCurrency(
                  minimumError.minimum,
                  minimumError.currency,
                  intlLocale,
                ),
              }),
            );
            return;
          }

          if (error instanceof AxiosError && error.response?.status === 502) {
            toast.error(t("topup.errorGatewayDown"));
            return;
          }

          toast.error(t("topup.errorGeneric"));
        },
        onSettled: () => {
          if (mountedRef.current) setRetryingId(null);
        },
      },
    );
  };

  const columns = useMemo<DataTableColumn<Payment>[]>(
    () => [
      {
        id: "date",
        header: t("payments.date"),
        cell: (payment) => (
          <time
            className="tabular-nums text-muted-foreground"
            dateTime={payment.createdAt}
          >
            <span dir="ltr" className="inline-block">
              {formatDate(payment.createdAt, dateFormat)}
            </span>
          </time>
        ),
      },
      {
        id: "method",
        header: t("payments.method"),
        cell: (payment) => {
          const label = [payment.paymentMethod, payment.paymentMethodDetail]
            .filter(Boolean)
            .join(" · ");

          return (
            <span className="text-sm text-foreground">
              {label || (
                <span className="text-muted-foreground">
                  {t("payments.methodFallback")}
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: "amount",
        header: t("payments.amount"),
        cell: (payment) => (
          <span
            className="tabular-nums font-medium text-foreground"
            dir="ltr"
          >
            {formatCurrency(payment.amount, payment.currency, intlLocale)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("payments.status"),
        cell: (payment) => {
          const isSettling =
            payment.status === "COMPLETED" && !payment.credited;

          return (
            <div className="flex flex-col gap-1">
              <PaymentStatusBadge
                status={payment.status}
                credited={payment.credited}
              />
              {isSettling ? (
                <p className="text-xs text-muted-foreground">
                  {t("payments.settlingHint")}
                </p>
              ) : null}
              {/* failureReason: English-only from gateway — shown as supporting detail */}
              {payment.status === "FAILED" && payment.failureReason ? (
                <p
                  className="text-xs text-muted-foreground"
                  title={payment.failureReason}
                  dir="ltr"
                >
                  {payment.failureReason}
                </p>
              ) : null}
            </div>
          );
        },
      },
    ],
    [dateFormat, intlLocale, t],
  );

  const renderPaymentRetry = (
    payment: Payment,
    formattedAmount: string,
    presentation: "icon" | "labeled",
  ) => {
    const retrying = retryMutation.isPending && retryingId === payment.id;

    if (payment.status === "FAILED") {
      return (
        <Button
          type="button"
          variant={presentation === "icon" ? "ghost" : "outline"}
          size={presentation === "icon" ? "icon-sm" : "sm"}
          disabled={retryMutation.isPending}
          aria-busy={retrying || undefined}
          aria-label={
            retrying
              ? t("payments.tryAgainBusy")
              : t("payments.tryAgainLabel", { amount: formattedAmount })
          }
          onClick={() => retryPayment(payment)}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {presentation === "labeled"
            ? retrying
              ? t("payments.tryAgainBusy")
              : t("payments.tryAgain")
            : null}
        </Button>
      );
    }

    if (!payment.checkoutUrl) return null;

    return (
      <Button
        type="button"
        variant={presentation === "icon" ? "ghost" : "outline"}
        size={presentation === "icon" ? "icon-sm" : "sm"}
        aria-label={t("payments.resumeLabel", { amount: formattedAmount })}
        onClick={() => {
          window.location.href = payment.checkoutUrl!;
        }}
      >
        <ExternalLink className="size-4" aria-hidden="true" />
        {presentation === "labeled" ? t("payments.resume") : null}
      </Button>
    );
  };

  return (
    <>
      <DataTable
        data={payments}
        columns={columns}
        getRowKey={(payment) => payment.id}
        caption={t("payments.caption")}
        minWidth="640px"
        isFetching={isFetching}
        search={false}
        sort={false}
        filters={false}
        pagination={{
          page,
          totalPages,
          totalElements,
          pageSize,
          onPageChange,
          isFetching,
          labels: {
            previous: t("common:common.previous"),
            next: t("common:common.next"),
            summary: ({ start, end, total }) =>
              t("pagination.summary", { start, end, total }),
            pageOf: ({ current, total }) =>
              t("pagination.pageOf", { current, total }),
            ariaLabel: t("pagination.label"),
          },
        }}
        mobile={{
          renderRow: (payment) => {
            const formattedAmount = formatCurrency(
              payment.amount,
              payment.currency,
              intlLocale,
            );
            const methodLabel = [
              payment.paymentMethod,
              payment.paymentMethodDetail,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold tabular-nums text-foreground" dir="ltr">
                      {formattedAmount}
                    </p>
                    <time
                      className="block text-xs tabular-nums text-muted-foreground"
                      dateTime={payment.createdAt}
                    >
                      <span dir="ltr" className="inline-block">
                        {formatDate(payment.createdAt, dateFormat)}
                      </span>
                    </time>
                    {methodLabel ? (
                      <p className="text-xs text-muted-foreground">
                        {methodLabel}
                      </p>
                    ) : null}
                  </div>
                  <PaymentStatusBadge
                    status={payment.status}
                    credited={payment.credited}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {renderPaymentRetry(payment, formattedAmount, "labeled")}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    {t("payments.viewDetails")}
                  </Button>
                </div>
              </article>
            );
          },
        }}
        rowActions={(payment) => {
          const formattedAmount = formatCurrency(
            payment.amount,
            payment.currency,
            intlLocale,
          );
          return (
            <div className="flex items-center gap-1">
              {renderPaymentRetry(payment, formattedAmount, "icon")}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("payments.viewDetails")}
                onClick={() => setSelectedPayment(payment)}
              >
                <Eye className="size-4" aria-hidden="true" />
              </Button>
            </div>
          );
        }}
        actionsColumnHeader={
          <span className="sr-only">{t("payments.actions")}</span>
        }
        emptyState={
          <div className="py-12 text-center">
            <p className="font-medium text-foreground">
              {t("payments.noPayments")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("payments.noPaymentsDescription")}
            </p>
          </div>
        }
      />

      <WalletPaymentDetailSheet
        payment={selectedPayment}
        intlLocale={intlLocale}
        dateFormat={dateFormat}
        open={selectedPayment !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
        }}
      />
    </>
  );
}
