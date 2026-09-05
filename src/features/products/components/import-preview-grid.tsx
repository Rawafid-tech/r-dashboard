import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  fieldErrorReason,
  groupImportErrors,
} from "@/features/products/lib/import-row-errors";
import { isProductHandling } from "@/features/products/schema";
import type {
  ImportFieldKey,
  ImportRow,
  ImportRowError,
  ImportTemplateColumn,
} from "@/features/products/types";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

const PAGE_SIZE = 20;

interface ImportPreviewGridProps {
  rows: ImportRow[];
  columns: ImportTemplateColumn[];
  errors: ImportRowError[];
  mappedKeys: ImportFieldKey[];
}

function formatCell(
  value: string | number | undefined,
  empty: string,
  columnKey: string,
  translateHandling: (key: string) => string,
): string {
  if (value == null || value === "") return empty;
  if (columnKey === "handling" && typeof value === "string") {
    return isProductHandling(value) ? translateHandling(value) : value;
  }
  return String(value);
}

export function ImportPreviewGrid({
  rows,
  columns,
  errors,
  mappedKeys,
}: ImportPreviewGridProps) {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const [page, setPage] = useState(0);

  const { fileErrors, rowErrors } = useMemo(
    () => groupImportErrors(errors),
    [errors],
  );

  useEffect(() => {
    setPage(0);
  }, [rows, errors]);

  const visibleColumns = useMemo(() => {
    const mapped = columns.filter((column) =>
      mappedKeys.includes(column.key as ImportFieldKey),
    );
    const handlingColumn = columns.find((column) => column.key === "handling");
    const handlingFromDefault =
      handlingColumn &&
      !mappedKeys.includes("handling") &&
      rows.some((row) => Boolean(row.handling));

    return handlingFromDefault ? [...mapped, handlingColumn] : mapped;
  }, [columns, mappedKeys, rows]);

  const orderedRows = useMemo(() => {
    return [...rows].sort((left, right) => {
      const leftHas = rowErrors.has(left.rowNumber) ? 0 : 1;
      const rightHas = rowErrors.has(right.rowNumber) ? 0 : 1;
      if (leftHas !== rightHas) return leftHas - rightHas;
      return left.rowNumber - right.rowNumber;
    });
  }, [rows, rowErrors]);

  const totalPages = Math.max(1, Math.ceil(orderedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = orderedRows.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );
  const empty = t("import.preview.emptyCell");

  return (
    <div className="space-y-4">
      {fileErrors.length > 0 ? (
        <div
          className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
          role="alert"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
            {t("import.preview.fileErrorsTitle")}
          </p>
          <ul className="list-disc ps-7 text-sm text-destructive">
            {fileErrors.map((error, index) => (
              <li key={`${error.reason}-${index}`}>{error.reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">
              {t("import.preview.tableCaption")}
            </caption>
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th
                  scope="col"
                  className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground"
                >
                  {t("import.preview.row")}
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {pageRows.map((row) => {
                const issues = rowErrors.get(row.rowNumber);
                const rowLevel = fieldErrorReason(issues, null);
                const hasError = Boolean(issues?.length);

                return (
                  <tr
                    key={row.rowNumber}
                    className={cn(hasError && "bg-destructive/5")}
                    aria-invalid={hasError || undefined}
                  >
                    <td className="px-4 py-3 align-top font-medium tabular-nums">
                      <div className="space-y-1">
                        <span>{row.rowNumber}</span>
                        {rowLevel ? (
                          <p className="flex items-start gap-1 text-xs font-normal text-destructive">
                            <AlertCircle
                              className="mt-0.5 size-3 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{rowLevel}</span>
                          </p>
                        ) : null}
                      </div>
                    </td>
                    {visibleColumns.map((column) => {
                      const reason = fieldErrorReason(issues, column.key);
                      const value = row[column.key as ImportFieldKey];

                      return (
                        <td
                          key={column.key}
                          className={cn(
                            "px-4 py-3 align-top",
                            reason && "text-destructive",
                          )}
                          aria-invalid={reason ? true : undefined}
                        >
                          <div className="space-y-1">
                            <span>
                              {formatCell(value, empty, column.key, (key) =>
                                t(`handling.${key}`),
                              )}
                            </span>
                            {reason ? (
                              <p className="flex items-start gap-1 text-xs">
                                <AlertCircle
                                  className="mt-0.5 size-3 shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{reason}</span>
                              </p>
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {orderedRows.length > PAGE_SIZE ? (
        <nav
          aria-label={t("pagination.label")}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">
            {t("pagination.summary", {
              start: safePage * PAGE_SIZE + 1,
              end: Math.min((safePage + 1) * PAGE_SIZE, orderedRows.length),
              total: orderedRows.length,
            })}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              aria-label={tCommon("common.previous")}
            >
              <ChevronLeft aria-hidden="true" />
              <span className="hidden sm:inline">{tCommon("common.previous")}</span>
            </Button>
            <span className="min-w-16 text-center text-sm tabular-nums" dir="ltr">
              {t("pagination.pageOf", {
                current: safePage + 1,
                total: totalPages,
              })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages - 1}
              onClick={() =>
                setPage((current) => Math.min(totalPages - 1, current + 1))
              }
              aria-label={tCommon("common.next")}
            >
              <span className="hidden sm:inline">{tCommon("common.next")}</span>
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
