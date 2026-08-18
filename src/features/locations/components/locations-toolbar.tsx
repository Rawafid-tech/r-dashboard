import { ArrowUpDown, ChevronDown, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGovernorates } from "@/features/locations/hooks/use-governorates";
import { getGovernorateLabel } from "@/features/locations/lib/location-form-errors";
import type { LocationsSortOption } from "@/features/locations/lib/locations-list-params";
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
import { SenderLocationStatus } from "@/shared/types/enums";
import { useLocaleStore } from "@/stores/locale.store";

const SORT_OPTIONS: LocationsSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
];

const SORT_LABEL_KEYS: Record<LocationsSortOption, string> = {
  CREATED_AT_DESC: "toolbar.sort.createdDesc",
  CREATED_AT_ASC: "toolbar.sort.createdAsc",
  NAME_ASC: "toolbar.sort.nameAsc",
  NAME_DESC: "toolbar.sort.nameDesc",
};

interface LocationsToolbarProps {
  search: string;
  sortOption: LocationsSortOption;
  statusFilter: string;
  governorateFilter: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: LocationsSortOption) => void;
  onStatusFilterChange: (value: string) => void;
  onGovernorateFilterChange: (value: string) => void;
  disabled?: boolean;
}

export function LocationsToolbar({
  search,
  sortOption,
  statusFilter,
  governorateFilter,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onGovernorateFilterChange,
  disabled = false,
}: LocationsToolbarProps) {
  const { t } = useTranslation(["locations", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const governoratesQuery = useGovernorates("EG");
  const governorates = governoratesQuery.data ?? [];
  const selectedSortLabel = t(SORT_LABEL_KEYS[sortOption]);
  const filtersDisabled = disabled || governoratesQuery.isLoading;

  return (
    <section
      aria-label={t("toolbar.title")}
      className="rounded-xl border border-border/70 bg-card p-3 shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="locations-search" className="sr-only">
            {t("common:common.search")}
          </Label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="locations-search"
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
          <div className="min-w-0">
            <Label htmlFor="locations-status-filter" className="sr-only">
              {t("toolbar.statusLabel")}
            </Label>
            <Select
              value={statusFilter || "__all__"}
              onValueChange={(value) =>
                onStatusFilterChange(value === "__all__" ? "" : value)
              }
              disabled={filtersDisabled}
            >
              <SelectTrigger
                id="locations-status-filter"
                size="sm"
                className="h-9 w-full rounded-lg bg-background lg:min-w-[11rem]"
                aria-label={t("toolbar.statusLabel")}
              >
                <SelectValue placeholder={t("toolbar.statusAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("toolbar.statusAll")}</SelectItem>
                <SelectItem value={SenderLocationStatus.ACTIVE}>
                  {t("status.ACTIVE")}
                </SelectItem>
                <SelectItem value={SenderLocationStatus.INACTIVE}>
                  {t("status.INACTIVE")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0">
            <Label htmlFor="locations-governorate-filter" className="sr-only">
              {t("toolbar.governorateLabel")}
            </Label>
            <Select
              value={governorateFilter || "__all__"}
              onValueChange={(value) =>
                onGovernorateFilterChange(value === "__all__" ? "" : value)
              }
              disabled={filtersDisabled}
            >
              <SelectTrigger
                id="locations-governorate-filter"
                size="sm"
                className="h-9 w-full rounded-lg bg-background lg:min-w-[11rem]"
                aria-label={t("toolbar.governorateLabel")}
              >
                <SelectValue placeholder={t("toolbar.governorateAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("toolbar.governorateAll")}</SelectItem>
                {governorates.map((governorate) => (
                  <SelectItem key={governorate.id} value={governorate.id}>
                    {getGovernorateLabel(governorate, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0">
            <Label htmlFor="locations-sort" className="sr-only">
              {t("toolbar.sortLabel")}
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="locations-sort"
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
                    onSortChange(value as LocationsSortOption)
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
