import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { CarrierCatalog } from "@/features/shipping-partners/components/carrier-catalog";
import { ConnectionDeleteDialog } from "@/features/shipping-partners/components/connection-delete-dialog";
import { ConnectionFormDialog } from "@/features/shipping-partners/components/connection-form-dialog";
import type { ConnectionRowAction } from "@/features/shipping-partners/components/connection-row-actions-menu";
import { ConnectionsDataTable } from "@/features/shipping-partners/components/connections-data-table";
import { ConnectionsEmptyState } from "@/features/shipping-partners/components/connections-empty-state";
import { ShippingPartnersErrorState } from "@/features/shipping-partners/components/shipping-partners-error-state";
import { ShippingPartnersHero } from "@/features/shipping-partners/components/shipping-partners-hero";
import { ShippingPartnersPageSkeleton } from "@/features/shipping-partners/components/shipping-partners-page-skeleton";
import { useCarrierConnections } from "@/features/shipping-partners/hooks/use-carrier-connections";
import { useCarriers } from "@/features/shipping-partners/hooks/use-carriers";
import { useToggleCarrierConnection } from "@/features/shipping-partners/hooks/use-toggle-carrier-connection";
import {
  DEFAULT_CONNECTIONS_SORT,
  parseConnectionsSortOption,
  readActiveOnlyFilter,
  readConnectionsSortOption,
  readShippingPartnersTab,
  type ConnectionsSortOption,
  type ShippingPartnersTab,
} from "@/features/shipping-partners/lib/list-params";
import type {
  Carrier,
  CarrierConnection,
} from "@/features/shipping-partners/types";
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
  | { mode: "create"; carrier: Carrier; connection: null }
  | { mode: "edit"; carrier: Carrier; connection: CarrierConnection }
  | null;

