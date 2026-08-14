import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import {
  CompanyUserIdentityCell,
  EmailWithVerifiedCell,
} from "@/features/users/components/company-user-cells";
import { CompanyUserStatusBadge } from "@/features/users/components/company-user-status-badge";
import {
  UserRowActionsMenu,
  type UserRowAction,
} from "@/features/users/components/user-row-actions-menu";
import { UserResendInviteButton } from "@/features/users/components/user-resend-invite-button";
import type { UsersSortOption } from "@/features/users/lib/users-list-params";
import type { CompanyUser } from "@/features/users/types";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import { UserStatus } from "@/shared/types/enums";
import { formatDate } from "@/shared/lib/formatters";

interface UsersDataTableProps {
  users: CompanyUser[];
  currentUserId?: string;
  search: string;
  sortOption: UsersSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: UsersSortOption) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowAction: (action: UserRowAction, user: CompanyUser) => void;
  resendCooldownUntil: Record<string, number>;
  onResendCooldownStart: (userId: string, until: number) => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

const SORT_OPTIONS: UsersSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
  "EMAIL_ASC",
  "EMAIL_DESC",
];

const SORT_LABEL_KEYS: Record<UsersSortOption, string> = {
  CREATED_AT_DESC: "toolbar.sort.createdDesc",
  CREATED_AT_ASC: "toolbar.sort.createdAsc",
  NAME_ASC: "toolbar.sort.nameAsc",
  NAME_DESC: "toolbar.sort.nameDesc",
  EMAIL_ASC: "toolbar.sort.emailAsc",
  EMAIL_DESC: "toolbar.sort.emailDesc",
};

export function UsersDataTable({
  users,
  currentUserId,
  search,
  sortOption,
  onSearchChange,
  onSortChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onRowAction,
  resendCooldownUntil,
  onResendCooldownStart,
  isFetching,
  emptyState,
}: UsersDataTableProps) {
  const { t } = useTranslation(["users", "common"]);
  const { hasPermission } = useMerchantPermissions();
  const canManage = hasPermission(MerchantPermission.USER_MANAGE);

  const columns = useMemo<DataTableColumn<CompanyUser>[]>(
    () => [
      {
        id: "name",
        header: t("table.name"),
        cell: (user) => <CompanyUserIdentityCell user={user} />,
      },
      {
        id: "email",
        header: t("table.email"),
        cell: (user) => (
          <EmailWithVerifiedCell
            email={user.email}
            verified={user.emailVerified}
          />
        ),
      },
      {
        id: "phone",
        header: t("table.phone"),
        cell: (user) => (
          <span dir="ltr" className="text-sm text-muted-foreground">
            {user.phone}
          </span>
        ),
      },
      {
        id: "role",
        header: t("table.role"),
        cell: (user) => (
          <span className="text-sm text-muted-foreground">{user.roleName}</span>
        ),
      },
      {
        id: "status",
        header: t("table.status"),
        cell: (user) => <CompanyUserStatusBadge status={user.status} />,
      },
      {
        id: "created",
        header: t("table.created"),
        cell: (user) => (
          <time
            dir="ltr"
            className="tabular-nums text-muted-foreground"
            dateTime={user.createdAt}
          >
            {formatDate(user.createdAt)}
          </time>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      caption={t("table.caption")}
      minWidth="920px"
      isFetching={isFetching}
      toolbar={{ title: t("toolbar.title") }}
      search={{
        id: "users-search",
        value: search,
        onChange: onSearchChange,
        placeholder: t("toolbar.searchPlaceholder"),
        label: t("common:common.search"),
      }}
      sort={{
        id: "users-sort",
        value: sortOption,
        onChange: (value) => onSortChange(value as UsersSortOption),
        label: t("toolbar.sortLabel"),
        options: SORT_OPTIONS.map((value) => ({
          value,
          label: t(SORT_LABEL_KEYS[value]),
        })),
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
          summary: ({ start, end, total }) =>
            t("pagination.summary", { start, end, total }),
          pageOf: ({ current, total }) =>
            t("pagination.pageOf", { current, total }),
          ariaLabel: t("pagination.label"),
        },
      }}
      mobile={{
        renderRow: (user) => (
          <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <CompanyUserIdentityCell user={user} />
            <EmailWithVerifiedCell
              email={user.email}
              verified={user.emailVerified}
            />
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("table.role")}</dt>
                <dd>{user.roleName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("table.status")}</dt>
                <dd>
                  <CompanyUserStatusBadge status={user.status} />
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-center gap-2">
              {canManage && user.status === UserStatus.INVITED && !user.owner ? (
                <UserResendInviteButton
                  userId={user.id}
                  cooldownUntil={resendCooldownUntil[user.id]}
                  onCooldownStart={onResendCooldownStart}
                />
              ) : null}
              <UserRowActionsMenu
                user={user}
                currentUserId={currentUserId}
                onAction={onRowAction}
              />
            </div>
          </article>
        ),
      }}
      rowActions={(user) => (
        <div className="flex items-center justify-end gap-2">
          {canManage && user.status === UserStatus.INVITED && !user.owner ? (
            <UserResendInviteButton
              userId={user.id}
              cooldownUntil={resendCooldownUntil[user.id]}
              onCooldownStart={onResendCooldownStart}
            />
          ) : null}
          <UserRowActionsMenu
            user={user}
            currentUserId={currentUserId}
            onAction={onRowAction}
          />
        </div>
      )}
      actionsColumnHeader={
        <span className="sr-only">{t("table.actions")}</span>
      }
      emptyState={emptyState}
    />
  );
}
