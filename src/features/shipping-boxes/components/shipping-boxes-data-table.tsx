import type { ReactNode } from "react";
import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import {
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { ShippingBoxRowActionsMenu } from "@/features/shipping-boxes/components/shipping-box-row-actions-menu";
import type { ShippingBoxRowAction } from "@/features/shipping-boxes/components/shipping-box-row-actions-menu";
import { formatDimension } from "@/features/shipping-boxes/lib/format-dimension";
import type { ShippingBoxesSortOption } from "@/features/shipping-boxes/lib/shipping-boxes-list-params";
import type { ShippingBox } from "@/features/shipping-boxes/types";

interface ShippingBoxesDataTableProps {
  boxes: ShippingBox[];
  search: string;
  sortOption: ShippingBoxesSortOption;
  defaultFilter: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ShippingBoxesSortOption) => void;
  onDefaultFilterChange: (value: string) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowAction: (action: ShippingBoxRowAction, box: ShippingBox) => void;
  canManage?: boolean;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

const SORT_OPTIONS: ShippingBoxesSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
  "LENGTH_CM_ASC",
  "LENGTH_CM_DESC",
  "WIDTH_CM_ASC",
  "WIDTH_CM_DESC",
  "HEIGHT_CM_ASC",
  "HEIGHT_CM_DESC",
];

const SORT_LABEL_KEYS: Record<ShippingBoxesSortOption, string> = {
  CREATED_AT_DESC: "toolbar.sort.createdDesc",
  CREATED_AT_ASC: "toolbar.sort.createdAsc",
  NAME_ASC: "toolbar.sort.nameAsc",
  NAME_DESC: "toolbar.sort.nameDesc",
  LENGTH_CM_ASC: "toolbar.sort.lengthAsc",
  LENGTH_CM_DESC: "toolbar.sort.lengthDesc",
  WIDTH_CM_ASC: "toolbar.sort.widthAsc",
  WIDTH_CM_DESC: "toolbar.sort.widthDesc",
  HEIGHT_CM_ASC: "toolbar.sort.heightAsc",
  HEIGHT_CM_DESC: "toolbar.sort.heightDesc",
};

function DimensionCell({ value, unit }: { value: number; unit: string }) {
  return (
    <span dir="ltr" className="tabular-nums text-muted-foreground">
      {formatDimension(value)} {unit}
    </span>
  );
}

export function ShippingBoxesDataTable({
  boxes,
  search,
  sortOption,
  defaultFilter,
  onSearchChange,
  onSortChange,
  onDefaultFilterChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onRowAction,
  canManage = false,
  isFetching,
  emptyState,
}: ShippingBoxesDataTableProps) {
  const { t } = useTranslation(["shippingBoxes", "common"]);
  const unit = t("table.unit");

  const columns = useMemo<DataTableColumn<ShippingBox>[]>(
    () => [
      {
        id: "name",
        header: t("table.name"),
        cell: (box) => (
          <span className="font-medium text-foreground">{box.name}</span>
        ),
      },
      {
        id: "length",
        header: t("table.length"),
        align: "end",
        cell: (box) => <DimensionCell value={box.lengthCm} unit={unit} />,
      },
      {
        id: "width",
        header: t("table.width"),
        align: "end",
        cell: (box) => <DimensionCell value={box.widthCm} unit={unit} />,
      },
      {
        id: "height",
        header: t("table.height"),
        align: "end",
        cell: (box) => <DimensionCell value={box.heightCm} unit={unit} />,
      },
      {
        id: "default",
        header: t("table.default"),
        align: "center",
        cell: (box) => (
          <Badge variant={box.isDefault ? "success" : "muted"}>
            {box.isDefault ? t("table.yes") : t("table.no")}
          </Badge>
        ),
      },
    ],
    [t, unit],
  );

  return (
    <DataTable
      data={boxes}
      columns={columns}
      getRowKey={(box) => box.id}
      caption={t("table.caption")}
      minWidth="720px"
      isFetching={isFetching}
      toolbar={{ title: t("toolbar.title") }}
      search={{
        id: "shipping-boxes-search",
        value: search,
        onChange: onSearchChange,
        placeholder: t("toolbar.searchPlaceholder"),
        label: t("common:common.search"),
        wrapperClassName: "sm:flex-none sm:w-72 lg:w-104",
        className: "w-full sm:flex-none",
      }}
      sort={{
        id: "shipping-boxes-sort",
        value: sortOption,
        onChange: (value) => onSortChange(value as ShippingBoxesSortOption),
        label: t("toolbar.sortLabel"),
        options: SORT_OPTIONS.map((value) => ({
          value,
          label: t(SORT_LABEL_KEYS[value]),
        })),
      }}
      filters={{
        containerClassName: "sm:min-w-0 sm:flex-1",
        className: "w-full sm:min-w-[12rem]",
        render: () => (
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="shipping-boxes-default-filter" className="text-xs">
              {t("toolbar.defaultLabel")}
            </Label>
            <Select
              value={defaultFilter || "__all__"}
              onValueChange={(value) =>
                onDefaultFilterChange(value === "__all__" ? "" : value)
              }
            >
              <SelectTrigger
                id="shipping-boxes-default-filter"
                className="w-full"
                aria-label={t("toolbar.defaultLabel")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("toolbar.defaultAll")}</SelectItem>
                <SelectItem value="true">{t("toolbar.defaultOnly")}</SelectItem>
                <SelectItem value="false">{t("toolbar.defaultNone")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
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
        renderRow: (box) => (
          <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">{box.name}</h3>
              <Badge variant={box.isDefault ? "success" : "muted"}>
                {box.isDefault ? t("table.yes") : t("table.no")}
              </Badge>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("table.length")}</dt>
                <dd dir="ltr" className="tabular-nums">
                  {formatDimension(box.lengthCm)} {unit}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("table.width")}</dt>
                <dd dir="ltr" className="tabular-nums">
                  {formatDimension(box.widthCm)} {unit}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("table.height")}</dt>
                <dd dir="ltr" className="tabular-nums">
                  {formatDimension(box.heightCm)} {unit}
                </dd>
              </div>
            </dl>
            {canManage ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRowAction("edit", box)}
                >
                  <Pencil aria-hidden="true" />
                  {t("table.edit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRowAction("delete", box)}
                >
                  <Trash2 aria-hidden="true" />
                  {t("table.delete")}
                </Button>
              </div>
            ) : null}
          </article>
        ),
      }}
      rowActions={
        canManage
          ? (box) => (
              <ShippingBoxRowActionsMenu box={box} onAction={onRowAction} />
            )
          : undefined
      }
      actionsColumnHeader={
        canManage ? (
          <span className="sr-only">{t("table.actions")}</span>
        ) : undefined
      }
      emptyState={emptyState}
    />
  );
}
