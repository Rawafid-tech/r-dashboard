import { useMemo, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RegionActiveFilter } from "@/features/admin/carriers/lib/regions-list-params";
import {
  formatRegionChangedAt,
  localizedName,
  secondaryName,
} from "@/features/admin/carriers/lib/region-label";
import type { CarrierRegion } from "@/features/admin/carriers/types";
import { useGovernorates } from "@/features/locations/hooks/use-governorates";
import { getGovernorateLabel } from "@/features/locations/lib/location-form-errors";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import {
  Badge,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useLocaleStore } from "@/stores/locale.store";

interface RegionsDataTableProps {
  regions: CarrierRegion[];
  search: string;
  governorateId: string;
  activeFilter: RegionActiveFilter;
  unmapped: boolean;
  onSearchChange: (value: string) => void;
  onGovernorateChange: (value: string) => void;
  onActiveFilterChange: (value: RegionActiveFilter) => void;
  onUnmappedChange: (value: boolean) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

const ACTIVE_FILTERS: RegionActiveFilter[] = ["all", "active", "retired"];

function BilingualText({
  nameEn,
  nameAr,
  locale,
  emphasize = false,
}: {
  nameEn?: string | null;
  nameAr?: string | null;
  locale: string;
  emphasize?: boolean;
}) {
  const primary = localizedName(nameEn, nameAr, locale);
  const secondary = secondaryName(nameEn, nameAr, locale);

  return (
    <div className="flex min-w-0 max-w-full flex-col items-start text-start">
      <p
        className={cn(
          "max-w-full truncate",
          emphasize ? "font-medium text-foreground" : "text-foreground",
        )}
      >
        <bdi>{primary || "—"}</bdi>
      </p>
      {secondary ? (
        <p className="max-w-full truncate text-xs text-muted-foreground">
          <bdi>{secondary}</bdi>
        </p>
      ) : null}
    </div>
  );
}

function RegionFlags({ region }: { region: CarrierRegion }) {
  const { t } = useTranslation("admin");

  return (
    <ul className="mt-2 flex flex-wrap items-center justify-start gap-1">
      <li>
        <Badge variant={region.active ? "success" : "warning"}>
          {region.active
            ? t("carriers.regions.table.active")
            : t("carriers.regions.table.retired")}
        </Badge>
      </li>
      {!region.dropOffAvailable ? (
        <li>
          <Badge variant="warning">{t("carriers.regions.table.noDropOff")}</Badge>
        </li>
      ) : null}
      {!region.pickupAvailable ? (
        <li>
          <Badge variant="muted">{t("carriers.regions.table.noPickup")}</Badge>
        </li>
      ) : null}
    </ul>
  );
}

function RegionsToolbar({
  search,
  governorateId,
  activeFilter,
  unmapped,
  onSearchChange,
  onGovernorateChange,
  onActiveFilterChange,
  onUnmappedChange,
  disabled,
}: {
  search: string;
  governorateId: string;
  activeFilter: RegionActiveFilter;
  unmapped: boolean;
  onSearchChange: (value: string) => void;
  onGovernorateChange: (value: string) => void;
  onActiveFilterChange: (value: RegionActiveFilter) => void;
  onUnmappedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation(["admin", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const governoratesQuery = useGovernorates("EG");
  const governorates = governoratesQuery.data ?? [];
  const filtersDisabled = disabled || governoratesQuery.isLoading;

  return (
    <section
      aria-label={t("carriers.regions.toolbar.title")}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
    >
      <div className="relative min-w-0">
        <Label htmlFor="carrier-regions-search" className="sr-only">
          {t("carriers.regions.toolbar.searchLabel")}
        </Label>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="carrier-regions-search"
          type="search"
          inputSize="sm"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("carriers.regions.toolbar.searchPlaceholder")}
          className="bg-background ps-9 pe-9"
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,16rem)_minmax(0,14rem)_auto] lg:items-center">
        <div className="min-w-0">
          <Label htmlFor="carrier-regions-governorate" className="sr-only">
            {t("carriers.regions.toolbar.governorateLabel")}
          </Label>
          <Select
            value={unmapped ? "__unmapped__" : governorateId || "__all__"}
            onValueChange={(value) =>
              onGovernorateChange(value === "__all__" ? "" : value)
            }
            disabled={filtersDisabled || unmapped}
          >
            <SelectTrigger
              id="carrier-regions-governorate"
              size="sm"
              className="w-full bg-background"
              aria-label={t("carriers.regions.toolbar.governorateLabel")}
            >
              <SelectValue
                placeholder={t("carriers.regions.toolbar.governorateAll")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                {t("carriers.regions.toolbar.governorateAll")}
              </SelectItem>
              {unmapped ? (
                <SelectItem value="__unmapped__">
                  {t("carriers.regions.toolbar.unmappedLabel")}
                </SelectItem>
              ) : null}
              {governorates.map((governorate) => (
                <SelectItem key={governorate.id} value={governorate.id}>
                  {getGovernorateLabel(governorate, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <Label htmlFor="carrier-regions-status" className="sr-only">
            {t("carriers.regions.toolbar.statusLabel")}
          </Label>
          <Select
            value={activeFilter}
            onValueChange={(value) =>
              onActiveFilterChange(value as RegionActiveFilter)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="carrier-regions-status"
              size="sm"
              className="w-full bg-background"
              aria-label={t("carriers.regions.toolbar.statusLabel")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVE_FILTERS.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`carriers.regions.toolbar.status.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="carrier-regions-unmapped"
            checked={unmapped}
            onCheckedChange={(checked) => onUnmappedChange(checked === true)}
            disabled={disabled}
          />
          <Label htmlFor="carrier-regions-unmapped" className="text-sm font-normal">
            {t("carriers.regions.toolbar.unmappedLabel")}
          </Label>
        </div>
      </div>

      {governoratesQuery.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {t("carriers.regions.errors.governorates")}
        </p>
      ) : null}
    </section>
  );
}

export function RegionsDataTable({
  regions,
  search,
  governorateId,
  activeFilter,
  unmapped,
  onSearchChange,
  onGovernorateChange,
  onActiveFilterChange,
  onUnmappedChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isFetching,
  emptyState,
}: RegionsDataTableProps) {
  const { t } = useTranslation(["admin", "common"]);
  const locale = useLocaleStore((state) => state.locale);
  const governoratesQuery = useGovernorates("EG");

  const governorateNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const governorate of governoratesQuery.data ?? []) {
      names.set(governorate.id, getGovernorateLabel(governorate, locale));
    }
    return names;
  }, [governoratesQuery.data, locale]);

  const columns = useMemo<DataTableColumn<CarrierRegion>[]>(
    () => [
      {
        id: "district",
        header: t("carriers.regions.table.district"),
        cell: (region) => (
          <div className="flex min-w-0 max-w-xs flex-col items-start text-start">
            <BilingualText
              nameEn={region.districtNameEn}
              nameAr={region.districtNameAr}
              locale={locale}
              emphasize
            />
            <p className="max-w-full truncate font-mono text-[11px] text-muted-foreground">
              <bdi>{region.districtId}</bdi>
            </p>
            <RegionFlags region={region} />
          </div>
        ),
        className: "align-top",
      },
      {
        id: "zone",
        header: t("carriers.regions.table.zone"),
        className: "align-top",
        cell: (region) => (
          <BilingualText
            nameEn={region.zone.nameEn}
            nameAr={region.zone.nameAr}
            locale={locale}
          />
        ),
      },
      {
        id: "city",
        header: t("carriers.regions.table.city"),
        cell: (region) => (
          <div className="flex min-w-0 flex-col items-start text-start">
            <BilingualText
              nameEn={region.city.nameEn}
              nameAr={region.city.nameAr}
              locale={locale}
            />
            {region.city.primary === false ? (
              <Badge variant="outline" className="mt-1">
                {t("carriers.regions.table.secondaryCity")}
              </Badge>
            ) : null}
          </div>
        ),
        className: "align-top",
      },
      {
        id: "governorate",
        header: t("carriers.regions.table.governorate"),
        cell: (region) => {
          if (!region.governorateId) {
            return (
              <Badge variant="warning">{t("carriers.regions.table.unmapped")}</Badge>
            );
          }

          return (
            <span className="block text-start">
              <bdi>{governorateNames.get(region.governorateId) ?? "—"}</bdi>
            </span>
          );
        },
        className: "align-top",
      },
      {
        id: "changed",
        header: t("carriers.regions.table.changed"),
        className: "align-top",
        cell: (region) =>
          region.changedAt ? (
            <time
              dateTime={region.changedAt}
              className="block text-start tabular-nums text-muted-foreground"
            >
              <bdi>{formatRegionChangedAt(region.changedAt, locale)}</bdi>
            </time>
          ) : (
            <span className="block text-start text-muted-foreground">—</span>
          ),
      },
    ],
    [governorateNames, locale, t],
  );

  return (
    <DataTable
      data={regions}
      columns={columns}
      getRowKey={(region) => region.id}
      caption={t("carriers.regions.table.caption")}
      minWidth="960px"
      isFetching={isFetching}
      toolbar={{
        render: () => (
          <RegionsToolbar
            search={search}
            governorateId={governorateId}
            activeFilter={activeFilter}
            unmapped={unmapped}
            onSearchChange={onSearchChange}
            onGovernorateChange={onGovernorateChange}
            onActiveFilterChange={onActiveFilterChange}
            onUnmappedChange={onUnmappedChange}
          />
        ),
      }}
      search={false}
      sort={false}
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
            t("carriers.regions.pagination.summary", { start, end, total }),
          pageOf: ({ current, total }) =>
            t("carriers.regions.pagination.pageOf", { current, total }),
          ariaLabel: t("carriers.regions.pagination.label"),
        },
      }}
      mobile={{
        renderRow: (region) => (
          <article className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <BilingualText
              nameEn={region.districtNameEn}
              nameAr={region.districtNameAr}
              locale={locale}
              emphasize
            />
            <p className="mt-1 max-w-full truncate text-start font-mono text-[11px] text-muted-foreground">
              <bdi>{region.districtId}</bdi>
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t("carriers.regions.table.zone")}
                </dt>
                <dd>
                  <BilingualText
                    nameEn={region.zone.nameEn}
                    nameAr={region.zone.nameAr}
                    locale={locale}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t("carriers.regions.table.city")}
                </dt>
                <dd className="flex flex-col items-start gap-2">
                  <BilingualText
                    nameEn={region.city.nameEn}
                    nameAr={region.city.nameAr}
                    locale={locale}
                  />
                  {region.city.primary === false ? (
                    <Badge variant="outline">
                      {t("carriers.regions.table.secondaryCity")}
                    </Badge>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t("carriers.regions.table.governorate")}
                </dt>
                <dd>
                  {region.governorateId
                    ? (governorateNames.get(region.governorateId) ?? "—")
                    : t("carriers.regions.table.unmapped")}
                </dd>
              </div>
              {region.changedAt ? (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("carriers.regions.table.changed")}
                  </dt>
                  <dd>
                    <time dateTime={region.changedAt} className="tabular-nums">
                      <bdi>{formatRegionChangedAt(region.changedAt, locale)}</bdi>
                    </time>
                  </dd>
                </div>
              ) : null}
            </dl>
            <RegionFlags region={region} />
          </article>
        ),
      }}
      emptyState={emptyState}
    />
  );
}
