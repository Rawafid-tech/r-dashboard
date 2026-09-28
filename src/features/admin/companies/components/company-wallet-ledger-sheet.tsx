import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { CompanyWalletRefundDialog } from "@/features/admin/companies/components/company-wallet-refund-dialog";
import { useAdminCompanyWalletRefunds } from "@/features/admin/companies/hooks/use-admin-company-wallet-refunds";
import { useAdminCompanyWalletTransactions } from "@/features/admin/companies/hooks/use-admin-company-wallet-transactions";
import { WalletEmptyState } from "@/features/wallet/components/wallet-empty-state";
import { WalletTransactionsTable } from "@/features/wallet/components/wallet-transactions-table";
import {
  DEFAULT_WALLET_SORT,
  parseWalletSortOption,
  readWalletSortOption,
  readWalletTypeFilter,
  type WalletSortOption,
} from "@/features/wallet/lib/wallet-list-params";
import {
  getRefundableCents,
  sumRefundedCents,
} from "@/features/wallet/lib/wallet-refund";
import type { WalletTransaction } from "@/features/wallet/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";
import { useLocaleStore } from "@/stores/locale.store";

const PAGE_SIZE = 20;

interface CompanyWalletLedgerSheetProps {
  companyId: string;
  companyName: string;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage?: boolean;
}

export function CompanyWalletLedgerSheet({
  companyId,
  companyName,
  currency,
  open,
  onOpenChange,
  canManage = false,
}: CompanyWalletLedgerSheetProps) {
  const { t } = useTranslation(["admin", "wallet"]);
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const [searchParams, setSearchParams] = useSearchParams();
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          });

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const page = readPageIndex(searchParams.get("walletPage"));
  const sortOption = readWalletSortOption(searchParams.get("walletSort"));
  const typeFilter = searchParams.get("walletType") ?? "";
  const { sort, direction } = parseWalletSortOption(sortOption);
  const parsedType = readWalletTypeFilter(typeFilter || null);

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      direction,
      type: parsedType,
    }),
    [page, sort, direction, parsedType],
  );

  const transactionsQuery = useAdminCompanyWalletTransactions(
    companyId,
    queryParams,
    { enabled: open },
  );
  const refundsQuery = useAdminCompanyWalletRefunds(companyId, {
    enabled: open && canManage,
  });
  const [refundCharge, setRefundCharge] = useState<WalletTransaction | null>(
    null,
  );

  useEffect(() => {
    if (!open) setRefundCharge(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const data = transactionsQuery.data;
    if (!data || transactionsQuery.isFetching) return;

    if (
      shouldResetPageIndex(
        data.page,
        data.totalPages,
        data.totalElements,
        data.content.length,
      )
    ) {
      updateParams({ walletPage: null });
    }
  }, [open, transactionsQuery.data, transactionsQuery.isFetching, updateParams]);

  const handleSortChange = (value: WalletSortOption) => {
    updateParams({
      walletSort: value === DEFAULT_WALLET_SORT ? null : value,
      walletPage: null,
    });
  };

  const handleTypeFilterChange = (value: string) => {
    updateParams({
      walletType: value || null,
      walletPage: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      walletPage: writePageIndex(nextPage),
    });
  };

  const transactions = useMemo(
    () => transactionsQuery.data?.content ?? [],
    [transactionsQuery.data?.content],
  );
  const hasFilters = Boolean(typeFilter);
  const refundedCentsByChargeId = useMemo(() => {
    if (!canManage) return undefined;
    if (refundsQuery.isSuccess) return refundsQuery.data;
    if (refundsQuery.isError) return sumRefundedCents(transactions);
    return {};
  }, [
    canManage,
    refundsQuery.data,
    refundsQuery.isError,
    refundsQuery.isSuccess,
    transactions,
  ]);
  const refundableCents = refundCharge
    ? getRefundableCents(
        refundCharge.amount,
        refundedCentsByChargeId?.[refundCharge.id] ?? 0,
      )
    : 0;

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[92vh] flex-col overflow-hidden p-0"
      >
        <SheetHeader className="border-b border-border/60 px-6 py-4 text-start">
          <SheetTitle>{t("companies.detail.wallet.ledgerTitle")}</SheetTitle>
          <SheetDescription>
            {t("companies.detail.wallet.ledgerDescription", {
              company: companyName,
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {transactionsQuery.isError ? (
            <p className="text-sm text-destructive" role="alert">
              {t("companies.detail.wallet.transactionsError")}
            </p>
          ) : (
            <WalletTransactionsTable
              transactions={transactions}
              currency={currency}
              intlLocale={intlLocale}
              sortOption={sortOption}
              typeFilter={typeFilter}
              onSortChange={handleSortChange}
              onTypeFilterChange={handleTypeFilterChange}
              page={transactionsQuery.data?.page ?? 0}
              totalPages={transactionsQuery.data?.totalPages ?? 0}
              totalElements={transactionsQuery.data?.totalElements ?? 0}
              pageSize={transactionsQuery.data?.size ?? PAGE_SIZE}
              onPageChange={handlePageChange}
              isFetching={transactionsQuery.isFetching}
              showCreatedBy
              onRefund={canManage ? setRefundCharge : undefined}
              refundedCentsByChargeId={refundedCentsByChargeId}
              refundsPending={canManage && refundsQuery.isLoading}
              emptyState={<WalletEmptyState hasFilters={hasFilters} />}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>

    {canManage && refundCharge ? (
      <CompanyWalletRefundDialog
        key={`${refundCharge.id}-${refundableCents}`}
        companyId={companyId}
        companyName={companyName}
        currency={currency}
        charge={refundCharge}
        refundableCents={refundableCents}
        open
        onOpenChange={(next) => {
          if (!next) setRefundCharge(null);
        }}
      />
    ) : null}
    </>
  );
}
