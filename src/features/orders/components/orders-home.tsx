import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { BookExchangeDialog } from "@/features/exchanges";
import { BookReturnDialog } from "@/features/returns";
import { CreateShipmentWizardDialog } from "@/features/shipments/components/create-shipment-wizard-dialog";
import { WithMyRatesBookingDialog } from "@/features/shipments/components/with-my-rates-booking-dialog";
import { MAX_BULK_BOOKING_LINES } from "@/features/shipments/lib/bulk-preview-lines";
import { isOrderSelectableForBooking } from "@/features/orders/lib/order-selection";
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
import { useOrder } from "@/features/orders/hooks/use-order";
import {
  orderToListRow,
} from "@/features/orders/lib/order-view-link";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";
import { parseApiError } from "@/shared/api/error-handler";

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
  const canBookShipment = hasPermission(MerchantPermission.SHIPMENT_MANAGE);

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
  const [bulkBookOrderIds, setBulkBookOrderIds] = useState<string[] | null>(
    null,
  );
  const [returnOrder, setReturnOrder] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);
  const [exchangeOrder, setExchangeOrder] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);

  const viewOrderId = searchParams.get("viewOrder");
  const viewOrderQuery = useOrder(viewOrderId, { enabled: Boolean(viewOrderId) });
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [wizardOpen, setWizardOpen] = useState(false);

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

  useEffect(() => {
    if (!viewOrderId) return;

    if (viewOrderQuery.isError) {
      toast.error(parseApiError(viewOrderQuery.error).detail);
      updateParams({ viewOrder: null });
      return;
    }

    if (!viewOrderQuery.data) return;

    setFormState({ mode: "view", order: orderToListRow(viewOrderQuery.data) });
    updateParams({ viewOrder: null });
  }, [
    viewOrderId,
    viewOrderQuery.data,
    viewOrderQuery.isError,
    viewOrderQuery.error,
    updateParams,
  ]);
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
      case "createShipment":
        setBulkBookOrderIds([order.id]);
        break;
      case "bookReturn":
        setReturnOrder({ id: order.id, orderNumber: order.orderNumber });
        break;
      case "bookExchange":
        setExchangeOrder({ id: order.id, orderNumber: order.orderNumber });
        break;
      default:
        break;
    }
  };

  const isInitialLoading = ordersQuery.isLoading && !ordersQuery.data;
  const orders = ordersQuery.data?.content ?? [];

  const handleToggleRow = (order: OrderListRow, selected: boolean) => {
    if (!isOrderSelectableForBooking(order)) return;
    setSelectedOrderIds((current) => {
      const next = new Set(current);
      if (selected) {
        if (next.size >= MAX_BULK_BOOKING_LINES) {
          toast.error(t("toolbar.selectionLimit", { max: MAX_BULK_BOOKING_LINES }));
          return current;
        }
        next.add(order.id);
      } else {
        next.delete(order.id);
      }
      return next;
    });
  };

  const handleToggleAllOnPage = (rows: OrderListRow[], selected: boolean) => {
    setSelectedOrderIds((current) => {
      const next = new Set(current);
      if (selected) {
        for (const row of rows) {
          if (!isOrderSelectableForBooking(row)) continue;
          if (next.size >= MAX_BULK_BOOKING_LINES) break;
          next.add(row.id);
        }
      } else {
        rows.forEach((row) => next.delete(row.id));
      }
      return next;
    });
  };

  const handleBulkBookSelected = () => {
    const ids = [...selectedOrderIds];
    if (ids.length === 0) return;
    setBulkBookOrderIds(ids);
  };
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
            onCreateShipment={() => setWizardOpen(true)}
            canManage={canManage}
            canBookShipment={canBookShipment}
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
                selectedIds={selectedOrderIds}
                onToggleRow={handleToggleRow}
                onToggleAllOnPage={handleToggleAllOnPage}
                onBulkBook={handleBulkBookSelected}
                onClearSelection={() => setSelectedOrderIds(new Set())}
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

      <BookReturnDialog
        orderId={returnOrder?.id ?? ""}
        orderNumber={returnOrder?.orderNumber}
        open={returnOrder !== null}
        onOpenChange={(open) => {
          if (!open) setReturnOrder(null);
        }}
      />

      <BookExchangeDialog
        orderId={exchangeOrder?.id ?? ""}
        orderNumber={exchangeOrder?.orderNumber}
        open={exchangeOrder !== null}
        onOpenChange={(open) => {
          if (!open) setExchangeOrder(null);
        }}
      />

      <WithMyRatesBookingDialog
        orderIds={bulkBookOrderIds ?? []}
        open={bulkBookOrderIds !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBulkBookOrderIds(null);
            setSelectedOrderIds(new Set());
          }
        }}
        onEditOrder={(orderId) => {
          const order = orders.find((row) => row.id === orderId);
          setBulkBookOrderIds(null);
          if (order) {
            setFormState({ mode: "edit", order });
          }
        }}
      />

      <CreateShipmentWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onEditOrder={(orderId) => {
          const order = orders.find((row) => row.id === orderId);
          setWizardOpen(false);
          if (order) {
            setFormState({ mode: "edit", order });
          }
        }}
      />
    </div>
  );
}
