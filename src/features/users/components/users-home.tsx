import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useMe } from "@/features/account/hooks/use-me";
import { UserDeleteDialog } from "@/features/users/components/user-delete-dialog";
import { UserEditDialog } from "@/features/users/components/user-edit-dialog";
import { UserInviteDialog } from "@/features/users/components/user-invite-dialog";
import { UserRevealLinkDialog } from "@/features/users/components/user-reveal-link-dialog";
import { UserRoleDialog } from "@/features/users/components/user-role-dialog";
import { UserSetPasswordDialog } from "@/features/users/components/user-set-password-dialog";
import {
  UserStatusConfirmDialog,
  type StatusConfirmMode,
} from "@/features/users/components/user-status-confirm-dialog";
import {
  type UserRowAction,
} from "@/features/users/components/user-row-actions-menu";
import { UsersDataTable } from "@/features/users/components/users-data-table";
import { UsersEmptyState } from "@/features/users/components/users-empty-state";
import { UsersErrorState } from "@/features/users/components/users-error-state";
import { UsersHero } from "@/features/users/components/users-hero";
import { UsersPageSkeleton } from "@/features/users/components/users-page-skeleton";
import { useCompanyUsers } from "@/features/users/hooks/use-company-users";
import {
  DEFAULT_USERS_SORT,
  parseUsersSortOption,
  readUsersSortOption,
  type UsersSortOption,
} from "@/features/users/lib/users-list-params";
import type { CompanyUser } from "@/features/users/types";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { MerchantPermission } from "@/shared/hooks/use-merchant-permissions";
import { useMerchantPermissions } from "@/shared/hooks/use-merchant-permissions";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";

const PAGE_SIZE = 20;

export function UsersHome() {
  const { t } = useTranslation("users");
  const meQuery = useMe();
  const { hasPermission } = useMerchantPermissions();
  const canManage = hasPermission(MerchantPermission.USER_MANAGE);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<CompanyUser | null>(null);
  const [roleUser, setRoleUser] = useState<CompanyUser | null>(null);
  const [revealUser, setRevealUser] = useState<CompanyUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<CompanyUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<CompanyUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    user: CompanyUser;
    mode: StatusConfirmMode;
  } | null>(null);
  const [resendCooldownUntil, setResendCooldownUntil] = useState<
    Record<string, number>
  >({});

  const debouncedSearch = useDebounce(searchInput.trim(), 300);
  const page = readPageIndex(searchParams.get("page"));
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

  const usersQuery = useCompanyUsers(queryParams);

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

  useEffect(() => {
    const data = usersQuery.data;
    if (!data || usersQuery.isFetching) return;

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
  }, [usersQuery.data, usersQuery.isFetching, updateParams]);

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
      page: writePageIndex(nextPage),
    });
  };

  const handleRowAction = (action: UserRowAction, user: CompanyUser) => {
    switch (action) {
      case "edit":
        setEditUser(user);
        break;
      case "role":
        setRoleUser(user);
        break;
      case "activate":
        setStatusTarget({ user, mode: "activate" });
        break;
      case "deactivate":
        setStatusTarget({ user, mode: "deactivate" });
        break;
      case "reveal":
        setRevealUser(user);
        break;
      case "setPassword":
        setPasswordUser(user);
        break;
      case "delete":
        setDeleteUser(user);
        break;
      default:
        break;
    }
  };

  const handleResendCooldownStart = (userId: string, until: number) => {
    setResendCooldownUntil((current) => ({ ...current, [userId]: until }));
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
        {t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <UsersPageSkeleton />
      ) : (
        <>
          <UsersHero
            totalElements={usersQuery.data?.totalElements}
            onInvite={() => setInviteOpen(true)}
            canInvite={canManage}
          />

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
                currentUserId={meQuery.data?.id}
                search={searchInput}
                sortOption={sortOption}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                page={usersQuery.data?.page ?? 0}
                totalPages={usersQuery.data?.totalPages ?? 0}
                totalElements={usersQuery.data?.totalElements ?? 0}
                pageSize={usersQuery.data?.size ?? PAGE_SIZE}
                onPageChange={handlePageChange}
                onRowAction={handleRowAction}
                resendCooldownUntil={resendCooldownUntil}
                onResendCooldownStart={handleResendCooldownStart}
                isFetching={usersQuery.isFetching}
                emptyState={<UsersEmptyState hasSearch={hasSearch} />}
              />
            </div>
          ) : null}
        </>
      )}

      <UserInviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <UserEditDialog
        user={editUser}
        open={editUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
      />

      <UserRoleDialog
        user={roleUser}
        open={roleUser !== null}
        onOpenChange={(open) => {
          if (!open) setRoleUser(null);
        }}
      />

      <UserRevealLinkDialog
        user={revealUser}
        open={revealUser !== null}
        onOpenChange={(open) => {
          if (!open) setRevealUser(null);
        }}
      />

      <UserSetPasswordDialog
        user={passwordUser}
        open={passwordUser !== null}
        onOpenChange={(open) => {
          if (!open) setPasswordUser(null);
        }}
      />

      <UserDeleteDialog
        user={deleteUser}
        open={deleteUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
      />

      <UserStatusConfirmDialog
        user={statusTarget?.user ?? null}
        mode={statusTarget?.mode ?? null}
        open={statusTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
      />
    </div>
  );
}
