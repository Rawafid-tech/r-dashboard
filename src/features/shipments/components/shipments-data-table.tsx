import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { orderViewPath } from "@/features/orders/lib/order-view-link";
import { ShipmentIssueBadge } from "@/features/shipments/components/shipment-issue-badge";
import { canPrintShipmentLabel } from "@/features/shipments/lib/shipment-actions";
import { CarrierMark } from "@/features/shipping-partners/components/carrier-mark";
import { ShipmentRowActionsMenu } from "@/features/shipments/components/shipment-row-actions-menu";
import type { ShipmentRowAction } from "@/features/shipments/components/shipment-row-actions-menu";
import { ShipmentKindBadge } from "@/features/shipments/components/shipment-kind-badge";
import { ShipmentStatusBadge } from "@/features/shipments/components/shipment-status-badge";
import { getShipmentKind } from "@/features/shipments/lib/shipment-kind";
import { ShipmentsToolbar } from "@/features/shipments/components/shipments-toolbar";
import type {
  ShipmentsKindFilter,
  ShipmentsSortOption,
} from "@/features/shipments/lib/list-params";
import { shipmentCarrierLabel } from "@/features/shipments/lib/shipment-connection-label";
import type { Shipment } from "@/features/shipments/types";
import type { CarrierConnection } from "@/features/shipping-partners/types";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { Checkbox } from "@/shared/components/ui";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { useLocaleStore } from "@/stores/locale.store";
import { useSettings } from "@/features/account/hooks/use-settings";

interface ShipmentsDataTableProps {
  shipments: Shipment[];
  connections: CarrierConnection[];
  search: string;
  sortOption: ShipmentsSortOption;
  kindFilter: ShipmentsKindFilter;
  connectionFilter: string;
  dateFrom: string;
  dateTo: string;
  selectedIds: Set<string>;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ShipmentsSortOption) => void;
  onKindFilterChange?: (value: ShipmentsKindFilter) => void;
  onConnectionFilterChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onToggleRow: (shipment: Shipment, selected: boolean) => void;
  onToggleAllOnPage: (shipments: Shipment[], selected: boolean) => void;
  onPrintSelected?: () => void;
  onClearSelection?: () => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowAction: (action: ShipmentRowAction, shipment: Shipment) => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
  /** Link order # to open the order sheet on /orders (by id). */
  linkOrderToView?: boolean;
  showKindFilter?: boolean;
}

