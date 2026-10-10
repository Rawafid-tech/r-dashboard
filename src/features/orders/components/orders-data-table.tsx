import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { OrderRowActionsMenu } from "@/features/orders/components/order-row-actions-menu";
import type { OrderRowAction } from "@/features/orders/components/order-row-actions-menu";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrdersToolbar } from "@/features/orders/components/orders-toolbar";
import type { OrdersSortOption } from "@/features/orders/lib/orders-list-params";
import type { OrderListRow } from "@/features/orders/types";
import { getGovernorateLabel } from "@/features/locations/lib/location-form-errors";
import { isOrderSelectableForBooking } from "@/features/orders/lib/order-selection";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { Button, Checkbox } from "@/shared/components/ui";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import { useLocaleStore } from "@/stores/locale.store";
import { useSettings } from "@/features/account/hooks/use-settings";

interface OrdersDataTableProps {
  orders: OrderListRow[];
  search: string;
  sortOption: OrdersSortOption;
  governorateFilter: string;
  senderLocationFilter: string;
  paymentMethodFilter: string;
  dateFrom: string;
  dateTo: string;
  minValue: string;
  maxValue: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: OrdersSortOption) => void;
  onGovernorateFilterChange: (value: string) => void;
  onSenderLocationFilterChange: (value: string) => void;
  onPaymentMethodFilterChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onMinValueChange: (value: string) => void;
  onMaxValueChange: (value: string) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowAction: (action: OrderRowAction, order: OrderListRow) => void;
  selectedIds?: Set<string>;
  onToggleRow?: (order: OrderListRow, selected: boolean) => void;
  onToggleAllOnPage?: (orders: OrderListRow[], selected: boolean) => void;
  onBulkBook?: () => void;
  onClearSelection?: () => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

