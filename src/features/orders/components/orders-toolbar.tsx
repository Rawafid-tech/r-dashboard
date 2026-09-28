import type { ReactNode } from "react";
import { ArrowUpDown, ChevronDown, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGovernorates } from "@/features/locations/hooks/use-governorates";
import { useSenderLocations } from "@/features/locations/hooks/use-sender-locations";
import { getGovernorateLabel } from "@/features/locations/lib/location-form-errors";
import type { OrdersSortOption } from "@/features/orders/lib/orders-list-params";
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
import { SenderLocationStatus } from "@/shared/types/enums";
import { useLocaleStore } from "@/stores/locale.store";

const SORT_OPTIONS: OrdersSortOption[] = [
  "ORDER_DATE_DESC",
  "ORDER_DATE_ASC",
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "ORDER_VALUE_DESC",
  "ORDER_VALUE_ASC",
];

const SORT_LABEL_KEYS: Record<OrdersSortOption, string> = {
  ORDER_DATE_DESC: "toolbar.sort.orderDateDesc",
  ORDER_DATE_ASC: "toolbar.sort.orderDateAsc",
  CREATED_AT_DESC: "toolbar.sort.createdDesc",
  CREATED_AT_ASC: "toolbar.sort.createdAsc",
  ORDER_VALUE_DESC: "toolbar.sort.valueDesc",
  ORDER_VALUE_ASC: "toolbar.sort.valueAsc",
};

interface OrdersToolbarProps {
  search: string;
  sortOption: OrdersSortOption;
  governorateFilter: string;
  senderLocationFilter: string;
  paymentMethodFilter: string;
  dateFrom: string;
  dateTo: string;
  minValue: string;
  maxValue: string;
  hasActiveFilters?: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: OrdersSortOption) => void;
  onGovernorateFilterChange: (value: string) => void;
  onSenderLocationFilterChange: (value: string) => void;
  onPaymentMethodFilterChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onMinValueChange: (value: string) => void;
  onMaxValueChange: (value: string) => void;
  onClearFilters?: () => void;
  disabled?: boolean;
}

export function OrdersToolbar({
  search,
  sortOption,
  governorateFilter,
  senderLocationFilter,
  paymentMethodFilter,
  dateFrom,
  dateTo,
  minValue,
  maxValue,
  hasActiveFilters = false,
  onSearchChange,
  onSortChange,
  onGovernorateFilterChange,
  onSenderLocationFilterChange,
  onPaymentMethodFilterChange,
  onDateFromChange,
  onDateToChange,
  onMinValueChange,
  onMaxValueChange,
  onClearFilters,
  disabled = false,
}: OrdersToolbarProps) {
  const { t } = useTranslation(["orders", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const governoratesQuery = useGovernorates("EG");
  const locationsQuery = useSenderLocations({
    page: 0,
    size: 100,
    status: SenderLocationStatus.ACTIVE,
  });

  const governorates = governoratesQuery.data ?? [];
  const locations = locationsQuery.data?.content ?? [];
  const selectedSortLabel = t(SORT_LABEL_KEYS[sortOption]);
  const filtersDisabled =
    disabled || governoratesQuery.isLoading || locationsQuery.isLoading;

  return (
    <section
      aria-label={t("toolbar.title")}
      className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="orders-search" className="sr-only">
            {t("common:common.search")}
          </Label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="orders-search"
            type="search"
            value={search}
            disabled={disabled}
            placeholder={t("toolbar.searchPlaceholder")}
            className="h-9 ps-9 pe-9"
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

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="orders-sort"
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                aria-label={`${t("toolbar.sortLabel")}: ${selectedSortLabel}`}
                className="h-9 gap-2"
              >
                <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="max-w-40 truncate text-xs font-medium">
                  {selectedSortLabel}
                </span>
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("toolbar.sortLabel")}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortOption}
                onValueChange={(value) => onSortChange(value as OrdersSortOption)}
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FilterField id="orders-date-from" label={t("toolbar.dateFrom")}>
          <DatePicker
            id="orders-date-from"
            value={dateFrom}
            disabled={filtersDisabled}
            placeholder={t("toolbar.datePlaceholder")}
            onChange={onDateFromChange}
          />
        </FilterField>
        <FilterField id="orders-date-to" label={t("toolbar.dateTo")}>
          <DatePicker
            id="orders-date-to"
            value={dateTo}
            disabled={filtersDisabled}
            placeholder={t("toolbar.datePlaceholder")}
            onChange={onDateToChange}
          />
        </FilterField>
        <FilterField id="orders-pickup" label={t("toolbar.pickupLocation")}>
          <Select
            value={senderLocationFilter || "all"}
            onValueChange={(value) =>
              onSenderLocationFilterChange(value === "all" ? "" : value)
            }
            disabled={filtersDisabled}
          >
            <SelectTrigger id="orders-pickup" className="h-9 w-full">
              <SelectValue placeholder={t("toolbar.allPickup")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("toolbar.allPickup")}</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField id="orders-governorate" label={t("toolbar.destination")}>
          <Select
            value={governorateFilter || "all"}
            onValueChange={(value) =>
              onGovernorateFilterChange(value === "all" ? "" : value)
            }
            disabled={filtersDisabled}
          >
            <SelectTrigger id="orders-governorate" className="h-9 w-full">
              <SelectValue placeholder={t("toolbar.allDestinations")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("toolbar.allDestinations")}</SelectItem>
              {governorates.map((governorate) => (
                <SelectItem key={governorate.id} value={governorate.id}>
                  {getGovernorateLabel(governorate, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField id="orders-payment" label={t("toolbar.paymentMethod")}>
          <Select
            value={paymentMethodFilter || "all"}
            onValueChange={(value) =>
              onPaymentMethodFilterChange(value === "all" ? "" : value)
            }
            disabled={filtersDisabled}
          >
            <SelectTrigger id="orders-payment" className="h-9 w-full">
              <SelectValue placeholder={t("toolbar.allPayments")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("toolbar.allPayments")}</SelectItem>
              <SelectItem value="COD">{t("payment.COD")}</SelectItem>
              <SelectItem value="PREPAID">{t("payment.PREPAID")}</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField id="orders-min-value" label={t("toolbar.minValue")}>
          <Input
            id="orders-min-value"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={minValue}
            disabled={filtersDisabled}
            placeholder={t("toolbar.valuePlaceholder")}
            className="h-9"
            onChange={(event) => onMinValueChange(event.target.value)}
          />
        </FilterField>
        <FilterField id="orders-max-value" label={t("toolbar.maxValue")}>
          <Input
            id="orders-max-value"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={maxValue}
            disabled={filtersDisabled}
            placeholder={t("toolbar.valuePlaceholder")}
            className="h-9"
            onChange={(event) => onMaxValueChange(event.target.value)}
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
