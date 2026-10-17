import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router-dom";
import { RegionsDataTable } from "@/features/admin/carriers/components/regions-data-table";
import { RegionsEmptyState } from "@/features/admin/carriers/components/regions-empty-state";
import { RegionsErrorState } from "@/features/admin/carriers/components/regions-error-state";
import { RegionsHero } from "@/features/admin/carriers/components/regions-hero";
import { RegionsPageSkeleton } from "@/features/admin/carriers/components/regions-page-skeleton";
import { RegionsSyncSummary } from "@/features/admin/carriers/components/regions-sync-summary";
import { useAdminCarriers } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { useCarrierRegions } from "@/features/admin/carriers/hooks/use-carrier-regions";
import { useSyncCarrierRegions } from "@/features/admin/carriers/hooks/use-sync-carrier-regions";
import {
  activeFilterToParam,
  readRegionActiveFilter,
  readUnmappedFilter,
  type RegionActiveFilter,
} from "@/features/admin/carriers/lib/regions-list-params";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import { parseApiError } from "@/shared/api/error-handler";
import { useListSearchParam } from "@/shared/hooks/use-list-search-param";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";
import { AdminRole } from "@/shared/types/enums";

const PAGE_SIZE = 50;

export function CarrierRegionsHome() {
  const { code = "" } = useParams();
  const { t, i18n } = useTranslation("admin");
  const { data: admin } = useAdminMe();
  const carriersQuery = useAdminCarriers();
  const canManage = admin?.role === AdminRole.SUPER_ADMIN;
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
  const governorateId = searchParams.get("governorate") ?? "";
  const activeFilter = readRegionActiveFilter(searchParams.get("active"));
  const unmapped = readUnmappedFilter(searchParams.get("unmapped"));
  const activeParam = activeFilterToParam(activeFilter);

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(governorateId && !unmapped ? { governorateId } : {}),
      ...(unmapped ? { unmapped: true } : {}),
      ...(activeParam !== undefined ? { active: activeParam } : {}),
    }),
    [activeParam, debouncedSearch, governorateId, page, unmapped],
  );

  const regionsQuery = useCarrierRegions(code, queryParams);
  const syncMutation = useSyncCarrierRegions(code);
  const lastSyncResult = useRef(syncMutation.data ?? null);
  if (syncMutation.data) {
    lastSyncResult.current = syncMutation.data;
  }

  useEffect(() => {
    const data = regionsQuery.data;
    if (!data || regionsQuery.isFetching) return;

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
  }, [regionsQuery.data, regionsQuery.isFetching, updateParams]);

  const carrier = carriersQuery.data?.find((item) => item.code === code);
  const name = carrier
    ? carrierDisplayName(
        {
          code: carrier.code,
          nameEn: carrier.nameEn ?? "",
          nameAr: carrier.nameAr ?? "",
        },
        i18n.language,
      )
    : code;

  const handleActiveFilterChange = (value: RegionActiveFilter) => {
    updateParams({
      active: value === "all" ? null : value,
      page: null,
    });
  };

  const handleUnmappedChange = (value: boolean) => {
    updateParams({
      unmapped: value ? "true" : null,
      governorate: null,
      page: null,
    });
  };

  const isInitialLoading = regionsQuery.isLoading && !regionsQuery.data;
  const regions = regionsQuery.data?.content ?? [];
  const hasFilters =
    debouncedSearch.length > 0 ||
    governorateId.length > 0 ||
    unmapped ||
    activeFilter !== "all";
  const errorDetail = regionsQuery.isError
    ? parseApiError(regionsQuery.error).detail
    : undefined;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#carrier-regions-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("carriers.regions.skipToContent")}
      </a>

      {isInitialLoading ? (
        <div id="carrier-regions-main">
          <RegionsPageSkeleton />
        </div>
      ) : (
        <>
          <RegionsHero
            name={name}
            code={code}
            canManage={canManage}
            isSyncing={syncMutation.isPending}
            totalElements={regionsQuery.data?.totalElements}
            onSync={() => {
              if (!canManage || syncMutation.isPending) return;
              syncMutation.mutate();
            }}
          />

          {lastSyncResult.current ? (
            <RegionsSyncSummary
              result={lastSyncResult.current}
              platform={carrier?.platform ?? null}
              onShowUnmapped={() => handleUnmappedChange(true)}
            />
          ) : null}

          <div id="carrier-regions-main" className="flex flex-col gap-6">
            {regionsQuery.isError ? (
              <RegionsErrorState
                detail={errorDetail}
                onRetry={() => void regionsQuery.refetch()}
                isRetrying={regionsQuery.isFetching}
              />
            ) : (
              <div aria-busy={regionsQuery.isFetching}>
                <p className="sr-only" aria-live="polite">
                  {regionsQuery.isFetching
                    ? t("carriers.regions.loading")
                    : ""}
                </p>
                <RegionsDataTable
                  regions={regions}
                  search={searchInput}
                  governorateId={governorateId}
                  activeFilter={activeFilter}
                  unmapped={unmapped}
                  onSearchChange={handleSearchChange}
                  onGovernorateChange={(value) =>
                    updateParams({ governorate: value || null, page: null })
                  }
                  onActiveFilterChange={handleActiveFilterChange}
                  onUnmappedChange={handleUnmappedChange}
                  page={regionsQuery.data?.page ?? 0}
                  totalPages={regionsQuery.data?.totalPages ?? 0}
                  totalElements={regionsQuery.data?.totalElements ?? 0}
                  pageSize={regionsQuery.data?.size ?? PAGE_SIZE}
                  onPageChange={(nextPage) =>
                    updateParams({ page: writePageIndex(nextPage) })
                  }
                  isFetching={regionsQuery.isFetching}
                  emptyState={<RegionsEmptyState hasFilters={hasFilters} />}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
