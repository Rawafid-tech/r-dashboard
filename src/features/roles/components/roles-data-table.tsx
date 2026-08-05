import type { ReactNode } from "react";
import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { Button } from "@/shared/components/ui";
import { formatDate } from "@/shared/lib/formatters";
import type { RolesSortOption } from "@/features/roles/lib/roles-list-params";
import type { RoleListItem } from "@/features/roles/types";

interface RolesDataTableProps {
  roles: RoleListItem[];
  search: string;
  sortOption: RolesSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: RolesSortOption) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (role: RoleListItem) => void;
  onDelete: (role: RoleListItem) => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

const SORT_OPTIONS: RolesSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
];

const SORT_LABEL_KEYS: Record<RolesSortOption, string> = {
  CREATED_AT_DESC: "toolbar.sort.createdDesc",
  CREATED_AT_ASC: "toolbar.sort.createdAsc",
  NAME_ASC: "toolbar.sort.nameAsc",
  NAME_DESC: "toolbar.sort.nameDesc",
};

export function RolesDataTable({
  roles,
  search,
  sortOption,
  onSearchChange,
  onSortChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  isFetching,
  emptyState,
}: RolesDataTableProps) {
  const { t } = useTranslation(["roles", "common"]);

  const columns = useMemo<DataTableColumn<RoleListItem>[]>(
    () => [
      {
        id: "name",
        header: t("table.name"),
        cell: (role) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{role.name}</p>
            {role.description ? (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {role.description}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "users",
        header: t("table.users"),
        align: "center",
        cell: (role) => (
          <span className="tabular-nums text-muted-foreground">
            {role.userCount}
          </span>
        ),
      },
      {
        id: "permissions",
        header: t("table.permissions"),
        align: "center",
        cell: (role) => (
          <span className="tabular-nums text-muted-foreground">
            {role.permissionCount}
          </span>
        ),
      },
      {
        id: "created",
        header: t("table.created"),
        cell: (role) => (
          <time
            dir="ltr"
            className="tabular-nums text-muted-foreground"
            dateTime={role.createdAt}
          >
            {formatDate(role.createdAt)}
          </time>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={roles}
      columns={columns}
      getRowKey={(role) => role.id}
      caption={t("table.caption")}
      minWidth="760px"
      isFetching={isFetching}
      toolbar={{ title: t("toolbar.title") }}
      search={{
        id: "roles-search",
        value: search,
        onChange: onSearchChange,
        placeholder: t("toolbar.searchPlaceholder"),
        hint: t("toolbar.searchHint"),
        label: t("common:common.search"),
      }}
      sort={{
        id: "roles-sort",
        value: sortOption,
        onChange: (value) => onSortChange(value as RolesSortOption),
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
        renderRow: (role) => (
          <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{role.name}</h3>
              {role.description ? (
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                  {role.description}
                </p>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("table.users")}</dt>
                <dd className="font-medium tabular-nums">{role.userCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("table.permissions")}</dt>
                <dd className="font-medium tabular-nums">
                  {role.permissionCount}
                </dd>
              </div>
            </dl>
            <time
              dir="ltr"
              dateTime={role.createdAt}
              className="text-xs tabular-nums text-muted-foreground"
            >
              {formatDate(role.createdAt)}
            </time>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(role)}
              >
                <Pencil aria-hidden="true" />
                {t("table.edit")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDelete(role)}
              >
                <Trash2 aria-hidden="true" />
                {t("table.delete")}
              </Button>
            </div>
          </article>
        ),
      }}
      rowActions={(role) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(role)}
            aria-label={`${t("table.edit")}: ${role.name}`}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(role)}
            aria-label={`${t("table.delete")}: ${role.name}`}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      )}
      actionsColumnHeader={
        <span className="sr-only">{t("table.actions")}</span>
      }
      emptyState={emptyState}
    />
  );
}
