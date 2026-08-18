import { ArrowUpDown, ChevronDown, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShippingBoxesSortOption } from "@/features/shipping-boxes/lib/shipping-boxes-list-params";
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

interface ShippingBoxesToolbarProps {
  search: string;
  sortOption: ShippingBoxesSortOption;
  defaultFilter: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ShippingBoxesSortOption) => void;
  onDefaultFilterChange: (value: string) => void;
  disabled?: boolean;
}

export function ShippingBoxesToolbar({
  search,
  sortOption,
  defaultFilter,
  onSearchChange,
  onSortChange,
  onDefaultFilterChange,
  disabled = false,
}: ShippingBoxesToolbarProps) {
  const { t } = useTranslation(["shippingBoxes", "common"]);
  const selectedSortLabel = t(SORT_LABEL_KEYS[sortOption]);

  return (
    <section
      aria-label={t("toolbar.title")}
      className="rounded-xl border border-border/70 bg-card p-3 shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="shipping-boxes-search" className="sr-only">
            {t("common:common.search")}
          </Label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="shipping-boxes-search"
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:shrink-0 lg:items-center">
          <div className="min-w-0">
            <Label htmlFor="shipping-boxes-default-filter" className="sr-only">
              {t("toolbar.defaultLabel")}
            </Label>
            <Select
              value={defaultFilter || "__all__"}
              onValueChange={(value) =>
                onDefaultFilterChange(value === "__all__" ? "" : value)
              }
              disabled={disabled}
            >
              <SelectTrigger
                id="shipping-boxes-default-filter"
                size="sm"
                className="h-9 w-full rounded-lg bg-background lg:min-w-[11rem]"
                aria-label={t("toolbar.defaultLabel")}
              >
                <SelectValue placeholder={t("toolbar.defaultAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("toolbar.defaultAll")}</SelectItem>
                <SelectItem value="true">{t("toolbar.defaultOnly")}</SelectItem>
                <SelectItem value="false">{t("toolbar.defaultNone")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0">
            <Label htmlFor="shipping-boxes-sort" className="sr-only">
              {t("toolbar.sortLabel")}
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="shipping-boxes-sort"
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
                    onSortChange(value as ShippingBoxesSortOption)
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
