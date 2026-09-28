import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useSettings } from "@/features/account/hooks/use-settings";
import { WalletBalanceCard } from "@/features/wallet/components/wallet-balance-card";
import { WalletEmptyState } from "@/features/wallet/components/wallet-empty-state";
import { WalletErrorState } from "@/features/wallet/components/wallet-error-state";
import { WalletHero } from "@/features/wallet/components/wallet-hero";
import { WalletPageSkeleton } from "@/features/wallet/components/wallet-page-skeleton";
import { WalletPaymentsTable } from "@/features/wallet/components/wallet-payments-table";
import { WalletTransactionsTable } from "@/features/wallet/components/wallet-transactions-table";
import { usePayments } from "@/features/wallet/hooks/use-payments";
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
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { useLocaleStore } from "@/stores/locale.store";

const PAGE_SIZE = 20;
const PAYMENTS_PAGE_SIZE = 20;

/**
 * After Paymob redirects the browser back to /wallet, the balance credit
 * may not yet have landed (server-side job runs separately). We poll the
 * wallet balance a small, capped number of times, then stop — the contract
 * says "cap it — a few seconds, then fall back to 'we'll update shortly'".
 */
const POST_REDIRECT_POLL_INTERVAL_MS = 2_000;
const POST_REDIRECT_MAX_POLLS = 4;

export function WalletHome() {
  const { t } = useTranslation("wallet");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const { hasPermission } = useMerchantPermissions();
  const canReadWallet = hasPermission(MerchantPermission.WALLET_READ);

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

  // Load payment history only for users with wallet:read
  const paymentsQuery = usePayments(
    { size: PAYMENTS_PAGE_SIZE },
    { enabled: walletQuery.isSuccess && canReadWallet },
  );

  // ─── Post-redirect polling ────────────────────────────────────────────────
  // When Paymob redirects back to /wallet the browser may arrive before the
  // server-side credit has been applied. We re-fetch the balance a few times
  // (capped) so the customer sees an updated balance without manual refresh.
  // We do NOT show a "payment succeeded" message based on the redirect alone.
  const pollCountRef = useRef(0);
  const pollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Only poll if we detect a `payment_id` query param — signature that
    // Paymob sent the customer back. Remove it immediately so a page refresh
    // doesn't re-trigger the poll.
    const paymentId = searchParams.get("payment_id");
    if (!paymentId) return;

    // Clean up the URL param immediately (replace so it's not in history)
    updateParams({ payment_id: null });

    pollCountRef.current = 0;

    pollTimerRef.current = window.setInterval(() => {
      pollCountRef.current += 1;

      void walletQuery.refetch();
      void paymentsQuery.refetch();

      if (pollCountRef.current >= POST_REDIRECT_MAX_POLLS) {
        if (pollTimerRef.current !== null) {
          window.clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }
    }, POST_REDIRECT_POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current !== null) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // ─── Auto-reset page when out of range ───────────────────────────────────
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

  const handlePaymentsPageChange = (nextPage: number) => {
    paymentsQuery; // kept for future pagination — currently uses default page 0
    void nextPage;
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

  const payments = paymentsQuery.data?.content ?? [];

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
            <div id="wallet-main" className="space-y-8">
              {/* Balance card — contains the Top Up button (gated by permission) */}
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

              {/* Payment history — gated by wallet:read (same as wallet page itself) */}
              {canReadWallet && (paymentsQuery.isSuccess || paymentsQuery.isFetching) ? (
                <section aria-labelledby="wallet-payments-title" className="space-y-4">
                  <header>
                    <h2 id="wallet-payments-title" className="text-lg font-semibold text-foreground">
                      {t("payments.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">{t("payments.caption")}</p>
                  </header>
                  <WalletPaymentsTable
                    payments={payments}
                    intlLocale={intlLocale}
                    dateFormat={dateFormat}
                    page={paymentsQuery.data?.page ?? 0}
                    totalPages={paymentsQuery.data?.totalPages ?? 0}
                    totalElements={paymentsQuery.data?.totalElements ?? 0}
                    pageSize={paymentsQuery.data?.size ?? PAYMENTS_PAGE_SIZE}
                    onPageChange={handlePaymentsPageChange}
                    isFetching={paymentsQuery.isFetching}
                  />
                </section>
              ) : null}

              {/* Wallet transaction ledger */}
              <section aria-labelledby="wallet-transactions-title" className="space-y-4">
                <header>
                  <h2 id="wallet-transactions-title" className="text-lg font-semibold text-foreground">
                    {t("toolbar.title")}
                  </h2>
                </header>
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
