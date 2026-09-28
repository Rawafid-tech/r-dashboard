import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { OrderCancelDialog } from "@/features/orders/components/order-cancel-dialog";
import { OrderFormSheet } from "@/features/orders/components/order-form-sheet";
import type { OrderRowAction } from "@/features/orders/components/order-row-actions-menu";
import { OrdersDataTable } from "@/features/orders/components/orders-data-table";
import { OrdersEmptyState } from "@/features/orders/components/orders-empty-state";
import { OrdersErrorState } from "@/features/orders/components/orders-error-state";
import { OrdersHero } from "@/features/orders/components/orders-hero";
import { OrdersPageSkeleton } from "@/features/orders/components/orders-page-skeleton";
import { useOrderCounts } from "@/features/orders/hooks/use-order-counts";
import { useOrders } from "@/features/orders/hooks/use-orders";
import {
  DEFAULT_ORDERS_SORT,
  localDateToInstantEndExclusive,
  localDateToInstantStart,
  parseOrdersSortOption,
  readOptionalNumber,
  readOrdersSortOption,
  readOrdersTab,
  readPaymentMethodFilter,
} from "@/features/orders/lib/orders-list-params";
import type { OrderListRow, OrdersListTab } from "@/features/orders/types";
import { useListSearchParam } from "@/shared/hooks/use-list-search-param";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";

const PAGE_SIZE = 20;

type FormState =
  | { mode: "create"; order: null }
  | { mode: "edit"; order: OrderListRow }
  | { mode: "view"; order: OrderListRow }
  | null;

