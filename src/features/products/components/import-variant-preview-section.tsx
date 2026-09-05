import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImportSheetScroller } from "@/features/products/components/import-sheet-scroller";
import type { ImportVariantError, ImportVariantPreview } from "@/features/products/types";

interface ImportVariantPreviewSectionProps {
  preview: ImportVariantPreview;
}

export function ImportVariantPreviewSection({
  preview,
}: ImportVariantPreviewSectionProps) {
  const { t } = useTranslation("products");
  const hasErrors = preview.errors.length > 0;
  const rowErrorCount = new Set(
    preview.errors
      .map((error) => error.row)
      .filter((row): row is number => row != null),
  ).size;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          {t("import.variants.previewTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("import.variants.previewDescription", {
            rows: preview.totalRows,
            products: preview.productCount,
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("import.variants.replaceHint")}
        </p>
      </div>

      <p className="flex items-start gap-2 text-sm" aria-live="polite">
        {hasErrors ? (
          <AlertCircle
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
        ) : (
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-success"
            aria-hidden="true"
          />
        )}
        <span className={hasErrors ? "text-destructive" : "text-foreground"}>
          {hasErrors
            ? t("import.variants.errorsSummary", { count: rowErrorCount })
            : t("import.variants.errorsNone")}
        </span>
      </p>

      {hasErrors ? (
        <ImportSheetScroller label={t("import.variants.errorsTableCaption")}>
          <table className="min-w-max border-collapse text-sm">
            <caption className="sr-only">
              {t("import.variants.errorsTableCaption")}
            </caption>
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th scope="col" className="px-3 py-2 text-start text-xs font-medium text-muted-foreground">
                  {t("import.preview.row")}
                </th>
                <th scope="col" className="px-3 py-2 text-start text-xs font-medium text-muted-foreground">
                  {t("import.variants.columns.productSku.label")}
                </th>
                <th scope="col" className="px-3 py-2 text-start text-xs font-medium text-muted-foreground">
                  {t("import.preview.rowError")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {preview.errors.map((error, index) => (
                <ImportVariantErrorRow
                  key={`${error.row}-${error.productSku}-${index}`}
                  error={error}
                />
              ))}
            </tbody>
          </table>
        </ImportSheetScroller>
      ) : null}
    </div>
  );
}

function ImportVariantErrorRow({ error }: { error: ImportVariantError }) {
  const { t } = useTranslation("products");

  return (
    <tr>
      <td className="px-3 py-2 tabular-nums text-muted-foreground">
        {error.row ?? t("import.preview.emptyCell")}
      </td>
      <td className="px-3 py-2 font-mono text-sm" dir="ltr">
        {error.productSku ?? t("import.preview.emptyCell")}
      </td>
      <td className="px-3 py-2 text-destructive">{error.reason}</td>
    </tr>
  );
}
