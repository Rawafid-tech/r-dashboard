import { useMemo } from "react";
import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import {
  Button,
} from "@/shared/components/ui";
import { HandlingBadge } from "@/features/products/components/handling-badge";
import { ProductImageThumbnail } from "@/features/products/components/product-image-thumbnail";
import { ProductVariantsExpand } from "@/features/products/components/product-variants-expand";
import type { ProductRowAction } from "@/features/products/components/product-row-actions-menu";
import { ProductRowActionsMenu } from "@/features/products/components/product-row-actions-menu";
import { ProductsToolbar } from "@/features/products/components/products-toolbar";
import { formatPrice, formatWeight } from "@/features/products/lib/format-product";
import type { ProductsSortOption } from "@/features/products/lib/products-list-params";
import type { Product, ProductCategory } from "@/features/products/types";

interface ProductsDataTableProps {
  products: Product[];
  categories: ProductCategory[];
  search: string;
  sortOption: ProductsSortOption;
  handlingFilter: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ProductsSortOption) => void;
  onHandlingFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowAction: (action: ProductRowAction, product: Product) => void;
  canManage?: boolean;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

export function ProductsDataTable({
  products,
  categories,
  search,
  sortOption,
  handlingFilter,
  categoryFilter,
  onSearchChange,
  onSortChange,
  onHandlingFilterChange,
  onCategoryFilterChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onRowAction,
  canManage = false,
  isFetching,
  emptyState,
}: ProductsDataTableProps) {
  const { t } = useTranslation(["products", "common"]);
  const weightUnit = t("table.weightUnit");

  const columns = useMemo<DataTableColumn<Product>[]>(
    () => [
      {
        id: "image",
        header: t("table.image"),
        cell: (product) => (
          <ProductImageThumbnail
            imageUrl={product.imageUrl}
            name={product.name}
          />
        ),
      },
      {
        id: "name",
        header: t("table.name"),
        cell: (product) => (
          <div className="space-y-1">
            <span className="block font-medium text-foreground">
              {product.name}
            </span>
            <ProductVariantsExpand
              productName={product.name}
              variants={product.variants ?? []}
            />
          </div>
        ),
      },
      {
        id: "category",
        header: t("table.category"),
        cell: (product) => (
          <span className="text-sm text-foreground">
            {product.categoryName ?? t("table.noCategory")}
          </span>
        ),
      },
      {
        id: "sku",
        header: t("table.sku"),
        cell: (product) => (
          <span dir="ltr" className="font-mono text-sm tabular-nums">
            {product.sku}
          </span>
        ),
      },
      {
        id: "barcode",
        header: t("table.barcode"),
        cell: (product) => (
          <span dir="ltr" className="font-mono text-sm text-muted-foreground">
            {product.barcode ?? t("table.noBarcode")}
          </span>
        ),
      },
      {
        id: "price",
        header: t("table.price"),
        align: "end",
        cell: (product) => (
          <span dir="ltr" className="tabular-nums">
            {formatPrice(product.price)}
          </span>
        ),
      },
      {
        id: "weight",
        header: t("table.weight"),
        align: "end",
        cell: (product) => (
          <span dir="ltr" className="tabular-nums text-muted-foreground">
            {formatWeight(product.weightKg)} {weightUnit}
          </span>
        ),
      },
      {
        id: "handling",
        header: t("table.handling"),
        cell: (product) => <HandlingBadge handling={product.handling} />,
      },
    ],
    [t, weightUnit],
  );

  return (
    <DataTable
      data={products}
      columns={columns}
      getRowKey={(product) => product.id}
      caption={t("table.caption")}
      minWidth="960px"
      isFetching={isFetching}
      toolbar={{
        title: t("toolbar.title"),
        render: () => (
          <ProductsToolbar
            search={search}
            sortOption={sortOption}
            handlingFilter={handlingFilter}
            categoryFilter={categoryFilter}
            categories={categories}
            onSearchChange={onSearchChange}
            onSortChange={onSortChange}
            onHandlingFilterChange={onHandlingFilterChange}
            onCategoryFilterChange={onCategoryFilterChange}
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
        renderRow: (product) => (
          <article className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <ProductImageThumbnail
                imageUrl={product.imageUrl}
                name={product.name}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                <ProductVariantsExpand
                  productName={product.name}
                  variants={product.variants ?? []}
                />
                <p className="text-xs text-muted-foreground">
                  {product.categoryName ?? t("table.noCategory")}
                </p>
                <p dir="ltr" className="font-mono text-xs text-muted-foreground">
                  {product.sku}
                </p>
                <HandlingBadge handling={product.handling} />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("table.price")}</dt>
                <dd dir="ltr" className="tabular-nums">
                  {formatPrice(product.price)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("table.weight")}</dt>
                <dd dir="ltr" className="tabular-nums">
                  {formatWeight(product.weightKg)} {weightUnit}
                </dd>
              </div>
            </dl>
            {canManage ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRowAction("edit", product)}
                >
                  <Pencil aria-hidden="true" />
                  {t("table.edit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRowAction("delete", product)}
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
          ? (product) => (
              <ProductRowActionsMenu product={product} onAction={onRowAction} />
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
