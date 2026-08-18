import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ShippingBoxDeleteDialog } from "@/features/shipping-boxes/components/shipping-box-delete-dialog";
import { ShippingBoxFormDialog } from "@/features/shipping-boxes/components/shipping-box-form-dialog";
import type { ShippingBoxRowAction } from "@/features/shipping-boxes/components/shipping-box-row-actions-menu";
import { ShippingBoxesDataTable } from "@/features/shipping-boxes/components/shipping-boxes-data-table";
import { ShippingBoxesEmptyState } from "@/features/shipping-boxes/components/shipping-boxes-empty-state";
import { ShippingBoxesErrorState } from "@/features/shipping-boxes/components/shipping-boxes-error-state";
import { ShippingBoxesHero } from "@/features/shipping-boxes/components/shipping-boxes-hero";
import { ShippingBoxesPageSkeleton } from "@/features/shipping-boxes/components/shipping-boxes-page-skeleton";
import { useShippingBoxes } from "@/features/shipping-boxes/hooks/use-shipping-boxes";
import {
  DEFAULT_SHIPPING_BOXES_SORT,
  parseShippingBoxesSortOption,
  readDefaultFilter,
  readShippingBoxesSortOption,
  type ShippingBoxesSortOption,
} from "@/features/shipping-boxes/lib/shipping-boxes-list-params";
import type { ShippingBox } from "@/features/shipping-boxes/types";
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
  | { mode: "create"; box: null }
  | { mode: "edit"; box: ShippingBox }
  | null;

export function ShippingBoxesHome() {
  const { t } = useTranslation("shippingBoxes");
  const { hasPermission } = useMerchantPermissions();
  const canManage = hasPermission(MerchantPermission.SHIPPING_BOX_MANAGE);

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
  const sortOption = readShippingBoxesSortOption(searchParams.get("sort"));
  const { sort, direction } = parseShippingBoxesSortOption(sortOption);
  const defaultFilter = searchParams.get("default") ?? "";
  const parsedDefault = readDefaultFilter(defaultFilter || null);
  const [formState, setFormState] = useState<FormState>(null);
  const [boxToDelete, setBoxToDelete] = useState<ShippingBox | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      direction,
      search: debouncedSearch || undefined,
      isDefault: parsedDefault,
    }),
    [page, sort, direction, debouncedSearch, parsedDefault],
  );

  const boxesQuery = useShippingBoxes(queryParams);

  useEffect(() => {
    const data = boxesQuery.data;
    if (!data || boxesQuery.isFetching) return;

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
  }, [boxesQuery.data, boxesQuery.isFetching, updateParams]);

  const handleSortChange = (value: ShippingBoxesSortOption) => {
    updateParams({
      sort: value === DEFAULT_SHIPPING_BOXES_SORT ? null : value,
      page: null,
    });
  };

  const handleDefaultFilterChange = (value: string) => {
    updateParams({
      default: value || null,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      page: writePageIndex(nextPage),
    });
  };

  const handleRowAction = (action: ShippingBoxRowAction, box: ShippingBox) => {
    switch (action) {
      case "edit":
        setFormState({ mode: "edit", box });
        break;
      case "delete":
        setBoxToDelete(box);
        break;
      default:
        break;
    }
  };

  const isInitialLoading = boxesQuery.isLoading && !boxesQuery.data;
  const boxes = boxesQuery.data?.content ?? [];
  const hasSearch = debouncedSearch.length > 0;
  const hasFilters = Boolean(defaultFilter);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#shipping-boxes-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <ShippingBoxesPageSkeleton />
      ) : (
        <>
          <ShippingBoxesHero
            totalElements={boxesQuery.data?.totalElements}
            onAdd={() => setFormState({ mode: "create", box: null })}
            canManage={canManage}
          />

          {boxesQuery.isError ? (
            <ShippingBoxesErrorState
              onRetry={() => void boxesQuery.refetch()}
              isRetrying={boxesQuery.isFetching}
            />
          ) : null}

          {!boxesQuery.isError ? (
            <div id="shipping-boxes-main">
              <ShippingBoxesDataTable
                boxes={boxes}
                search={searchInput}
                sortOption={sortOption}
                defaultFilter={defaultFilter}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onDefaultFilterChange={handleDefaultFilterChange}
                page={boxesQuery.data?.page ?? 0}
                totalPages={boxesQuery.data?.totalPages ?? 0}
                totalElements={boxesQuery.data?.totalElements ?? 0}
                pageSize={boxesQuery.data?.size ?? PAGE_SIZE}
                onPageChange={handlePageChange}
                onRowAction={handleRowAction}
                canManage={canManage}
                isFetching={boxesQuery.isFetching}
                emptyState={
                  <ShippingBoxesEmptyState
                    hasSearch={hasSearch}
                    hasFilters={hasFilters}
                  />
                }
              />
            </div>
          ) : null}
        </>
      )}

      <ShippingBoxFormDialog
        mode={formState?.mode ?? "create"}
        box={formState?.box ?? null}
        open={formState !== null}
        onOpenChange={(open) => {
          if (!open) setFormState(null);
        }}
      />

      <ShippingBoxDeleteDialog
        box={boxToDelete}
        open={boxToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setBoxToDelete(null);
        }}
      />
    </div>
  );
}
