import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { CategoryRowAction } from "@/features/products/components/category-row-actions-menu";
import { CategoriesTab } from "@/features/products/components/categories-tab";
import { BarcodeLookupDialog } from "@/features/products/components/barcode-lookup-dialog";
import { CategoryDeleteDialog } from "@/features/products/components/category-delete-dialog";
import { CategoryFormDialog } from "@/features/products/components/category-form-dialog";
import { ProductDeleteDialog } from "@/features/products/components/product-delete-dialog";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import type { ProductRowAction } from "@/features/products/components/product-row-actions-menu";
import { ProductsDataTable } from "@/features/products/components/products-data-table";
import { ProductsEmptyState } from "@/features/products/components/products-empty-state";
import { ProductsErrorState } from "@/features/products/components/products-error-state";
import { ImportTab } from "@/features/products/components/import-tab";
import { ProductsHero } from "@/features/products/components/products-hero";
import { ProductsPageSkeleton } from "@/features/products/components/products-page-skeleton";
import { useExportProductCatalog } from "@/features/products/hooks/use-export-product-catalog";
import { useProductCategories } from "@/features/products/hooks/use-product-categories";
import { useProducts } from "@/features/products/hooks/use-products";
import {
  DEFAULT_PRODUCTS_SORT,
  parseProductsSortOption,
  readHandlingFilter,
  readProductsSortOption,
  readProductsTab,
  type ProductsSortOption,
} from "@/features/products/lib/products-list-params";
import type { Product, ProductCategory, ProductsTab } from "@/features/products/types";
import { useListSearchParam } from "@/shared/hooks/use-list-search-param";
import {
  MerchantPermission,
  useMerchantPermissions,
} from "@/shared/hooks/use-merchant-permissions";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";

const PAGE_SIZE = 20;

type ProductFormState =
  | { mode: "create"; product: null; createDefaults?: { barcode?: string } }
  | { mode: "edit"; product: Product }
  | null;

type CategoryFormState =
  | { mode: "create"; category: null }
  | { mode: "edit"; category: ProductCategory }
  | null;

