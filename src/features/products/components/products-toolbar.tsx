import { ArrowUpDown, ChevronDown, Search, X } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { flattenCategoryTree } from "@/features/products/lib/category-tree-utils";
import type { ProductsSortOption } from "@/features/products/lib/products-list-params";
import {
  PRODUCT_HANDLING_VALUES,
  type ProductCategory,
} from "@/features/products/types";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";

const SORT_OPTIONS: ProductsSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
  "SKU_ASC",
  "SKU_DESC",
  "PRICE_ASC",
  "PRICE_DESC",
  "WEIGHT_KG_ASC",
  "WEIGHT_KG_DESC",
];

const SORT_LABEL_KEYS: Record<ProductsSortOption, string> = {
  CREATED_AT_DESC: "toolbar.sort.createdDesc",
  CREATED_AT_ASC: "toolbar.sort.createdAsc",
  NAME_ASC: "toolbar.sort.nameAsc",
  NAME_DESC: "toolbar.sort.nameDesc",
  SKU_ASC: "toolbar.sort.skuAsc",
  SKU_DESC: "toolbar.sort.skuDesc",
  PRICE_ASC: "toolbar.sort.priceAsc",
  PRICE_DESC: "toolbar.sort.priceDesc",
  WEIGHT_KG_ASC: "toolbar.sort.weightAsc",
  WEIGHT_KG_DESC: "toolbar.sort.weightDesc",
};

interface ProductsToolbarProps {
  search: string;
  sortOption: ProductsSortOption;
  handlingFilter: string;
  categoryFilter: string;
  categories: ProductCategory[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: ProductsSortOption) => void;
  onHandlingFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  disabled?: boolean;
}

export function ProductsToolbar({
  search,
  sortOption,
  handlingFilter,
  categoryFilter,
  categories,
  onSearchChange,
  onSortChange,
  onHandlingFilterChange,
  onCategoryFilterChange,
  disabled = false,
}: ProductsToolbarProps) {
  const { t } = useTranslation(["products", "common"]);

  const categoryOptions = useMemo(
    () => flattenCategoryTree(categories),
    [categories],
  );

  const selectedSortLabel = t(SORT_LABEL_KEYS[sortOption]);

  return (
    <section
      aria-label={t("toolbar.title")}
      className="rounded-xl border border-border/70 bg-card p-3 shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="products-search" className="sr-only">
            {t("common:common.search")}
          </Label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="products-search"
            type="search"
            inputSize="sm"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("toolbar.searchPlaceholder")}
            className="h-9 rounded-lg bg-background ps-9 pe-9"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute end-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("common:common.cancel")}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:shrink-0 lg:items-center">
          <div className="min-w-0 sm:col-span-1">
            <Label htmlFor="products-handling-filter" className="sr-only">
              {t("toolbar.handlingLabel")}
            </Label>
            <Select
              value={handlingFilter || "__all__"}
              onValueChange={(value) =>
                onHandlingFilterChange(value === "__all__" ? "" : value)
              }
              disabled={disabled}
            >
              <SelectTrigger
                id="products-handling-filter"
                size="sm"
                className="h-9 w-full rounded-lg bg-background lg:min-w-[11rem]"
                aria-label={t("toolbar.handlingLabel")}
              >
                <SelectValue placeholder={t("toolbar.handlingAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("toolbar.handlingAll")}</SelectItem>
                {PRODUCT_HANDLING_VALUES.map((handling) => (
                  <SelectItem key={handling} value={handling}>
                    {t(`handling.${handling}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 sm:col-span-1">
            <Label htmlFor="products-category-filter" className="sr-only">
              {t("toolbar.categoryLabel")}
            </Label>
            <Select
              value={categoryFilter || "__all__"}
              onValueChange={(value) =>
                onCategoryFilterChange(value === "__all__" ? "" : value)
              }
              disabled={disabled}
            >
              <SelectTrigger
                id="products-category-filter"
                size="sm"
                className="h-9 w-full rounded-lg bg-background lg:min-w-[11rem]"
                aria-label={t("toolbar.categoryLabel")}
              >
                <SelectValue placeholder={t("toolbar.categoryAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("toolbar.categoryAll")}</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.depth === 1 && option.parentName
                      ? `${option.parentName} › ${option.name}`
                      : option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 sm:col-span-1">
            <Label htmlFor="products-sort" className="sr-only">
              {t("toolbar.sortLabel")}
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="products-sort"
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  aria-label={`${t("toolbar.sortLabel")}: ${selectedSortLabel}`}
                  className="h-9 w-full justify-between rounded-lg bg-background px-3 lg:min-w-[11rem]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ArrowUpDown
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="truncate text-sm">{selectedSortLabel}</span>
                  </span>
                  <ChevronDown
                    className="size-3.5 shrink-0 text-muted-foreground opacity-70"
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t("toolbar.sortLabel")}
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={sortOption}
                  onValueChange={(value) =>
                    onSortChange(value as ProductsSortOption)
                  }
                >
                  {SORT_OPTIONS.map((value) => (
                    <DropdownMenuRadioItem key={value} value={value}>
                      {t(SORT_LABEL_KEYS[value])}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </section>
  );
}
