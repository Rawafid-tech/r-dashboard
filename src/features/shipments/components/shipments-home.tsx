import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ShipmentRowAction } from "@/features/shipments/components/shipment-row-actions-menu";
import { ShipmentCancelDialog } from "@/features/shipments/components/shipment-cancel-dialog";
import { ShipmentsDataTable } from "@/features/shipments/components/shipments-data-table";
import { ShipmentsEmptyState } from "@/features/shipments/components/shipments-empty-state";
import { ShipmentsErrorState } from "@/features/shipments/components/shipments-error-state";
import { ShipmentsHero } from "@/features/shipments/components/shipments-hero";
import { ShipmentsPageSkeleton } from "@/features/shipments/components/shipments-page-skeleton";
import { useBatchShipmentLabels, useShipmentLabel } from "@/features/shipments/hooks/use-shipment-label";
import { useShipmentCounts } from "@/features/shipments/hooks/use-shipment-counts";
import { useShipments } from "@/features/shipments/hooks/use-shipments";
import { statusesForTab } from "@/features/shipments/lib/shipment-actions";
import {
  DEFAULT_SHIPMENTS_SORT,
  DEFAULT_SHIPMENTS_TAB,
  localDateToInstantEndExclusive,
  localDateToInstantStart,
  parseShipmentsSortOption,
  readShipmentsKindFilter,
  readShipmentsSortOption,
  readShipmentsTab,
  DEFAULT_SHIPMENTS_KIND,
} from "@/features/shipments/lib/list-params";
import type { Shipment, ShipmentsListTab } from "@/features/shipments/types";
import { useCarrierConnections } from "@/features/shipping-partners/hooks/use-carrier-connections";
import { useListSearchParam } from "@/shared/hooks/use-list-search-param";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";

const PAGE_SIZE = 20;
const MAX_BATCH_LABELS = 50;

export type ShipmentsListScope = "shipments" | "returns";

interface ShipmentsHomeProps {
  scope?: ShipmentsListScope;
}

