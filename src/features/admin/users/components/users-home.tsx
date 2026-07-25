import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { UsersDataTable } from "@/features/admin/users/components/users-data-table";
import { UsersEmptyState } from "@/features/admin/users/components/users-empty-state";
import { UsersErrorState } from "@/features/admin/users/components/users-error-state";
import { UsersHero } from "@/features/admin/users/components/users-hero";
import { UsersPageSkeleton } from "@/features/admin/users/components/users-page-skeleton";
import {
  DEFAULT_USERS_SORT,
  parseUsersSortOption,
  readUsersSortOption,
  type UsersSortOption,
} from "@/features/admin/users/lib/users-list-params";
import { useAdminUsers } from "@/features/admin/users/hooks/use-admin-users";

const PAGE_SIZE = 20;

export function UsersHome() {
  const { t } = useTranslation("admin");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? "",
  );

  const debouncedSearch = useDebounce(searchInput.trim(), 300);
  const page = Math.max(0, Number(searchParams.get("page") ?? "1") - 1);
  const sortOption = readUsersSortOption(searchParams.get("sort"));
  const { sort, direction } = parseUsersSortOption(sortOption);

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

  const usersQuery = useAdminUsers(queryParams);

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

  const handleSortChange = (value: UsersSortOption) => {
    updateParams({
      sort: value === DEFAULT_USERS_SORT ? null : value,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      page: nextPage <= 0 ? null : String(nextPage + 1),
    });
  };

  const isInitialLoading = usersQuery.isLoading && !usersQuery.data;
  const users = usersQuery.data?.content ?? [];
  const hasSearch = debouncedSearch.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#users-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("users.skipToContent")}
      </a>

      {isInitialLoading ? (
        <UsersPageSkeleton />
      ) : (
        <>
          <UsersHero totalElements={usersQuery.data?.totalElements} />

          {usersQuery.isError ? (
            <UsersErrorState
              onRetry={() => void usersQuery.refetch()}
              isRetrying={usersQuery.isFetching}
            />
          ) : null}

          {!usersQuery.isError ? (
            <div id="users-main">
              <UsersDataTable
                users={users}
                search={searchInput}
                sortOption={sortOption}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                page={usersQuery.data?.page ?? 0}
                totalPages={usersQuery.data?.totalPages ?? 0}
                totalElements={usersQuery.data?.totalElements ?? 0}
                pageSize={usersQuery.data?.size ?? PAGE_SIZE}
                onPageChange={handlePageChange}
                isFetching={usersQuery.isFetching}
                emptyState={<UsersEmptyState hasSearch={hasSearch} />}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
