import type { ReactNode } from "react";
import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { ShippingBoxRowActionsMenu } from "@/features/shipping-boxes/components/shipping-box-row-actions-menu";
import type { ShippingBoxRowAction } from "@/features/shipping-boxes/components/shipping-box-row-actions-menu";
import { ShippingBoxesToolbar } from "@/features/shipping-boxes/components/shipping-boxes-toolbar";
import { formatDimension } from "@/features/shipping-boxes/lib/format-dimension";
import type { ShippingBoxesSortOption } from "@/features/shipping-boxes/lib/shipping-boxes-list-params";
import type { ShippingBox } from "@/features/shipping-boxes/types";
import {
  Badge,
  Button,
} from "@/shared/components/ui";

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
      toolbar={{
        title: t("toolbar.title"),
        render: () => (
          <ShippingBoxesToolbar
            search={search}
            sortOption={sortOption}
            defaultFilter={defaultFilter}
            onSearchChange={onSearchChange}
            onSortChange={onSortChange}
            onDefaultFilterChange={onDefaultFilterChange}
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