export function ShipmentsDataTable({
  shipments,
  connections,
  search,
  sortOption,
  kindFilter,
  connectionFilter,
  dateFrom,
  dateTo,
  selectedIds,
  onSearchChange,
  onSortChange,
  onKindFilterChange,
  onConnectionFilterChange,
  onDateFromChange,
  onDateToChange,
  hasActiveFilters,
  onClearFilters,
  onToggleRow,
  onToggleAllOnPage,
  onPrintSelected,
  onClearSelection,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onRowAction,
  isFetching,
  emptyState,
  linkOrderToView = false,
  showKindFilter = true,
}: ShipmentsDataTableProps) {
  const { t } = useTranslation(["shipments", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const settingsQuery = useSettings();
  const dateFormat = settingsQuery.data?.dateFormat ?? "DD_MM_YYYY";
  const { hasPermission } = useMerchantPermissions();
  const canPrintBatch = hasPermission(MerchantPermission.SHIPMENT_READ);

  const printableOnPage = useMemo(
    () => shipments.filter((row) => canPrintShipmentLabel(row)),
    [shipments],
  );

  const allPrintableSelected =
    printableOnPage.length > 0 &&
    printableOnPage.every((row) => selectedIds.has(row.id));

  const somePrintableSelected =
    printableOnPage.some((row) => selectedIds.has(row.id)) &&
    !allPrintableSelected;

  const selectAllHeader = (
    <Checkbox
      checked={
        allPrintableSelected
          ? true
          : somePrintableSelected
            ? "indeterminate"
            : false
      }
      onCheckedChange={(checked) =>
        onToggleAllOnPage(printableOnPage, checked === true)
      }
      disabled={printableOnPage.length === 0}
      aria-label={t("table.selectAll")}
    />
  );

  const columns = useMemo<DataTableColumn<Shipment>[]>(() => {
    const base: DataTableColumn<Shipment>[] = [];

    if (canPrintBatch) {
      base.push({
        id: "select",
        header: selectAllHeader,
        cell: (shipment) =>
          canPrintShipmentLabel(shipment) ? (
            <Checkbox
              checked={selectedIds.has(shipment.id)}
              onCheckedChange={(checked) =>
                onToggleRow(shipment, checked === true)
              }
              aria-label={t("table.selectRow", {
                tracking: shipment.trackingNumber ?? shipment.id,
              })}
            />
          ) : null,
        className: "w-10",
      });
    }

    base.push(
      {
        id: "orderNumber",
        header: t("table.orderNumber"),
        cell: (shipment) =>
          linkOrderToView ? (
            <Link
              to={orderViewPath(shipment.order.id)}
              className="font-medium tabular-nums text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {shipment.order.orderNumber}
            </Link>
          ) : (
            <span className="font-medium tabular-nums">
              {shipment.order.orderNumber}
            </span>
          ),
      },
      {
        id: "tracking",
        header: t("table.tracking"),
        cell: (shipment) =>
          shipment.trackingNumber ? (
            <Link
              to={`/shipments/${encodeURIComponent(shipment.id)}`}
              className="tabular-nums font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {shipment.trackingNumber}
            </Link>
          ) : (
            <Link
              to={`/shipments/${encodeURIComponent(shipment.id)}`}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {t("table.viewShipment")}
            </Link>
          ),
      },
      {
        id: "receiver",
        header: t("table.receiver"),
        cell: (shipment) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{shipment.receiverName}</p>
            <p className="truncate text-xs text-muted-foreground tabular-nums">
              {shipment.receiverPhone}
            </p>
          </div>
        ),
      },
      {
        id: "connection",
        header: t("table.connection"),
        cell: (shipment) => (
          <div className="flex min-w-0 items-center gap-2">
            <CarrierMark
              code={shipment.connection.carrierCode}
              name={shipmentCarrierLabel(shipment.connection, locale)}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {shipment.connection.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {shipmentCarrierLabel(shipment.connection, locale)}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "cod",
        header: t("table.cod"),
        cell: (shipment) =>
          formatCurrency(shipment.codAmount, "EGP", intlLocale),
      },
      {
        id: "status",
        header: t("table.status"),
        cell: (shipment) => (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1">
              <ShipmentKindBadge shipment={shipment} />
              <ShipmentStatusBadge
                status={shipment.status}
                kind={getShipmentKind(shipment)}
              />
            </div>
            {shipment.issue ? (
              <ShipmentIssueBadge issue={shipment.issue} />
            ) : null}
            {shipment.carrierState?.label ? (
              <p className="max-w-48 truncate text-xs text-muted-foreground">
                {shipment.carrierState.label}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "bookedAt",
        header: t("table.bookedAt"),
        cell: (shipment) =>
          shipment.bookedAt
            ? formatDate(shipment.bookedAt, dateFormat)
            : "—",
      },
      {
        id: "actions",
        header: t("table.actions"),
        align: "end",
        cell: (shipment) => (
          <ShipmentRowActionsMenu shipment={shipment} onAction={onRowAction} />
        ),
      },
    );

    return base;
  }, [
    allPrintableSelected,
    printableOnPage,
    canPrintBatch,
    dateFormat,
    intlLocale,
    locale,
    onRowAction,
    onToggleAllOnPage,
    onToggleRow,
    selectAllHeader,
    selectedIds,
    somePrintableSelected,
    linkOrderToView,
    t,
  ]);

  return (
    <DataTable
      caption={t("table.caption")}
      columns={columns}
      data={shipments}
      getRowKey={(row) => row.id}
      minWidth="960px"
      isFetching={isFetching}
      emptyState={emptyState}
      search={false}
      sort={false}
      filters={false}
      className="gap-5"
      toolbar={{
        title: t("toolbar.title"),
        render: () => (
          <ShipmentsToolbar
            search={search}
            sortOption={sortOption}
            kindFilter={kindFilter}
            showKindFilter={showKindFilter}
            connectionFilter={connectionFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            connections={connections}
            selectedCount={selectedIds.size}
            canPrintBatch={canPrintBatch}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={onSearchChange}
            onSortChange={onSortChange}
            onKindFilterChange={
              showKindFilter ? onKindFilterChange : undefined
            }
            onConnectionFilterChange={onConnectionFilterChange}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onClearFilters={onClearFilters}
            onPrintSelected={onPrintSelected}
            onClearSelection={onClearSelection}
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
          previous: t("common:common.previous"),
          next: t("common:common.next"),
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