export function OrdersDataTable({
  orders,
  search,
  sortOption,
  governorateFilter,
  senderLocationFilter,
  paymentMethodFilter,
  dateFrom,
  dateTo,
  minValue,
  maxValue,
  onSearchChange,
  onSortChange,
  onGovernorateFilterChange,
  onSenderLocationFilterChange,
  onPaymentMethodFilterChange,
  onDateFromChange,
  onDateToChange,
  onMinValueChange,
  onMaxValueChange,
  hasActiveFilters,
  onClearFilters,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onRowAction,
  selectedIds,
  onToggleRow,
  onToggleAllOnPage,
  onBulkBook,
  onClearSelection,
  isFetching,
  emptyState,
}: OrdersDataTableProps) {
  const { t } = useTranslation(["orders", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const settingsQuery = useSettings();
  const dateFormat = settingsQuery.data?.dateFormat ?? "DD_MM_YYYY";
  const { hasPermission } = useMerchantPermissions();
  const canBulkBook = hasPermission(MerchantPermission.SHIPMENT_MANAGE);
  const selectionEnabled =
    canBulkBook && Boolean(selectedIds && onToggleRow && onToggleAllOnPage);

  const selectableOnPage = useMemo(
    () => orders.filter((order) => isOrderSelectableForBooking(order)),
    [orders],
  );

  const allSelectableSelected =
    selectableOnPage.length > 0 &&
    selectableOnPage.every((order) => selectedIds?.has(order.id));

  const someSelectableSelected =
    selectableOnPage.some((order) => selectedIds?.has(order.id)) &&
    !allSelectableSelected;

  const selectAllHeader = selectionEnabled ? (
    <Checkbox
      checked={
        allSelectableSelected
          ? true
          : someSelectableSelected
            ? "indeterminate"
            : false
      }
      onCheckedChange={(checked) =>
        onToggleAllOnPage!(selectableOnPage, checked === true)
      }
      disabled={selectableOnPage.length === 0}
      aria-label={t("table.selectAll")}
    />
  ) : null;

  const columns = useMemo<DataTableColumn<OrderListRow>[]>(
    () => {
      const base: DataTableColumn<OrderListRow>[] = [];

      if (selectionEnabled) {
        base.push({
          id: "select",
          header: selectAllHeader,
          cell: (order) =>
            isOrderSelectableForBooking(order) ? (
              <Checkbox
                checked={selectedIds?.has(order.id) ?? false}
                onCheckedChange={(checked) =>
                  onToggleRow!(order, checked === true)
                }
                aria-label={t("table.selectRow", { number: order.orderNumber })}
              />
            ) : null,
          className: "w-10",
        });
      }

      base.push(
      {
        id: "orderNumber",
        header: t("table.orderNumber"),
        cell: (order) => (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 font-medium"
            onClick={() => onRowAction("view", order)}
          >
            {order.orderNumber}
          </Button>
        ),
      },
      {
        id: "status",
        header: t("table.status"),
        cell: (order) => <OrderStatusBadge status={order.status} />,
      },
      {
        id: "orderDate",
        header: t("table.orderDate"),
        cell: (order) => (
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatDate(order.orderDate, dateFormat)}
          </span>
        ),
      },
      {
        id: "receiver",
        header: t("table.receiver"),
        cell: (order) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {order.receiverName}
            </p>
            <p className="text-xs text-muted-foreground">
              <span dir="ltr" className="inline-block tabular-nums">
                {order.receiverPhone}
              </span>
            </p>
          </div>
        ),
      },
      {
        id: "destination",
        header: t("table.destination"),
        cell: (order) => (
          <div className="min-w-0 text-sm text-muted-foreground">
            <p className="truncate">
              {getGovernorateLabel(order.governorate, locale)}
            </p>
            <p className="truncate text-xs">{order.area}</p>
          </div>
        ),
      },
      {
        id: "pickup",
        header: t("table.pickup"),
        cell: (order) => (
          <span className="text-sm text-muted-foreground">
            {order.senderLocation.name}
          </span>
        ),
      },
      {
        id: "payment",
        header: t("table.payment"),
        cell: (order) => (
          <span className="text-sm text-muted-foreground">
            {t(`payment.${order.paymentMethod}`)}
          </span>
        ),
      },
      {
        id: "value",
        header: t("table.value"),
        align: "end",
        cell: (order) => (
          <span dir="ltr" className="text-sm tabular-nums text-foreground">
            {formatCurrency(order.orderValue, order.currency, intlLocale)}
          </span>
        ),
      },
      {
        id: "weight",
        header: t("table.weight"),
        align: "end",
        cell: (order) => (
          <span dir="ltr" className="text-sm tabular-nums text-muted-foreground">
            {order.totalWeightKg.toFixed(3)} {t("table.weightUnit")}
          </span>
        ),
      },
      {
        id: "actions",
        header: t("table.actions"),
        align: "end",
        cell: (order) => (
          <OrderRowActionsMenu order={order} onAction={onRowAction} />
        ),
      },
    );

      return base;
    },
    [
      t,
      locale,
      dateFormat,
      intlLocale,
      onRowAction,
      selectionEnabled,
      selectAllHeader,
      selectedIds,
      onToggleRow,
    ],
  );

  return (
    <DataTable
      caption={t("table.caption")}
      columns={columns}
      data={orders}
      getRowKey={(order) => order.id}
      isFetching={isFetching}
      emptyState={emptyState}
      search={false}
      sort={false}
      filters={false}
      toolbar={{
        title: t("toolbar.title"),
        render: () => (
          <OrdersToolbar
            search={search}
            sortOption={sortOption}
            selectedCount={selectedIds?.size ?? 0}
            canBulkBook={selectionEnabled}
            onBulkBook={selectionEnabled ? onBulkBook : undefined}
            onClearSelection={selectionEnabled ? onClearSelection : undefined}
            governorateFilter={governorateFilter}
            senderLocationFilter={senderLocationFilter}
            paymentMethodFilter={paymentMethodFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            minValue={minValue}
            maxValue={maxValue}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={onSearchChange}
            onSortChange={onSortChange}
            onGovernorateFilterChange={onGovernorateFilterChange}
            onSenderLocationFilterChange={onSenderLocationFilterChange}
            onPaymentMethodFilterChange={onPaymentMethodFilterChange}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onMinValueChange={onMinValueChange}
            onMaxValueChange={onMaxValueChange}
            onClearFilters={onClearFilters}
            disabled={isFetching}
          />
        ),
      }}
      pagination={{
        page,
        totalPages,
        totalElements,
        pageSize,
        onPageChange,
        isFetching,
        labels: {
          ariaLabel: t("pagination.label"),
          summary: ({ start, end, total }) =>
            t("pagination.summary", { start, end, total }),
          pageOf: ({ current, total }) =>
            t("pagination.pageOf", { current, total }),
        },
      }}
    />
  );
}
