import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useSettings } from "@/features/account/hooks/use-settings";
import { WalletBalanceCard } from "@/features/wallet/components/wallet-balance-card";
import { WalletEmptyState } from "@/features/wallet/components/wallet-empty-state";
import { WalletErrorState } from "@/features/wallet/components/wallet-error-state";
import { WalletHero } from "@/features/wallet/components/wallet-hero";
import { WalletPageSkeleton } from "@/features/wallet/components/wallet-page-skeleton";
import { WalletTransactionsTable } from "@/features/wallet/components/wallet-transactions-table";
import { useWallet } from "@/features/wallet/hooks/use-wallet";
import { useWalletTransactions } from "@/features/wallet/hooks/use-wallet-transactions";
import {
  DEFAULT_WALLET_SORT,
  parseWalletSortOption,
  readWalletSortOption,
  readWalletTypeFilter,
  type WalletSortOption,
} from "@/features/wallet/lib/wallet-list-params";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";
import { useLocaleStore } from "@/stores/locale.store";

const PAGE_SIZE = 20;

export function WalletHome() {
  const { t } = useTranslation("wallet");
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

  const page = readPageIndex(searchParams.get("page"));
  const sortOption = readWalletSortOption(searchParams.get("sort"));
  const typeFilter = searchParams.get("type") ?? "";
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

  const walletQuery = useWallet();
  const settingsQuery = useSettings();
  const transactionsQuery = useWalletTransactions(queryParams, {
    enabled: walletQuery.isSuccess,
  });

  useEffect(() => {
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
      updateParams({ page: null });
    }
  }, [transactionsQuery.data, transactionsQuery.isFetching, updateParams]);

  const handleSortChange = (value: WalletSortOption) => {
    updateParams({
      sort: value === DEFAULT_WALLET_SORT ? null : value,
      page: null,
    });
  };

  const handleTypeFilterChange = (value: string) => {
    updateParams({
      type: value || null,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      page: writePageIndex(nextPage),
    });
  };

  const isInitialLoading =
    (walletQuery.isLoading && !walletQuery.data) ||
    (settingsQuery.isLoading && !settingsQuery.data);

  const isError = walletQuery.isError || transactionsQuery.isError;
  const wallet = walletQuery.data;
  const currency = wallet?.currency ?? settingsQuery.data?.currency ?? "EGP";
  const dateFormat = settingsQuery.data?.dateFormat;
  const transactions = transactionsQuery.data?.content ?? [];
  const hasFilters = Boolean(typeFilter);

  const refetchAll = () =>
    Promise.all([walletQuery.refetch(), transactionsQuery.refetch()]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#wallet-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <WalletPageSkeleton />
      ) : (
        <>
          <WalletHero />

          {isError ? (
            <WalletErrorState
              onRetry={() => void refetchAll()}
              isRetrying={walletQuery.isFetching || transactionsQuery.isFetching}
            />
          ) : null}

          {!isError && wallet ? (
            <div id="wallet-main" className="space-y-6">
              <section aria-labelledby="wallet-balance-title">
                <h2 id="wallet-balance-title" className="sr-only">
                  {t("balance.title")}
                </h2>
                <div aria-live="polite" aria-atomic="true">
                  <WalletBalanceCard
                    wallet={wallet}
                    intlLocale={intlLocale}
                    dateFormat={dateFormat}
                  />
                </div>
              </section>

              <section aria-labelledby="wallet-transactions-title">
                <h2 id="wallet-transactions-title" className="sr-only">
                  {t("toolbar.title")}
                </h2>
                <WalletTransactionsTable
                  transactions={transactions}
                  currency={currency}
                  intlLocale={intlLocale}
                  dateFormat={dateFormat}
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
                  emptyState={
                    <WalletEmptyState hasFilters={hasFilters} />
                  }
                />
              </section>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
