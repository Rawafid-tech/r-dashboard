import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { RoleDeleteDialog } from "@/features/roles/components/role-delete-dialog";
import { RoleFormDialog } from "@/features/roles/components/role-form-dialog";
import { RolesDataTable } from "@/features/roles/components/roles-data-table";
import { RolesEmptyState } from "@/features/roles/components/roles-empty-state";
import { RolesErrorState } from "@/features/roles/components/roles-error-state";
import { RolesHero } from "@/features/roles/components/roles-hero";
import { RolesPageSkeleton } from "@/features/roles/components/roles-page-skeleton";
import { useRoles } from "@/features/roles/hooks/use-roles";
import {
  DEFAULT_ROLES_SORT,
  parseRolesSortOption,
  readRolesSortOption,
  type RolesSortOption,
} from "@/features/roles/lib/roles-list-params";
import type { RoleListItem } from "@/features/roles/types";
import { useListSearchParam } from "@/shared/hooks/use-list-search-param";
import { useMerchantPermissions } from "@/shared/hooks/use-merchant-permissions";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";

const PAGE_SIZE = 20;

type FormState =
  | { mode: "create"; roleId: null }
  | { mode: "edit"; roleId: string }
  | null;

export function RolesHome() {
  const { t } = useTranslation("roles");
  const { canManageRoles } = useMerchantPermissions();
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
  const [formState, setFormState] = useState<FormState>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleListItem | null>(null);

  const page = readPageIndex(searchParams.get("page"));
  const sortOption = readRolesSortOption(searchParams.get("sort"));
  const { sort, direction } = parseRolesSortOption(sortOption);

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

  const rolesQuery = useRoles(queryParams);

  useEffect(() => {
    const data = rolesQuery.data;
    if (!data || rolesQuery.isFetching) return;

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
  }, [rolesQuery.data, rolesQuery.isFetching, updateParams]);

  const handleSortChange = (value: RolesSortOption) => {
    updateParams({
      sort: value === DEFAULT_ROLES_SORT ? null : value,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      page: writePageIndex(nextPage),
    });
  };

  const isInitialLoading = rolesQuery.isLoading && !rolesQuery.data;
  const roles = rolesQuery.data?.content ?? [];
  const hasSearch = debouncedSearch.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#roles-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <RolesPageSkeleton />
      ) : (
        <>
          <RolesHero
            totalElements={rolesQuery.data?.totalElements}
            onCreate={() => setFormState({ mode: "create", roleId: null })}
            canCreate={canManageRoles}
          />

          {rolesQuery.isError ? (
            <RolesErrorState
              onRetry={() => void rolesQuery.refetch()}
              isRetrying={rolesQuery.isFetching}
            />
          ) : null}

          {!rolesQuery.isError ? (
            <div id="roles-main">
              <RolesDataTable
                roles={roles}
                search={searchInput}
                sortOption={sortOption}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                page={rolesQuery.data?.page ?? 0}
                totalPages={rolesQuery.data?.totalPages ?? 0}
                totalElements={rolesQuery.data?.totalElements ?? 0}
                pageSize={rolesQuery.data?.size ?? PAGE_SIZE}
                onPageChange={handlePageChange}
                onEdit={(role) =>
                  setFormState({ mode: "edit", roleId: role.id })
                }
                onDelete={setRoleToDelete}
                canManage={canManageRoles}
                isFetching={rolesQuery.isFetching}
                emptyState={<RolesEmptyState hasSearch={hasSearch} />}
              />
            </div>
          ) : null}
        </>
      )}

      <RoleFormDialog
        mode={formState?.mode ?? "create"}
        roleId={formState?.roleId ?? null}
        open={formState !== null}
        onOpenChange={(open) => {
          if (!open) setFormState(null);
        }}
      />

      <RoleDeleteDialog
        role={roleToDelete}
        open={roleToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRoleToDelete(null);
        }}
      />
    </div>
  );
}
