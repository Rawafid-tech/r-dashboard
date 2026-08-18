import type { ReactNode } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
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
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

export type DataTableAlign = "start" | "center" | "end";

const ALIGN_CLASSNAME: Record<DataTableAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: DataTableAlign;
  className?: string;
  headerClassName?: string;
}

export interface DataTableSearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  render?: (config: DataTableSearchConfig) => ReactNode;
}

export interface DataTableSortOption {
  value: string;
  label: string;
}

export interface DataTableSortConfig {
  value: string;
  onChange: (value: string) => void;
  options: DataTableSortOption[];
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  render?: (config: DataTableSortConfig) => ReactNode;
}

export interface DataTableFiltersConfig {
  render: () => ReactNode;
  className?: string;
  containerClassName?: string;
}

export interface DataTablePaginationLabels {
  previous?: string;
  next?: string;
  summary?: (params: {
    start: number;
    end: number;
    total: number;
  }) => string;
  pageOf?: (params: { current: number; total: number }) => string;
  ariaLabel?: string;
}

export interface DataTablePaginationConfig {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  labels?: DataTablePaginationLabels;
  className?: string;
  render?: (config: DataTablePaginationConfig) => ReactNode;
}

export interface DataTableToolbarConfig {
  title?: string;
  className?: string;
  render?: () => ReactNode;
}

export interface DataTableMobileConfig<T> {
  renderRow: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  caption?: string;
  minWidth?: string;
  className?: string;
  tableClassName?: string;
  isFetching?: boolean;
  toolbar?: DataTableToolbarConfig | false;
  search?: DataTableSearchConfig | false;
  sort?: DataTableSortConfig | false;
  filters?: DataTableFiltersConfig | false;
  pagination?: DataTablePaginationConfig | false;
  mobile?: DataTableMobileConfig<T> | false;
  rowActions?: (row: T) => ReactNode;
  actionsColumnHeader?: ReactNode;
  emptyState?: ReactNode;
}

