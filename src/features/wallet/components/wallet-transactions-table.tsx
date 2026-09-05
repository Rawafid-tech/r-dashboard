import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { WalletToolbar } from "@/features/wallet/components/wallet-toolbar";
import { WalletTransactionDetailSheet } from "@/features/wallet/components/wallet-transaction-detail-sheet";
import type { WalletSortOption } from "@/features/wallet/lib/wallet-list-params";
import {
  formatSignedWalletAmount,
  getSignedWalletAmountClassName,
  getWalletTransactionTypeLabel,
  truncateAdminId,
} from "@/features/wallet/lib/wallet-transaction-label";
import type { AdminWalletTransaction, WalletTransaction } from "@/features/wallet/types";
import { Button } from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";

interface WalletTransactionsTableProps {
  transactions: WalletTransaction[] | AdminWalletTransaction[];
  currency: string;
  intlLocale: string;
  dateFormat?: "DD_MM_YYYY" | "MM_DD_YYYY" | "YYYY_MM_DD";
  sortOption: WalletSortOption;
  typeFilter: string;
  onSortChange: (value: WalletSortOption) => void;
  onTypeFilterChange: (value: string) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
  showCreatedBy?: boolean;
}

export function WalletTransactionsTable({
  transactions,
  currency,
  intlLocale,
  dateFormat = "DD_MM_YYYY",
  sortOption,
  typeFilter,
  onSortChange,
  onTypeFilterChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isFetching,
  emptyState,
  showCreatedBy = false,
}: WalletTransactionsTableProps) {
  const { t } = useTranslation(["wallet", "common", "admin"]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<WalletTransaction | null>(null);

  const columns = useMemo<DataTableColumn<WalletTransaction>[]>(
    () => [
      {
        id: "date",
        header: t("table.date"),
        cell: (transaction) => (
          <time
            className="tabular-nums text-muted-foreground"
            dateTime={transaction.createdAt}
          >
            <span dir="ltr" className="inline-block">
              {formatDate(transaction.createdAt, dateFormat)}
            </span>
          </time>
        ),
      },
      {
        id: "type",
        header: t("table.type"),
        cell: (transaction) => (
          <span className="font-medium text-foreground">
            {getWalletTransactionTypeLabel(
              transaction.type,
              transaction.direction,
              t,
            )}
          </span>
        ),
      },
      {
        id: "note",
        header: t("table.note"),
        cell: (transaction) =>
          transaction.note ? (
            <span className="line-clamp-2 max-w-xs text-sm text-foreground">
              {transaction.note}
            </span>
          ) : (
            <span
              className="text-sm text-muted-foreground"
              title={t("table.noNoteHint")}
            >
              <span aria-hidden="true">—</span>
              <span className="sr-only">{t("table.noNote")}</span>
            </span>
          ),
      },
      {
        id: "amount",
        header: t("table.amount"),
        cell: (transaction) => {
          const signed = formatSignedWalletAmount(
            transaction.amount,
            transaction.direction,
            currency,
            intlLocale,
          );
          const ariaKey =
            transaction.direction === "CREDIT"
              ? "amount.creditAria"
              : "amount.debitAria";
          const absolute = formatCurrency(
            transaction.amount,
            currency,
            intlLocale,
          );

          return (
            <span
              className={getSignedWalletAmountClassName(transaction.direction)}
              aria-label={t(ariaKey, { amount: absolute })}
            >
              <span dir="ltr" className="inline-block tabular-nums">
                {signed}
              </span>
            </span>
          );
        },
      },
      {
        id: "balanceAfter",
        header: t("table.balanceAfter"),
        cell: (transaction) => (
          <span className="tabular-nums text-muted-foreground">
            <span dir="ltr" className="inline-block">
              {formatCurrency(transaction.balanceAfter, currency, intlLocale)}
            </span>
          </span>
        ),
      },
      ...(showCreatedBy
        ? [
            {
              id: "createdBy",
              header: t("admin:companies.detail.wallet.createdBy"),
              cell: (transaction: AdminWalletTransaction) =>
                transaction.createdBy ? (
                  <code
                    className="text-xs tabular-nums text-muted-foreground"
                    title={transaction.createdBy}
                  >
                    <span dir="ltr" className="inline-block">
                      {truncateAdminId(transaction.createdBy)}
                    </span>
                  </code>
                ) : (
                  <span aria-hidden="true">—</span>
                ),
            } satisfies DataTableColumn<WalletTransaction>,
          ]
        : []),
    ],
    [currency, dateFormat, intlLocale, showCreatedBy, t],
  );

  return (
    <>
      <DataTable
        data={transactions}
        columns={columns}
        getRowKey={(transaction) => transaction.id}
        caption={t("table.caption")}
        minWidth="880px"
        isFetching={isFetching}
        toolbar={{
          title: t("toolbar.title"),
          render: () => (
            <WalletToolbar
              sortOption={sortOption}
              typeFilter={typeFilter}
              onSortChange={onSortChange}
              onTypeFilterChange={onTypeFilterChange}
              disabled={isFetching}
            />
          ),
        }}
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
          renderRow: (transaction) => {
            const label = getWalletTransactionTypeLabel(
              transaction.type,
              transaction.direction,
              t,
            );
            const signed = formatSignedWalletAmount(
              transaction.amount,
              transaction.direction,
              currency,
              intlLocale,
            );

            return (
              <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{label}</h3>
                    <time
                      className="mt-1 block text-xs tabular-nums text-muted-foreground"
                      dateTime={transaction.createdAt}
                    >
                      <span dir="ltr" className="inline-block">
                        {formatDate(transaction.createdAt, dateFormat)}
                      </span>
                    </time>
                  </div>
                  <span
                    className={getSignedWalletAmountClassName(
                      transaction.direction,
                    )}
                  >
                    <span dir="ltr" className="inline-block tabular-nums">
                      {signed}
                    </span>
                  </span>
                </div>
                {transaction.note ? (
                  <p className="text-sm text-muted-foreground">{transaction.note}</p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <Eye className="size-4" aria-hidden="true" />
                  {t("table.viewDetails", { label })}
                </Button>
              </article>
            );
          },
        }}
        rowActions={(transaction) => {
          const label = getWalletTransactionTypeLabel(
            transaction.type,
            transaction.direction,
            t,
          );

          return (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setSelectedTransaction(transaction)}
              aria-label={t("table.viewDetails", { label })}
            >
              <Eye className="size-4" aria-hidden="true" />
            </Button>
          );
        }}
        actionsColumnHeader={
          <span className="sr-only">{t("table.actions")}</span>
        }
        emptyState={emptyState}
      />

      <WalletTransactionDetailSheet
        transaction={selectedTransaction}
        currency={currency}
        intlLocale={intlLocale}
        dateFormat={dateFormat}
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
      />
    </>
  );
}
