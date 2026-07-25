import type { ReactNode } from "react";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { formatDate } from "@/shared/lib/formatters";
import {
  UserIdentityCell,
  UserStatusStack,
} from "@/features/admin/users/components/user-badges";
import type { UsersSortOption } from "@/features/admin/users/lib/users-list-params";
import type { AdminUser } from "@/features/admin/users/types";

interface UsersDataTableProps {
  users: AdminUser[];
  search: string;
  sortOption: UsersSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: UsersSortOption) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
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
  CREATED_AT_DESC: "users.toolbar.sort.createdDesc",
  CREATED_AT_ASC: "users.toolbar.sort.createdAsc",
  NAME_ASC: "users.toolbar.sort.nameAsc",
  NAME_DESC: "users.toolbar.sort.nameDesc",
  EMAIL_ASC: "users.toolbar.sort.emailAsc",
  EMAIL_DESC: "users.toolbar.sort.emailDesc",
};

export function UsersDataTable({
  users,
  search,
  sortOption,
  onSearchChange,
  onSortChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isFetching,
  emptyState,
}: UsersDataTableProps) {
  const { t } = useTranslation(["admin", "common"]);

  const columns = useMemo<DataTableColumn<AdminUser>[]>(
    () => [
      {
        id: "user",
        header: t("users.table.user"),
        cell: (user) => <UserIdentityCell user={user} />,
      },
      {
        id: "email",
        header: t("users.table.email"),
        cell: (user) => (
          <span
            dir="ltr"
            className="block max-w-[220px] truncate text-sm text-muted-foreground sm:max-w-xs"
            title={user.email}
          >
            {user.email}
          </span>
        ),
      },
      {
        id: "phone",
        header: t("users.table.phone"),
        cell: (user) => (
          <span dir="ltr" className="text-sm text-muted-foreground">
            {user.phone}
          </span>
        ),
      },
      {
        id: "status",
        header: t("users.table.status"),
        cell: (user) => <UserStatusStack user={user} />,
      },
      {
        id: "registered",
        header: t("users.table.registered"),
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
      caption={t("users.table.caption")}
      minWidth="920px"
      isFetching={isFetching}
      toolbar={{ title: t("users.toolbar.title") }}
      search={{
        id: "users-search",
        value: search,
        onChange: onSearchChange,
        placeholder: t("users.toolbar.searchPlaceholder"),
        hint: t("users.toolbar.searchHint"),
        label: t("common:common.search"),
      }}
      sort={{
        id: "users-sort",
        value: sortOption,
        onChange: (value) => onSortChange(value as UsersSortOption),
        label: t("users.toolbar.sortLabel"),
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
            t("users.pagination.summary", { start, end, total }),
          pageOf: ({ current, total }) =>
            t("users.pagination.pageOf", { current, total }),
          ariaLabel: t("users.pagination.label"),
        },
      }}
      mobile={{
        renderRow: (user) => (
          <Link
            to={`/admin/users/${user.id}`}
            className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserIdentityCell user={user} />
            <p dir="ltr" className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <UserStatusStack user={user} />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span dir="ltr">{user.phone}</span>
              <span aria-hidden="true">·</span>
              <time dir="ltr" dateTime={user.createdAt} className="tabular-nums">
                {formatDate(user.createdAt)}
              </time>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              {t("users.table.viewUser")}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        ),
      }}
      rowActions={(user) => (
        <Link
          to={`/admin/users/${user.id}`}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("users.table.view")}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      )}
      actionsColumnHeader={
        <span className="sr-only">{t("users.table.actions")}</span>
      }
      emptyState={emptyState}
    />
  );
}
