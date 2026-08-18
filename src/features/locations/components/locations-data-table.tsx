import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { LocationRowActionsMenu } from "@/features/locations/components/location-row-actions-menu";
import type { LocationRowAction } from "@/features/locations/components/location-row-actions-menu";
import { LocationStatusBadge } from "@/features/locations/components/location-status-badge";
import { LocationsToolbar } from "@/features/locations/components/locations-toolbar";
import {
  getLocationGovernorateLabel,
} from "@/features/locations/lib/location-form-errors";
import type { LocationsSortOption } from "@/features/locations/lib/locations-list-params";
import type { SenderLocation } from "@/features/locations/types";
import { Badge } from "@/shared/components/ui";
import { formatDate } from "@/shared/lib/formatters";
import { useLocaleStore } from "@/stores/locale.store";

interface LocationsDataTableProps {
  locations: SenderLocation[];
  search: string;
  sortOption: LocationsSortOption;
  statusFilter: string;
  governorateFilter: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: LocationsSortOption) => void;
  onStatusFilterChange: (value: string) => void;
  onGovernorateFilterChange: (value: string) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowAction: (action: LocationRowAction, location: SenderLocation) => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

export function LocationsDataTable({
  locations,
  search,
  sortOption,
  statusFilter,
  governorateFilter,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onGovernorateFilterChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onRowAction,
  isFetching,
  emptyState,
}: LocationsDataTableProps) {
  const { t } = useTranslation(["locations", "common"]);
  const locale = useLocaleStore((state) => state.locale);

  const columns = useMemo<DataTableColumn<SenderLocation>[]>(
    () => [
      {
        id: "name",
        header: t("table.name"),
        cell: (location) => (
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{location.name}</span>
              {location.isDefault ? (
                <Badge variant="muted" className="text-[10px] uppercase">
                  {t("table.defaultBadge")}
                </Badge>
              ) : null}
            </div>
            <span className="text-xs text-muted-foreground">{location.area}</span>
          </div>
        ),
      },
      {
        id: "governorate",
        header: t("table.governorate"),
        cell: (location) => (
          <span>{getLocationGovernorateLabel(location, locale)}</span>
        ),
      },
      {
        id: "contact",
        header: t("table.contact"),
        cell: (location) => (
          <div className="flex min-w-0 flex-col gap-0.5 text-start">
            <span className="truncate font-medium leading-snug">
              {location.contactName}
            </span>
            <span
              dir="ltr"
              className="truncate self-start text-xs leading-snug text-muted-foreground tabular-nums"
            >
              {location.contactPhone}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: t("table.status"),
        cell: (location) => <LocationStatusBadge status={location.status} />,
      },
      {
        id: "created",
        header: t("table.created"),
        cell: (location) => (
          <time
            dir="ltr"
            className="tabular-nums text-muted-foreground"
            dateTime={location.createdAt}
          >
            {formatDate(location.createdAt)}
          </time>
        ),
      },
    ],
    [locale, t],
  );

  return (
    <DataTable
      data={locations}
      columns={columns}
      getRowKey={(location) => location.id}
      caption={t("table.caption")}
      minWidth="960px"
      isFetching={isFetching}
      toolbar={{
        title: t("toolbar.title"),
        render: () => (
          <LocationsToolbar
            search={search}
            sortOption={sortOption}
            statusFilter={statusFilter}
            governorateFilter={governorateFilter}
            onSearchChange={onSearchChange}
            onSortChange={onSortChange}
            onStatusFilterChange={onStatusFilterChange}
            onGovernorateFilterChange={onGovernorateFilterChange}
            disabled={isFetching}
          />
        ),
      }}
      search={false}
      sort={false}
      filters={false}
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
        renderRow: (location) => (
          <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">{location.name}</h3>
              {location.isDefault ? (
                <Badge variant="muted" className="text-[10px] uppercase">
                  {t("table.defaultBadge")}
                </Badge>
              ) : null}
            </div>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("table.governorate")}</dt>
                <dd>{getLocationGovernorateLabel(location, locale)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("table.area")}</dt>
                <dd>{location.area}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("table.contact")}</dt>
                <dd className="flex flex-col gap-0.5 text-start">
                  <span>{location.contactName}</span>
                  <span
                    dir="ltr"
                    className="self-start text-xs text-muted-foreground tabular-nums"
                  >
                    {location.contactPhone}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("table.status")}</dt>
                <dd>
                  <LocationStatusBadge status={location.status} />
                </dd>
              </div>
            </dl>
            <LocationRowActionsMenu location={location} onAction={onRowAction} />
          </article>
        ),
      }}
      rowActions={(location) => (
        <LocationRowActionsMenu location={location} onAction={onRowAction} />
      )}
      actionsColumnHeader={
        <span className="sr-only">{t("table.actions")}</span>
      }
      emptyState={emptyState}
    />
  );
}