export function OrdersHome() {
  const { t } = useTranslation("orders");
  const { hasPermission } = useMerchantPermissions();
  const canManage = hasPermission(MerchantPermission.ORDER_MANAGE);

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

  const { searchInput, debouncedSearch, handleSearchChange } = useListSearchParam(
    searchParams,
    updateParams,
  );

  const page = readPageIndex(searchParams.get("page"));
  const sortOption = readOrdersSortOption(searchParams.get("sort"));
  const { sort, direction } = parseOrdersSortOption(sortOption);
  const activeTab = readOrdersTab(searchParams.get("tab"));
  const governorateFilter = searchParams.get("governorate") ?? "";
  const senderLocationFilter = searchParams.get("pickup") ?? "";
  const paymentMethodFilter = searchParams.get("payment") ?? "";
  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";
  const minValueRaw = searchParams.get("minValue") ?? "";
  const maxValueRaw = searchParams.get("maxValue") ?? "";

  const [formState, setFormState] = useState<FormState>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderListRow | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      direction,
      status: activeTab === "all" ? undefined : activeTab,
      search: debouncedSearch || undefined,
      governorateId: governorateFilter || undefined,
      senderLocationId: senderLocationFilter || undefined,
      paymentMethod: readPaymentMethodFilter(paymentMethodFilter || null),
      from: dateFrom ? localDateToInstantStart(dateFrom) : undefined,
      to: dateTo ? localDateToInstantEndExclusive(dateTo) : undefined,
      minValue: readOptionalNumber(minValueRaw),
      maxValue: readOptionalNumber(maxValueRaw),
    }),
    [
      page,
      sort,
      direction,
      activeTab,
      debouncedSearch,
      governorateFilter,
      senderLocationFilter,
      paymentMethodFilter,
      dateFrom,
      dateTo,
      minValueRaw,
      maxValueRaw,
    ],
  );

  const ordersQuery = useOrders(queryParams);
  const countsQuery = useOrderCounts();

  useEffect(() => {
    const data = ordersQuery.data;
    if (!data || ordersQuery.isFetching) return;

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
  }, [ordersQuery.data, ordersQuery.isFetching, updateParams]);

  const handleTabChange = (tab: OrdersListTab) => {
    updateParams({
      tab: tab === "all" ? null : tab,
      page: null,
    });
  };

  const handleSortChange = (value: typeof sortOption) => {
    updateParams({
      sort: value === DEFAULT_ORDERS_SORT ? null : value,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      page: writePageIndex(nextPage),
    });
  };

  const handleRowAction = (action: OrderRowAction, order: OrderListRow) => {
    switch (action) {
      case "view":
        setFormState({ mode: "view", order });
        break;
      case "edit":
        setFormState({ mode: "edit", order });
        break;
      case "cancel":
        setOrderToCancel(order);
        break;
      default:
        break;
    }
  };

  const isInitialLoading = ordersQuery.isLoading && !ordersQuery.data;
  const orders = ordersQuery.data?.content ?? [];
  const hasSearch = debouncedSearch.length > 0;
  const hasFilters =
    Boolean(governorateFilter) ||
    Boolean(senderLocationFilter) ||
    Boolean(paymentMethodFilter) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(minValueRaw) ||
    Boolean(maxValueRaw);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#orders-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <OrdersPageSkeleton />
      ) : (
        <>
          <OrdersHero
            activeTab={activeTab}
            counts={countsQuery.data}
            onTabChange={handleTabChange}
            onAdd={() => setFormState({ mode: "create", order: null })}
            canManage={canManage}
          />

          {ordersQuery.isError ? (
            <OrdersErrorState
              onRetry={() => void ordersQuery.refetch()}
              isRetrying={ordersQuery.isFetching}
            />
          ) : null}

          {!ordersQuery.isError ? (
            <div id="orders-main" role="tabpanel" aria-labelledby={`orders-tab-${activeTab}`}>
              <OrdersDataTable
                orders={orders}
                search={searchInput}
                sortOption={sortOption}
                governorateFilter={governorateFilter}
                senderLocationFilter={senderLocationFilter}
                paymentMethodFilter={paymentMethodFilter}
                dateFrom={dateFrom}
                dateTo={dateTo}
                minValue={minValueRaw}
                maxValue={maxValueRaw}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onGovernorateFilterChange={(value) =>
                  updateParams({ governorate: value || null, page: null })
                }
                onSenderLocationFilterChange={(value) =>
                  updateParams({ pickup: value || null, page: null })
                }
                onPaymentMethodFilterChange={(value) =>
                  updateParams({ payment: value || null, page: null })
                }
                onDateFromChange={(value) =>
                  updateParams({ from: value || null, page: null })
                }
                onDateToChange={(value) =>
                  updateParams({ to: value || null, page: null })
                }
                onMinValueChange={(value) =>
                  updateParams({ minValue: value || null, page: null })
                }
                onMaxValueChange={(value) =>
                  updateParams({ maxValue: value || null, page: null })
                }
                hasActiveFilters={hasFilters || hasSearch}
                onClearFilters={() => {
                  handleSearchChange("");
                  updateParams({
                    governorate: null,
                    pickup: null,
                    payment: null,
                    from: null,
                    to: null,
                    minValue: null,
                    maxValue: null,
                    page: null,
                  });
                }}
                page={ordersQuery.data?.page ?? 0}
                totalPages={ordersQuery.data?.totalPages ?? 0}
                totalElements={ordersQuery.data?.totalElements ?? 0}
                pageSize={ordersQuery.data?.size ?? PAGE_SIZE}
                onPageChange={handlePageChange}
                onRowAction={handleRowAction}
                isFetching={ordersQuery.isFetching}
                emptyState={
                  <OrdersEmptyState hasSearch={hasSearch} hasFilters={hasFilters} />
                }
              />
            </div>
          ) : null}
        </>
      )}

      <OrderFormSheet
        mode={formState?.mode ?? "create"}
        orderId={formState?.order?.id ?? null}
        listRow={formState?.order ?? null}
        open={formState !== null}
        onOpenChange={(open) => {
          if (!open) setFormState(null);
        }}
      />

      <OrderCancelDialog
        order={orderToCancel}
        open={orderToCancel !== null}
        onOpenChange={(open) => {
          if (!open) setOrderToCancel(null);
        }}
      />
    </div>
  );
}