export function ShippingPartnersHome() {
  const { t } = useTranslation("shippingPartners");
  const { hasPermission } = useMerchantPermissions();
  const canManage = hasPermission(MerchantPermission.CARRIER_CONNECTION_MANAGE);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

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

  const tab = readShippingPartnersTab(searchParams.get("tab"));
  const { searchInput, debouncedSearch, handleSearchChange } = useListSearchParam(
    searchParams,
    updateParams,
  );
  const page = readPageIndex(searchParams.get("page"));
  const sortOption = readConnectionsSortOption(searchParams.get("sort"));
  const { sort, direction } = parseConnectionsSortOption(sortOption);
  const activeOnly = readActiveOnlyFilter(searchParams.get("active"));
  const [formState, setFormState] = useState<FormState>(null);
  const [connectionToDelete, setConnectionToDelete] =
    useState<CarrierConnection | null>(null);

  const carriersQuery = useCarriers();
  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      direction,
      search: debouncedSearch || undefined,
      active: activeOnly ? true : undefined,
    }),
    [page, sort, direction, debouncedSearch, activeOnly],
  );
  const connectionsQuery = useCarrierConnections(queryParams, {
    enabled: tab === "connected",
  });
  const toggleMutation = useToggleCarrierConnection();

  const carriers = useMemo(
    () => carriersQuery.data ?? [],
    [carriersQuery.data],
  );
  const carrierByCode = useMemo(
    () => new Map(carriers.map((carrier) => [carrier.code, carrier])),
    [carriers],
  );
  const catalogReady = carriersQuery.isSuccess;

  const isCarrierAvailable = useCallback(
    (code: string) => {
      if (!catalogReady) return true;
      return carrierByCode.has(code);
    },
    [catalogReady, carrierByCode],
  );

  useEffect(() => {
    const data = connectionsQuery.data;
    if (tab !== "connected" || !data || connectionsQuery.isFetching) return;

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
  }, [tab, connectionsQuery.data, connectionsQuery.isFetching, updateParams]);

  const handleTabChange = (next: ShippingPartnersTab) => {
    updateParams({
      tab: next === "available" ? null : next,
    });
  };

  const handleSortChange = (value: ConnectionsSortOption) => {
    updateParams({
      sort: value === DEFAULT_CONNECTIONS_SORT ? null : value,
      page: null,
    });
  };

  const handleActiveOnlyChange = (value: boolean) => {
    updateParams({
      active: value ? "true" : null,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: writePageIndex(nextPage) });
  };

  const openCreate = (carrier: Carrier, opener: HTMLElement) => {
    restoreFocusRef.current = opener;
    setFormState({ mode: "create", carrier, connection: null });
  };

  const handleRowAction = (
    action: ConnectionRowAction,
    connection: CarrierConnection,
    opener: HTMLElement,
  ) => {
    if (action === "remove") {
      restoreFocusRef.current = opener;
      setConnectionToDelete(connection);
      return;
    }

    const carrier = carrierByCode.get(connection.carrier.code);
    if (!carrier) return;
    restoreFocusRef.current = opener;
    setFormState({ mode: "edit", carrier, connection });
  };

  const panelLoading =
    tab === "available"
      ? carriersQuery.isLoading && !carriersQuery.data
      : connectionsQuery.isLoading && !connectionsQuery.data;

  const connections = connectionsQuery.data?.content ?? [];
  const hasSearch = debouncedSearch.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#shipping-partners-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      <ShippingPartnersHero
        activeTab={tab}
        onTabChange={handleTabChange}
        totalElements={
          tab === "connected" ? connectionsQuery.data?.totalElements : undefined
        }
      />

      <div
        id="shipping-partners-main"
        role="tabpanel"
        aria-labelledby={`shipping-partners-tab-${tab}`}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={-1}
      >
        {panelLoading ? <ShippingPartnersPageSkeleton /> : null}

        {!panelLoading && tab === "available" && carriersQuery.isError ? (
          <ShippingPartnersErrorState
            title={t("catalog.loadFailed")}
            hint={t("catalog.loadFailedHint")}
            onRetry={() => void carriersQuery.refetch()}
            isRetrying={carriersQuery.isFetching}
          />
        ) : null}

        {!panelLoading && tab === "available" && !carriersQuery.isError ? (
          <CarrierCatalog
            carriers={carriers}
            canManage={canManage}
            onConnect={openCreate}
          />
        ) : null}

        {!panelLoading && tab === "connected" && connectionsQuery.isError ? (
          <ShippingPartnersErrorState
            title={t("errors.loadFailed")}
            hint={t("errors.loadFailedHint")}
            onRetry={() => void connectionsQuery.refetch()}
            isRetrying={connectionsQuery.isFetching}
          />
        ) : null}

        {!panelLoading && tab === "connected" && !connectionsQuery.isError ? (
          <ConnectionsDataTable
            connections={connections}
            search={searchInput}
            sortOption={sortOption}
            activeOnly={activeOnly}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onActiveOnlyChange={handleActiveOnlyChange}
            page={connectionsQuery.data?.page ?? 0}
            totalPages={connectionsQuery.data?.totalPages ?? 0}
            totalElements={connectionsQuery.data?.totalElements ?? 0}
            pageSize={connectionsQuery.data?.size ?? PAGE_SIZE}
            onPageChange={handlePageChange}
            onRowAction={handleRowAction}
            onToggle={(connection, active) =>
              toggleMutation.mutate({ id: connection.id, active })
            }
            isCarrierAvailable={isCarrierAvailable}
            pendingToggleId={
              toggleMutation.isPending
                ? (toggleMutation.variables?.id ?? null)
                : null
            }
            canManage={canManage}
            isFetching={connectionsQuery.isFetching}
            emptyState={
              <ConnectionsEmptyState
                hasSearch={hasSearch}
                hasFilters={activeOnly}
              />
            }
          />
        ) : null}
      </div>

      <ConnectionFormDialog
        mode={formState?.mode ?? "create"}
        carrier={formState?.carrier ?? null}
        connection={formState?.connection ?? null}
        open={formState !== null}
        restoreFocusRef={restoreFocusRef}
        onOpenChange={(next) => {
          if (!next) setFormState(null);
        }}
      />

      <ConnectionDeleteDialog
        connection={connectionToDelete}
        open={connectionToDelete !== null}
        onOpenChange={(next) => {
          if (!next) {
            setConnectionToDelete(null);
            const node = restoreFocusRef.current;
            if (node?.isConnected) {
              window.requestAnimationFrame(() => node.focus());
            }
          }
        }}
      />
    </div>
  );
}