export function ProductsHome() {
  const { t } = useTranslation("products");
  const { hasPermission, isLoading: isPermissionsLoading } =
    useMerchantPermissions();
  const canManage = hasPermission(MerchantPermission.PRODUCT_MANAGE);
  const { exportCatalog, isExporting: isExportingCatalog } =
    useExportProductCatalog();

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
  const [productFormState, setProductFormState] =
    useState<ProductFormState>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryFormState, setCategoryFormState] =
    useState<CategoryFormState>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<ProductCategory | null>(null);
  const [barcodeLookupOpen, setBarcodeLookupOpen] = useState(false);

  const activeTab = readProductsTab(searchParams.get("tab"));
  const page = readPageIndex(searchParams.get("page"));
  const sortOption = readProductsSortOption(searchParams.get("sort"));
  const { sort, direction } = parseProductsSortOption(sortOption);
  const handlingFilter = searchParams.get("handling") ?? "";
  const categoryFilter = searchParams.get("categoryId") ?? "";
  const parsedHandling = readHandlingFilter(handlingFilter || null);

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      direction,
      search: debouncedSearch || undefined,
      handling: parsedHandling,
      categoryId: categoryFilter || undefined,
    }),
    [page, sort, direction, debouncedSearch, parsedHandling, categoryFilter],
  );

  const productsQuery = useProducts(queryParams, {
    enabled: activeTab === "products",
  });
  const categoriesQuery = useProductCategories();

  useEffect(() => {
    const data = productsQuery.data;
    if (!data || productsQuery.isFetching || activeTab !== "products") return;

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
  }, [productsQuery.data, productsQuery.isFetching, activeTab, updateParams]);

  const handleTabChange = (tab: ProductsTab) => {
    updateParams({
      tab: tab === "products" ? null : tab,
      page: null,
    });
  };

  useEffect(() => {
    if (isPermissionsLoading) return;
    if (activeTab === "import" && !canManage) {
      updateParams({ tab: null });
    }
  }, [activeTab, canManage, isPermissionsLoading, updateParams]);

  const handleSortChange = (value: ProductsSortOption) => {
    updateParams({
      sort: value === DEFAULT_PRODUCTS_SORT ? null : value,
      page: null,
    });
  };

  const handleHandlingFilterChange = (value: string) => {
    updateParams({
      handling: value || null,
      page: null,
    });
  };

  const handleCategoryFilterChange = (value: string) => {
    updateParams({
      categoryId: value || null,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({
      page: writePageIndex(nextPage),
    });
  };

  const handleProductRowAction = (
    action: ProductRowAction,
    product: Product,
  ) => {
    switch (action) {
      case "edit":
        setProductFormState({ mode: "edit", product });
        break;
      case "delete":
        setProductToDelete(product);
        break;
      default:
        break;
    }
  };

  const handleCategoryRowAction = (
    action: CategoryRowAction,
    category: ProductCategory,
  ) => {
    switch (action) {
      case "edit":
        setCategoryFormState({ mode: "edit", category });
        break;
      case "delete":
        setCategoryToDelete(category);
        break;
      default:
        break;
    }
  };

  const isInitialLoading =
    activeTab === "products" && productsQuery.isLoading && !productsQuery.data;
  const products = productsQuery.data?.content ?? [];
  const categories = categoriesQuery.data ?? [];
  const hasSearch = debouncedSearch.length > 0;
  const hasFilters = Boolean(handlingFilter || categoryFilter);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#products-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <ProductsPageSkeleton />
      ) : (
        <>
          <ProductsHero
            totalElements={productsQuery.data?.totalElements}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAddProduct={() =>
              setProductFormState({ mode: "create", product: null })
            }
            onAddCategory={() =>
              setCategoryFormState({ mode: "create", category: null })
            }
            onExportCatalog={
              canManage ? () => void exportCatalog() : undefined
            }
            isExportingCatalog={isExportingCatalog}
            canManage={canManage}
          />

          <div
            id="products-main"
            role="tabpanel"
            aria-labelledby={`products-tab-${activeTab}`}
          >
            {activeTab === "products" ? (
              <>
                {productsQuery.isError ? (
                  <ProductsErrorState
                    onRetry={() => void productsQuery.refetch()}
                    isRetrying={productsQuery.isFetching}
                  />
                ) : null}

                {!productsQuery.isError ? (
                  <ProductsDataTable
                    products={products}
                    categories={categories}
                    search={searchInput}
                    sortOption={sortOption}
                    handlingFilter={handlingFilter}
                    categoryFilter={categoryFilter}
                    onSearchChange={handleSearchChange}
                    onSortChange={handleSortChange}
                    onHandlingFilterChange={handleHandlingFilterChange}
                    onCategoryFilterChange={handleCategoryFilterChange}
                    page={productsQuery.data?.page ?? 0}
                    totalPages={productsQuery.data?.totalPages ?? 0}
                    totalElements={productsQuery.data?.totalElements ?? 0}
                    pageSize={productsQuery.data?.size ?? PAGE_SIZE}
                    onPageChange={handlePageChange}
                    onRowAction={handleProductRowAction}
                    onBarcodeLookup={() => setBarcodeLookupOpen(true)}
                    canManage={canManage}
                    isFetching={productsQuery.isFetching}
                    emptyState={
                      <ProductsEmptyState
                        hasSearch={hasSearch}
                        hasFilters={hasFilters}
                      />
                    }
                  />
                ) : null}
              </>
            ) : null}

            {activeTab === "categories" ? (
              <>
                {categoriesQuery.isError ? (
                  <ProductsErrorState
                    onRetry={() => void categoriesQuery.refetch()}
                    isRetrying={categoriesQuery.isFetching}
                  />
                ) : (
                  <CategoriesTab
                    categories={categories}
                    canManage={canManage}
                    onAction={handleCategoryRowAction}
                  />
                )}
              </>
            ) : null}

            {activeTab === "import" && canManage ? (
              <ImportTab onGoToProducts={() => handleTabChange("products")} />
            ) : null}
          </div>
        </>
      )}

      <ProductFormDialog
        mode={productFormState?.mode ?? "create"}
        product={productFormState?.product ?? null}
        createDefaults={
          productFormState?.mode === "create"
            ? productFormState.createDefaults
            : undefined
        }
        open={productFormState !== null}
        onOpenChange={(open) => {
          if (!open) setProductFormState(null);
        }}
      />

      <BarcodeLookupDialog
        open={barcodeLookupOpen}
        onOpenChange={setBarcodeLookupOpen}
        canManage={canManage}
        onEditProduct={(product) =>
          setProductFormState({ mode: "edit", product })
        }
        onCreateProduct={(defaults) =>
          setProductFormState({ mode: "create", product: null, createDefaults: defaults })
        }
      />

      <ProductDeleteDialog
        product={productToDelete}
        open={productToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
      />

      <CategoryFormDialog
        mode={categoryFormState?.mode ?? "create"}
        category={categoryFormState?.category ?? null}
        categories={categories}
        open={categoryFormState !== null}
        onOpenChange={(open) => {
          if (!open) setCategoryFormState(null);
        }}
      />

      <CategoryDeleteDialog
        category={categoryToDelete}
        open={categoryToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
