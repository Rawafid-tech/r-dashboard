import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { LocationDefaultConfirmDialog } from "@/features/locations/components/location-default-confirm-dialog";
import { LocationFormDialog } from "@/features/locations/components/location-form-dialog";
import {
  LocationStatusConfirmDialog,
  type LocationStatusConfirmMode,
} from "@/features/locations/components/location-status-confirm-dialog";
import type { LocationRowAction } from "@/features/locations/components/location-row-actions-menu";
import { LocationsDataTable } from "@/features/locations/components/locations-data-table";
import { LocationsEmptyState } from "@/features/locations/components/locations-empty-state";
import { LocationsErrorState } from "@/features/locations/components/locations-error-state";
import { LocationsHero } from "@/features/locations/components/locations-hero";
import { LocationsPageSkeleton } from "@/features/locations/components/locations-page-skeleton";
import { useSenderLocations } from "@/features/locations/hooks/use-sender-locations";
import {
  DEFAULT_LOCATIONS_SORT,
  parseLocationsSortOption,
  readLocationStatusFilter,
  readLocationsSortOption,
  type LocationsSortOption,
} from "@/features/locations/lib/locations-list-params";
import type { SenderLocation } from "@/features/locations/types";
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

export function LocationsHome() {
  const { t } = useTranslation("locations");
  const { hasPermission } = useMerchantPermissions();
  const canManage = hasPermission(MerchantPermission.SENDER_LOCATION_MANAGE);

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
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editLocation, setEditLocation] = useState<SenderLocation | null>(
    null,
  );
  const [statusTarget, setStatusTarget] = useState<{
    location: SenderLocation;
    mode: LocationStatusConfirmMode;
  } | null>(null);
  const [defaultTarget, setDefaultTarget] = useState<SenderLocation | null>(
    null,
  );

  const page = readPageIndex(searchParams.get("page"));
  const sortOption = readLocationsSortOption(searchParams.get("sort"));
  const { sort, direction } = parseLocationsSortOption(sortOption);
  const statusFilter = searchParams.get("status") ?? "";
  const governorateFilter = searchParams.get("governorateId") ?? "";
  const parsedStatus = readLocationStatusFilter(statusFilter || null);

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      direction,
      search: debouncedSearch || undefined,
      status: parsedStatus,
      governorateId: governorateFilter || undefined,
    }),
    [page, sort, direction, debouncedSearch, parsedStatus, governorateFilter],
  );

  const locationsQuery = useSenderLocations(queryParams);

  useEffect(() => {
    const data = locationsQuery.data;
    if (!data || locationsQuery.isFetching) return;

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
  }, [locationsQuery.data, locationsQuery.isFetching, updateParams]);

  const handleSortChange = (value: LocationsSortOption) => {
    updateParams({
      sort: value === DEFAULT_LOCATIONS_SORT ? null : value,
      page: null,
    });
  };

  const handleStatusFilterChange = (value: string) => {
    updateParams({
      status: value || null,
      page: null,
    });
  };

  const handleGovernorateFilterChange = (value: string) => {
    updateParams({
      governorateId: value || null,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      page: writePageIndex(nextPage),
    });
  };

  const handleRowAction = (action: LocationRowAction, location: SenderLocation) => {
    switch (action) {
      case "edit":
        setEditLocation(location);
        setFormMode("edit");
        break;
      case "setDefault":
        setDefaultTarget(location);
        break;
      case "activate":
        setStatusTarget({ location, mode: "activate" });
        break;
      case "deactivate":
        setStatusTarget({ location, mode: "deactivate" });
        break;
      default:
        break;
    }
  };

  const isInitialLoading = locationsQuery.isLoading && !locationsQuery.data;
  const locations = locationsQuery.data?.content ?? [];
  const hasSearch = debouncedSearch.length > 0;
  const hasFilters = Boolean(statusFilter || governorateFilter);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#locations-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <LocationsPageSkeleton />
      ) : (
        <>
          <LocationsHero
            totalElements={locationsQuery.data?.totalElements}
            onAdd={() => {
              setEditLocation(null);
              setFormMode("create");
            }}
            canManage={canManage}
          />

          {locationsQuery.isError ? (
            <LocationsErrorState
              onRetry={() => void locationsQuery.refetch()}
              isRetrying={locationsQuery.isFetching}
            />
          ) : null}

          {!locationsQuery.isError ? (
            <div id="locations-main">
              <LocationsDataTable
                locations={locations}
                search={searchInput}
                sortOption={sortOption}
                statusFilter={statusFilter}
                governorateFilter={governorateFilter}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onStatusFilterChange={handleStatusFilterChange}
                onGovernorateFilterChange={handleGovernorateFilterChange}
                page={locationsQuery.data?.page ?? 0}
                totalPages={locationsQuery.data?.totalPages ?? 0}
                totalElements={locationsQuery.data?.totalElements ?? 0}
                pageSize={locationsQuery.data?.size ?? PAGE_SIZE}
                onPageChange={handlePageChange}
                onRowAction={handleRowAction}
                isFetching={locationsQuery.isFetching}
                emptyState={
                  <LocationsEmptyState
                    hasSearch={hasSearch}
                    hasFilters={hasFilters}
                  />
                }
              />
            </div>
          ) : null}
        </>
      )}

      <LocationFormDialog
        mode={formMode === "edit" ? "edit" : "create"}
        location={editLocation}
        open={formMode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFormMode(null);
            setEditLocation(null);
          }
        }}
      />

      <LocationStatusConfirmDialog
        location={statusTarget?.location ?? null}
        mode={statusTarget?.mode ?? null}
        open={statusTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
      />

      <LocationDefaultConfirmDialog
        location={defaultTarget}
        open={defaultTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDefaultTarget(null);
        }}
      />
    </div>
  );
}