export function ShipmentsHome({ scope = "shipments" }: ShipmentsHomeProps) {
  const isReturnsList = scope === "returns";
  const { t } = useTranslation(isReturnsList ? "returns" : "shipments");
  const mainPanelId = isReturnsList ? "returns-main" : "shipments-main";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [shipmentToCancel, setShipmentToCancel] = useState<Shipment | null>(
    null,
  );

  const labelMutation = useShipmentLabel();
  const batchLabelsMutation = useBatchShipmentLabels();

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
  const sortOption = readShipmentsSortOption(searchParams.get("sort"));
  const { sort, direction } = parseShipmentsSortOption(sortOption);
  const activeTab = readShipmentsTab(searchParams.get("tab"));
  const kindFilter = isReturnsList
    ? ("RETURN_PICKUP" as const)
    : readShipmentsKindFilter(searchParams.get("kind"));
  const connectionFilter = searchParams.get("connection") ?? "";
  const orderFilter = searchParams.get("order") ?? "";
  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      direction,
      status: statusesForTab(activeTab),
      kind: isReturnsList
        ? "RETURN_PICKUP"
        : kindFilter === "all"
          ? undefined
          : kindFilter,
      search: debouncedSearch || undefined,
      connectionId: connectionFilter || undefined,
      orderId: orderFilter || undefined,
      from: dateFrom ? localDateToInstantStart(dateFrom) : undefined,
      to: dateTo ? localDateToInstantEndExclusive(dateTo) : undefined,
    }),
    [
      page,
      sort,
      direction,
      activeTab,
      kindFilter,
      debouncedSearch,
      connectionFilter,
      orderFilter,
      dateFrom,
      dateTo,
    ],
  );

  const shipmentsQuery = useShipments(queryParams);
  const countsQuery = useShipmentCounts();
  const connectionsQuery = useCarrierConnections({
    active: true,
    size: 100,
  });

  useEffect(() => {
    const data = shipmentsQuery.data;
    if (!data || shipmentsQuery.isFetching) return;

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
  }, [shipmentsQuery.data, shipmentsQuery.isFetching, updateParams]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, page, debouncedSearch, kindFilter, connectionFilter, orderFilter, dateFrom, dateTo]);

  const handleTabChange = (tab: ShipmentsListTab) => {
    updateParams({
      tab: tab === DEFAULT_SHIPMENTS_TAB ? null : tab,
      page: null,
    });
  };

  const handleSortChange = (value: typeof sortOption) => {
    updateParams({
      sort: value === DEFAULT_SHIPMENTS_SORT ? null : value,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: writePageIndex(nextPage) });
  };

  const handleToggleRow = (shipment: Shipment, selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(shipment.id);
      } else {
        next.delete(shipment.id);
      }
      return next;
    });
  };

  const handleToggleAllOnPage = (rows: Shipment[], selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      rows.forEach((row) => {
        if (selected) {
          next.add(row.id);
        } else {
          next.delete(row.id);
        }
      });
      return next;
    });
  };

  const shipments = shipmentsQuery.data?.content ?? [];
  const shipmentById = useMemo(
    () => new Map(shipments.map((row) => [row.id, row])),
    [shipments],
  );

  const handlePrintSelected = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      toast.error(t("toast.batchEmpty"));
      return;
    }
    if (ids.length > MAX_BATCH_LABELS) {
      toast.error(t("toast.batchTooMany"));
      return;
    }

    const selectedRows = ids
      .map((id) => shipmentById.get(id))
      .filter((row): row is Shipment => Boolean(row));

    const connectionIds = new Set(
      selectedRows.map((row) => row.connection.id),
    );
    if (connectionIds.size > 1) {
      toast.error(t("toast.batchMixedConnections"));
      return;
    }

    void batchLabelsMutation.mutateAsync(ids);
  };

  const handleRowAction = (action: ShipmentRowAction, shipment: Shipment) => {
    switch (action) {
      case "view":
        navigate(`/shipments/${encodeURIComponent(shipment.id)}`);
        break;
      case "print":
        void labelMutation.mutateAsync({
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
        });
        break;
      case "cancel":
        setShipmentToCancel(shipment);
        break;
      default:
        break;
    }
  };

  const isInitialLoading =
    shipmentsQuery.isLoading && !shipmentsQuery.data;
  const hasSearch = debouncedSearch.length > 0;
  const hasFilters =
    (!isReturnsList && kindFilter !== DEFAULT_SHIPMENTS_KIND) ||
    Boolean(connectionFilter) ||
    Boolean(orderFilter) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href={`#${mainPanelId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {isReturnsList ? t("list.skipToContent") : t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <ShipmentsPageSkeleton />
      ) : (
        <>
          <ShipmentsHero
            activeTab={activeTab}
            counts={countsQuery.data}
            onTabChange={handleTabChange}
            scope={scope}
            mainPanelId={mainPanelId}
          />

          {shipmentsQuery.isError ? (
            <ShipmentsErrorState
              onRetry={() => void shipmentsQuery.refetch()}
              isRetrying={shipmentsQuery.isFetching}
            />
          ) : null}

          {!shipmentsQuery.isError ? (
            <div
              id={mainPanelId}
              role="tabpanel"
              aria-labelledby={`shipments-tab-${activeTab}`}
            >
              <ShipmentsDataTable
                shipments={shipments}
                connections={connectionsQuery.data?.content ?? []}
                search={searchInput}
                sortOption={sortOption}
                kindFilter={kindFilter}
                connectionFilter={connectionFilter}
                dateFrom={dateFrom}
                dateTo={dateTo}
                selectedIds={selectedIds}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                showKindFilter={!isReturnsList}
                linkOrderToView={isReturnsList}
                onKindFilterChange={
                  isReturnsList
                    ? undefined
                    : (value) =>
                        updateParams({
                          kind:
                            value === DEFAULT_SHIPMENTS_KIND ? null : value,
                          page: null,
                        })
                }
                onConnectionFilterChange={(value) =>
                  updateParams({ connection: value || null, page: null })
                }
                onDateFromChange={(value) =>
                  updateParams({ from: value || null, page: null })
                }
                onDateToChange={(value) =>
                  updateParams({ to: value || null, page: null })
                }
                hasActiveFilters={hasFilters || hasSearch}
                onClearFilters={() => {
                  handleSearchChange("");
                  updateParams({
                    kind: null,
                    connection: null,
                    from: null,
                    to: null,
                    page: null,
                  });
                }}
                onToggleRow={handleToggleRow}
                onToggleAllOnPage={handleToggleAllOnPage}
                onPrintSelected={handlePrintSelected}
                onClearSelection={() => setSelectedIds(new Set())}
                page={shipmentsQuery.data?.page ?? 0}
                totalPages={shipmentsQuery.data?.totalPages ?? 0}
                totalElements={shipmentsQuery.data?.totalElements ?? 0}
                pageSize={shipmentsQuery.data?.size ?? PAGE_SIZE}
                onPageChange={handlePageChange}
                onRowAction={handleRowAction}
                isFetching={shipmentsQuery.isFetching}
                emptyState={
                  <ShipmentsEmptyState
                    hasSearch={hasSearch}
                    hasFilters={hasFilters}
                    scope={scope}
                  />
                }
              />
            </div>
          ) : null}
        </>
      )}

      <ShipmentCancelDialog
        shipment={shipmentToCancel}
        open={shipmentToCancel !== null}
        onOpenChange={(open) => {
          if (!open) setShipmentToCancel(null);
        }}
      />
    </div>
  );
}