function DefaultSearchField({
  value,
  onChange,
  placeholder,
  label,
  id = "data-table-search",
  disabled,
  className,
}: DataTableSearchConfig) {
  const { t } = useTranslation("common");
  const resolvedLabel = label ?? t("common.search");

  return (
    <div className={cn("min-w-0 w-full flex-1", className)}>
      <Label htmlFor={id} className="sr-only">
        {resolvedLabel}
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          type="search"
          inputSize="sm"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ?? resolvedLabel}
          className={cn(
            "rounded-md bg-background ps-9",
            value ? "pe-9" : "pe-3",
          )}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute end-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("common.cancel")}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DefaultSortField({
  value,
  onChange,
  options,
  label,
  id = "data-table-sort",
  disabled,
  className,
}: DataTableSortConfig) {
  const { t } = useTranslation("common");
  const resolvedLabel = label ?? t("common.filter");
  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel = selectedOption?.label ?? resolvedLabel;

  return (
    <div className={cn("shrink-0", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            aria-label={`${resolvedLabel}: ${selectedLabel}`}
            className="h-auto min-h-8 gap-2 rounded-md bg-background py-1.5 ps-2.5 pe-2 hover:bg-muted/50"
          >
            <ArrowUpDown
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="flex min-w-0 flex-col items-start gap-0.5 text-start">
              <span className="text-[10px] leading-none font-medium text-muted-foreground">
                {resolvedLabel}
              </span>
              <span className="max-w-[7.5rem] truncate text-xs leading-tight font-medium text-foreground sm:max-w-[9.5rem]">
                {selectedLabel}
              </span>
            </span>
            <ChevronDown
              className="size-3.5 shrink-0 text-muted-foreground opacity-70"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {resolvedLabel}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="text-sm"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DefaultPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isFetching = false,
  labels,
  className,
}: DataTablePaginationConfig) {
  const { t } = useTranslation("common");

  if (totalElements <= 0) return null;

  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);
  const summary =
    labels?.summary?.({ start, end, total: totalElements }) ??
    `${start}–${end} / ${totalElements}`;
  const pageOf =
    labels?.pageOf?.({ current: page + 1, total: totalPages }) ??
    `${page + 1} / ${totalPages}`;
  const showNavigation = totalPages > 1;

  return (
    <nav
      aria-label={labels?.ariaLabel ?? t("common.actions")}
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center",
        showNavigation ? "sm:justify-between" : "sm:justify-start",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground" dir="ltr">
        <span className="tabular-nums">{summary}</span>
      </p>
      {showNavigation ? (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 0 || isFetching}
            onClick={() => onPageChange(page - 1)}
            aria-label={labels?.previous ?? t("common.previous")}
            className="rounded-md"
          >
            <ChevronLeft aria-hidden="true" />
            <span className="hidden sm:inline">
              {labels?.previous ?? t("common.previous")}
            </span>
          </Button>
          <span
            className="min-w-16 text-center text-sm font-medium tabular-nums text-foreground"
            dir="ltr"
          >
            {pageOf}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || isFetching}
            onClick={() => onPageChange(page + 1)}
            aria-label={labels?.next ?? t("common.next")}
            className="rounded-md"
          >
            <span className="hidden sm:inline">
              {labels?.next ?? t("common.next")}
            </span>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </nav>
  );
}

function DataTableToolbar<T>({
  toolbar,
  search,
  sort,
  filters,
}: Pick<DataTableProps<T>, "toolbar" | "search" | "sort" | "filters">) {
  const toolbarConfig = toolbar === false ? undefined : toolbar;
  const showToolbar =
    search !== false ||
    sort !== false ||
    filters !== false ||
    Boolean(toolbarConfig?.render || toolbarConfig?.title);

  if (!showToolbar) return null;

  if (toolbarConfig?.render) {
    return <>{toolbarConfig.render()}</>;
  }

  const toolbarTitle = toolbarConfig?.title;
  const hasSearch = search !== false && Boolean(search);
  const hasFilters = filters !== false && Boolean(filters);
  const hasSort = sort !== false && Boolean(sort);
  const hasEndControls = hasFilters || hasSort;

  return (
    <section
      aria-labelledby={toolbarTitle ? "data-table-toolbar-title" : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:gap-0",
        toolbarConfig?.className,
      )}
    >
      {toolbarTitle ? (
        <h2 id="data-table-toolbar-title" className="sr-only">
          {toolbarTitle}
        </h2>
      ) : null}

      {hasSearch && search ? (
        <div
          className={cn("min-w-0 sm:flex-1 sm:pe-3", search.wrapperClassName)}
        >
          {search.render ? search.render(search) : <DefaultSearchField {...search} />}
        </div>
      ) : null}

      {hasEndControls ? (
        <>
          {hasSearch ? (
            <div
              className="hidden h-8 w-px shrink-0 bg-border/80 sm:block"
              aria-hidden="true"
            />
          ) : null}

          <div
            className={cn(
              "flex items-center justify-end gap-2 sm:ps-3",
              hasFilters && filters?.containerClassName
                ? filters.containerClassName
                : "sm:shrink-0",
            )}
          >
            {hasFilters && filters ? (
              <div className={cn("min-w-0", filters.className)}>
                {filters.render()}
              </div>
            ) : null}

            {hasSort && sort ? (
              sort.render ? sort.render(sort) : <DefaultSortField {...sort} />
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  caption,
  minWidth = "640px",
  className,
  tableClassName,
  isFetching,
  toolbar,
  search,
  sort,
  filters,
  pagination,
  mobile,
  rowActions,
  actionsColumnHeader,
  emptyState,
}: DataTableProps<T>) {
  const hasActions = Boolean(rowActions);
  const allColumns = hasActions
    ? [
        ...columns,
        {
          id: "__actions",
          header: actionsColumnHeader ?? null,
          cell: (row: T) => rowActions?.(row),
          align: "end" as const,
          headerClassName: "w-px",
        } satisfies DataTableColumn<T>,
      ]
    : columns;

  const showLoadingBar = Boolean(isFetching ?? (pagination !== false && pagination?.isFetching));
  const lastIndex = allColumns.length - 1;
  const totalElements =
    pagination !== false ? (pagination?.totalElements ?? 0) : 0;
  const isGenuinelyEmpty = data.length === 0 && totalElements === 0;
  const showEmptyPlaceholder = isGenuinelyEmpty && Boolean(emptyState);

  return (
    <div className={cn("space-y-4", className)}>
      <DataTableToolbar
        toolbar={toolbar}
        search={search}
        sort={sort}
        filters={filters}
      />

      {showEmptyPlaceholder ? (
        emptyState
      ) : (
        <>
          {mobile !== false && mobile ? (
            <div className={cn("grid gap-3 md:hidden", mobile.className)}>
              {data.map((row) => (
                <div key={getRowKey(row)}>{mobile.renderRow(row)}</div>
              ))}
            </div>
          ) : null}

          <div
            className={cn(
              "relative overflow-hidden rounded-lg border border-border bg-card",
              mobile !== false ? "hidden md:block" : undefined,
              tableClassName,
            )}
          >
            {showLoadingBar ? (
              <div
                className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/10"
                role="status"
                aria-live="polite"
              >
                <div className="data-table-loading-bar h-full w-1/3 rounded-full bg-primary" />
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse text-sm"
                style={{ minWidth }}
              >
                {caption ? <caption className="sr-only">{caption}</caption> : null}
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {allColumns.map((column, index) => (
                      <th
                        key={column.id}
                        scope="col"
                        className={cn(
                          "px-4 py-2.5 text-xs font-medium text-muted-foreground",
                          ALIGN_CLASSNAME[column.align ?? "start"],
                          index === 0 && "ps-5",
                          index === lastIndex && "pe-5",
                          column.headerClassName,
                        )}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.map((row) => (
                    <tr
                      key={getRowKey(row)}
                      className={cn(
                        "transition-colors hover:bg-muted/20",
                        isFetching && "opacity-60",
                      )}
                    >
                      {allColumns.map((column, index) => (
                        <td
                          key={column.id}
                          className={cn(
                            "px-4 py-3.5 align-middle",
                            ALIGN_CLASSNAME[column.align ?? "start"],
                            index === 0 && "ps-5",
                            index === lastIndex && "pe-5",
                            column.className,
                          )}
                        >
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination !== false && pagination ? (
            pagination.render ? (
              pagination.render(pagination)
            ) : (
              <DefaultPagination {...pagination} />
            )
          ) : null}
        </>
      )}
    </div>
  );
}
