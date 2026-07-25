import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { CompaniesDataTable } from "@/features/admin/companies/components/companies-data-table";
import { CompaniesEmptyState } from "@/features/admin/companies/components/companies-empty-state";
import { CompaniesErrorState } from "@/features/admin/companies/components/companies-error-state";
import { CompaniesHero } from "@/features/admin/companies/components/companies-hero";
import { CompaniesPageSkeleton } from "@/features/admin/companies/components/companies-page-skeleton";
import {
  DEFAULT_COMPANIES_SORT,
  parseSortOption,
  readSortOption,
  type CompaniesSortOption,
} from "@/features/admin/companies/lib/companies-list-params";
import { useAdminCompanies } from "@/features/admin/companies/hooks/use-admin-companies";

const PAGE_SIZE = 20;

export function CompaniesHome() {
  const { t } = useTranslation("admin");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? "",
  );

  const debouncedSearch = useDebounce(searchInput.trim(), 300);
  const page = Math.max(0, Number(searchParams.get("page") ?? "1") - 1);
  const sortOption = readSortOption(searchParams.get("sort"));
  const { sort, direction } = parseSortOption(sortOption);

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      direction,
      search: debouncedSearch || undefined,
    }),
    [page, sort, direction, debouncedSearch],
  );

  const companiesQuery = useAdminCompanies(queryParams);

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

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateParams({
      q: value.trim() || null,
      page: null,
    });
  };

  const handleSortChange = (value: CompaniesSortOption) => {
    updateParams({
      sort: value === DEFAULT_COMPANIES_SORT ? null : value,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      page: nextPage <= 0 ? null : String(nextPage + 1),
    });
  };

  const isInitialLoading = companiesQuery.isLoading && !companiesQuery.data;
  const companies = companiesQuery.data?.content ?? [];
  const hasSearch = debouncedSearch.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#companies-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("companies.skipToContent")}
      </a>

      {isInitialLoading ? (
        <CompaniesPageSkeleton />
      ) : (
        <>
          <CompaniesHero totalElements={companiesQuery.data?.totalElements} />

          {companiesQuery.isError ? (
            <CompaniesErrorState
              onRetry={() => void companiesQuery.refetch()}
              isRetrying={companiesQuery.isFetching}
            />
          ) : null}

          {!companiesQuery.isError ? (
            <div id="companies-main">
              <CompaniesDataTable
                companies={companies}
                search={searchInput}
                sortOption={sortOption}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                page={companiesQuery.data?.page ?? 0}
                totalPages={companiesQuery.data?.totalPages ?? 0}
                totalElements={companiesQuery.data?.totalElements ?? 0}
                pageSize={companiesQuery.data?.size ?? PAGE_SIZE}
                onPageChange={handlePageChange}
                isFetching={companiesQuery.isFetching}
                emptyState={<CompaniesEmptyState hasSearch={hasSearch} />}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
