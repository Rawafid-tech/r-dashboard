import type { Ref } from "react";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  excelColumnName,
  ImportSheetScroller,
} from "@/features/products/components/import-sheet-scroller";
import { ImportStepHeading } from "@/features/products/components/import-stepper";
import type { ImportTemplateColumn } from "@/features/products/types";
import { Badge, Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface ImportTemplateStepProps {
  headingRef: Ref<HTMLHeadingElement>;
  columns: ImportTemplateColumn[];
  variantColumns: ImportTemplateColumn[];
  isLoading: boolean;
  isError: boolean;
  isDownloading: boolean;
  onRetry: () => void;
  onDownload: () => void | Promise<void>;
  onContinue: () => void;
}

export function ImportTemplateStep({
  headingRef,
  columns,
  variantColumns,
  isLoading,
  isError,
  isDownloading,
  onRetry,
  onDownload,
  onContinue,
}: ImportTemplateStepProps) {
  const { t } = useTranslation("products");

  return (
    <div className="space-y-6">
      <ImportStepHeading
        headingRef={headingRef}
        title={t("import.template.title")}
        description={t("import.template.description")}
      />

      {isError ? (
        <div
          className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4"
          role="alert"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
            {t("import.template.loadFailed")}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            {t("import.template.retry")}
          </Button>
        </div>
      ) : null}

      {!isError && isLoading ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t("import.template.downloading")}
        </p>
      ) : null}

      {!isError && !isLoading && columns.length > 0 ? (
        <ImportSheetScroller label={t("import.template.columnsCaption")}>
          <table className="min-w-max border-collapse text-sm">
            <caption className="sr-only">
              {t("import.template.columnsCaption")}
            </caption>
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th
                  scope="col"
                  className="sticky start-0 z-10 w-24 bg-muted px-3 py-2.5 text-start text-[11px] font-medium text-muted-foreground"
                >
                  {t("import.template.column")}
                </th>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      "min-w-[11.5rem] max-w-[14rem] border-s border-border/50 px-3 py-2.5 text-start align-bottom",
                      column.required && "bg-primary/[0.04]",
                    )}
                  >
                    <div className="space-y-1.5">
                      <span
                        className="block text-[11px] font-medium text-muted-foreground"
                        dir="ltr"
                      >
                        {excelColumnName(index)}
                      </span>
                      <span className="block font-semibold leading-snug text-foreground">
                        {column.label}
                      </span>
                      <Badge
                        variant={column.required ? "default" : "muted"}
                        className="font-normal"
                      >
                        {column.required
                          ? t("import.template.required")
                          : t("import.template.optional")}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th
                  scope="row"
                  className="sticky start-0 z-10 bg-card px-3 py-3 text-start text-xs font-medium text-muted-foreground"
                >
                  {t("import.template.example")}
                </th>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border-s border-border/50 px-3 py-3 align-middle text-muted-foreground",
                      column.required && "bg-primary/[0.03]",
                    )}
                  >
                    <span className="line-clamp-2">
                      {column.key === "handling" && column.example
                        ? t(`handling.${column.example}`)
                        : column.example || t("import.preview.emptyCell")}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </ImportSheetScroller>
      ) : null}

      {!isError && !isLoading && variantColumns.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground">
            {t("import.variants.templateTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("import.variants.templateDescription")}
          </p>
          <ul className="list-disc ps-5 text-sm text-muted-foreground">
            {variantColumns.map((column) => (
              <li key={column.key}>
                <span className="font-medium text-foreground">{column.label}</span>
                {column.required
                  ? ` (${t("import.template.required")})`
                  : ` (${t("import.template.optional")})`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={onDownload}
          disabled={isLoading || isError || isDownloading || columns.length === 0}
        >
          {isDownloading ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Download aria-hidden="true" />
          )}
          {isDownloading
            ? t("import.template.downloading")
            : t("import.template.download")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onContinue}
          disabled={isLoading}
        >
          {t("import.template.continue")}
        </Button>
      </div>
    </div>
  );
}
