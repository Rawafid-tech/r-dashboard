import type { ReactNode } from "react";
import { ArrowUpDown, ChevronDown, Printer, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  ShipmentsKindFilter,
  ShipmentsSortOption,
} from "@/features/shipments/lib/list-params";
import type { CarrierConnection } from "@/features/shipping-partners/types";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import {
  Button,
  DatePicker,
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
import { useLocaleStore } from "@/stores/locale.store";

const SORT_OPTIONS: ShipmentsSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "BOOKED_AT_DESC",
  "BOOKED_AT_ASC",
];

const SORT_LABEL_KEYS: Record<ShipmentsSortOption, string> = {
  CREATED_AT_DESC: "toolbar.sort.createdDesc",
  CREATED_AT_ASC: "toolbar.sort.createdAsc",
  BOOKED_AT_DESC: "toolbar.sort.bookedDesc",
  BOOKED_AT_ASC: "toolbar.sort.bookedAsc",
};

interface ShipmentsToolbarProps {
  search: string;
  sortOption: ShipmentsSortOption;
  kindFilter?: ShipmentsKindFilter;
  showKindFilter?: boolean;
  connectionFilter: string;
  dateFrom: string;
  dateTo: string;
  connections: CarrierConnection[];
  selectedCount: number;
  canPrintBatch: boolean;
  hasActiveFilters?: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ShipmentsSortOption) => void;
  onKindFilterChange?: (value: ShipmentsKindFilter) => void;
  onConnectionFilterChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters?: () => void;
  onPrintSelected?: () => void;
  onClearSelection?: () => void;
  disabled?: boolean;
}

export function ShipmentsToolbar({
  search,
  sortOption,
  kindFilter = "all",
  showKindFilter = true,
  connectionFilter,
  dateFrom,
  dateTo,
  connections,
  selectedCount,
  canPrintBatch,
  hasActiveFilters = false,
  onSearchChange,
  onSortChange,
  onKindFilterChange,
  onConnectionFilterChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  onPrintSelected,
  onClearSelection,
  disabled,
}: ShipmentsToolbarProps) {
  const { t } = useTranslation(["shipments", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const selectedSortLabel = t(SORT_LABEL_KEYS[sortOption]);

  return (
    <section
      aria-label={t("toolbar.title")}
      className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      {selectedCount > 0 && canPrintBatch ? (
        <div
          className="flex flex-col gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-foreground">
            {t("toolbar.selectionSummary", { count: selectedCount })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onPrintSelected}
              disabled={disabled}
            >
              <Printer aria-hidden="true" />
              {t("toolbar.printLabelsCount", { count: selectedCount })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClearSelection}
              disabled={disabled}
            >
              {t("toolbar.clearSelection")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="shipments-search" className="sr-only">
            {t("common:common.search")}
          </Label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="shipments-search"
            type="search"
            value={search}
            disabled={disabled}
            placeholder={t("toolbar.searchPlaceholder")}
            className="h-9 ps-9 pe-9"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              className="absolute end-1 top-1/2 -translate-y-1/2"
              aria-label={t("toolbar.clearSearch")}
              onClick={() => onSearchChange("")}
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="shipments-sort"
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                aria-label={`${t("toolbar.sortLabel")}: ${selectedSortLabel}`}
                className="h-9 min-w-[10rem] justify-between gap-2 px-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ArrowUpDown
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate text-xs font-medium">
                    {selectedSortLabel}
                  </span>
                </span>
                <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("toolbar.sortLabel")}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortOption}
                onValueChange={(value) =>
                  onSortChange(value as ShipmentsSortOption)
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {t(SORT_LABEL_KEYS[option])}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && onClearFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9"
              disabled={disabled}
              onClick={onClearFilters}
            >
              {t("toolbar.clearFilters")}
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className={
          showKindFilter
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {showKindFilter && onKindFilterChange ? (
          <FilterField id="shipments-kind-filter" label={t("toolbar.kindLabel")}>
            <Select
              value={kindFilter}
              onValueChange={(value) =>
                onKindFilterChange(value as ShipmentsKindFilter)
              }
              disabled={disabled}
            >
              <SelectTrigger id="shipments-kind-filter" className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("toolbar.kindAll")}</SelectItem>
                <SelectItem value="DELIVERY">{t("toolbar.kindDelivery")}</SelectItem>
                <SelectItem value="RETURN_PICKUP">{t("toolbar.kindReturns")}</SelectItem>
                <SelectItem value="EXCHANGE">{t("toolbar.kindExchanges")}</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
        ) : null}

        <FilterField id="shipments-connection-filter" label={t("toolbar.connectionLabel")}>
          <Select
            value={connectionFilter || "all"}
            onValueChange={(value) =>
              onConnectionFilterChange(value === "all" ? "" : value)
            }
            disabled={disabled}
          >
            <SelectTrigger id="shipments-connection-filter" className="h-9 w-full">
              <SelectValue placeholder={t("toolbar.connectionAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("toolbar.connectionAll")}</SelectItem>
              {connections.map((connection) => (
                <SelectItem key={connection.id} value={connection.id}>
                  {connection.name} · {carrierDisplayName(connection.carrier, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField id="shipments-date-from" label={t("toolbar.dateFrom")}>
          <DatePicker
            id="shipments-date-from"
            value={dateFrom}
            disabled={disabled}
            placeholder={t("toolbar.datePlaceholder")}
            onChange={onDateFromChange}
          />
        </FilterField>

        <FilterField id="shipments-date-to" label={t("toolbar.dateTo")}>
          <DatePicker
            id="shipments-date-to"
            value={dateTo}
            disabled={disabled}
            placeholder={t("toolbar.datePlaceholder")}
            onChange={onDateToChange}
          />
        </FilterField>
      </div>
    </section>
  );
}

function FilterField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
