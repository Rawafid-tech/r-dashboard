import type { ReactNode } from "react";
import { useMemo } from "react";
import { ArrowUpRight, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge } from "@/shared/components/ui";
import {
  DataTable,
  type DataTableColumn,
} from "@/shared/components/data-display/data-table";
import { formatDate } from "@/shared/lib/formatters";
import { formatCompanyAccountNumber } from "@/features/admin/companies/lib/company-label";
import { PlanCodeBadge } from "@/features/admin/companies/components/plan-code-badge";
import type { AdminCompany } from "@/features/admin/companies/types";
import type { CompaniesSortOption } from "@/features/admin/companies/lib/companies-list-params";

interface CompaniesDataTableProps {
  companies: AdminCompany[];
  search: string;
  sortOption: CompaniesSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: CompaniesSortOption) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
}

const SORT_OPTIONS: CompaniesSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
  "IDENTIFIER_ASC",
  "IDENTIFIER_DESC",
];

const SORT_LABEL_KEYS: Record<CompaniesSortOption, string> = {
  CREATED_AT_DESC: "companies.toolbar.sort.createdDesc",
  CREATED_AT_ASC: "companies.toolbar.sort.createdAsc",
  NAME_ASC: "companies.toolbar.sort.nameAsc",
  NAME_DESC: "companies.toolbar.sort.nameDesc",
  IDENTIFIER_ASC: "companies.toolbar.sort.identifierAsc",
  IDENTIFIER_DESC: "companies.toolbar.sort.identifierDesc",
};

function CompanyCountryBadge({ countryCode }: { countryCode: string }) {
  const { t } = useTranslation("settings");

  return (
    <Badge variant="outline" className="font-medium">
      {t(`countries.${countryCode}`, { defaultValue: countryCode })}
    </Badge>
  );
}

function CompanyIdentity({ company }: { company: AdminCompany }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15"
        aria-hidden="true"
      >
        <Building2 className="size-4" />
      </span>
      <p dir="auto" className="min-w-0 truncate font-medium text-foreground">
        {company.name}
      </p>
    </div>
  );
}

function CompanyAccountNumber({ identifier }: { identifier: number }) {
  return (
    <span
      dir="ltr"
      className="font-mono text-sm tabular-nums text-muted-foreground"
    >
      {formatCompanyAccountNumber(identifier)}
    </span>
  );
}

export function CompaniesDataTable({
  companies,
  search,
  sortOption,
  onSearchChange,
  onSortChange,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isFetching,
  emptyState,
}: CompaniesDataTableProps) {
  const { t } = useTranslation(["admin", "settings", "common"]);

  const columns = useMemo<DataTableColumn<AdminCompany>[]>(
    () => [
      {
        id: "company",
        header: t("companies.table.company"),
        cell: (company) => <CompanyIdentity company={company} />,
      },
      {
        id: "identifier",
        header: t("companies.table.accountNumber"),
        cell: (company) => (
          <CompanyAccountNumber identifier={company.identifier} />
        ),
      },
      {
        id: "plan",
        header: t("companies.table.plan"),
        align: "center",
        cell: (company) => <PlanCodeBadge planCode={company.planCode} />,
      },
      {
        id: "country",
        header: t("companies.table.country"),
        align: "center",
        cell: (company) => (
          <CompanyCountryBadge countryCode={company.shipFromCountry} />
        ),
      },
      {
        id: "volume",
        header: t("companies.table.volume"),
        cell: (company) => (
          <span className="text-muted-foreground">
            {t(`settings:monthlyShipmentVolume.${company.monthlyShipmentVolume}`)}
          </span>
        ),
      },
      {
        id: "registered",
        header: t("companies.table.registered"),
        cell: (company) => (
          <time
            dir="ltr"
            className="tabular-nums text-muted-foreground"
            dateTime={company.createdAt}
          >
            {formatDate(company.createdAt)}
          </time>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={companies}
      columns={columns}
      getRowKey={(company) => company.id}
      caption={t("companies.table.caption")}
      minWidth="800px"
      isFetching={isFetching}
      toolbar={{ title: t("companies.toolbar.title") }}
      search={{
        id: "companies-search",
        value: search,
        onChange: onSearchChange,
        placeholder: t("companies.toolbar.searchPlaceholder"),
        hint: t("companies.toolbar.searchHint"),
        label: t("common:common.search"),
      }}
      sort={{
        id: "companies-sort",
        value: sortOption,
        onChange: (value) => onSortChange(value as CompaniesSortOption),
        label: t("companies.toolbar.sortLabel"),
        options: SORT_OPTIONS.map((value) => ({
          value,
          label: t(SORT_LABEL_KEYS[value]),
        })),
      }}
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
            t("companies.pagination.summary", { start, end, total }),
          pageOf: ({ current, total }) =>
            t("companies.pagination.pageOf", { current, total }),
          ariaLabel: t("companies.pagination.label"),
        },
      }}
      mobile={{
        renderRow: (company) => {
          return (
            <Link
              to={`/admin/companies/${company.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p dir="auto" className="truncate font-semibold text-foreground">
                    {company.name}
                  </p>
                </div>
                <PlanCodeBadge planCode={company.planCode} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <CompanyAccountNumber identifier={company.identifier} />
                <span aria-hidden="true">·</span>
                <CompanyCountryBadge countryCode={company.shipFromCountry} />
                <span aria-hidden="true">·</span>
                <time dir="ltr" dateTime={company.createdAt} className="tabular-nums">
                  {formatDate(company.createdAt)}
                </time>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t("companies.table.viewCompany")}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          );
        },
      }}
      rowActions={(company) => (
        <Link
          to={`/admin/companies/${company.id}`}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("companies.table.view")}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      )}
      actionsColumnHeader={
        <span className="sr-only">{t("companies.table.actions")}</span>
      }
      emptyState={emptyState}
    />
  );
}
