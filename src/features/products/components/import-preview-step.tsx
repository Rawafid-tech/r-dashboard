import type { Ref } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, FolderPlus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImportPreviewGrid } from "@/features/products/components/import-preview-grid";
import { ImportStepHeading } from "@/features/products/components/import-stepper";
import { getMappedKeys, type ColumnMapping } from "@/features/products/lib/import-map-columns";
import type { ImportRow, ImportResult, ImportTemplateColumn } from "@/features/products/types";
import { Button } from "@/shared/components/ui";

interface ImportPreviewStepProps {
  headingRef: Ref<HTMLHeadingElement>;
  columns: ImportTemplateColumn[];
  rows: ImportRow[];
  mapping: ColumnMapping;
  result: ImportResult;
  isPreviewing: boolean;
  isCommitting: boolean;
  onBack: () => void;
  onPreviewAgain: () => void;
  onCommit: () => void;
}

export function ImportPreviewStep({
  headingRef,
  columns,
  rows,
  mapping,
  result,
  isPreviewing,
  isCommitting,
  onBack,
  onPreviewAgain,
  onCommit,
}: ImportPreviewStepProps) {
  const { t, i18n } = useTranslation("products");
  const isRtl = i18n.dir() === "rtl";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const hasErrors = result.errors.length > 0;
  const rowErrorCount = new Set(
    result.errors
      .map((error) => error.row)
      .filter((row): row is number => row != null),
  ).size;
  const busy = isPreviewing || isCommitting;
  const mappedKeys = [...getMappedKeys(mapping)];

  return (
    <div className="space-y-6">
      <ImportStepHeading
        headingRef={headingRef}
        title={t("import.preview.title")}
        description={t("import.preview.description")}
      />

      <div
        className="space-y-3 rounded-xl border border-border bg-card p-4"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <FolderPlus
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {result.newCategories.length > 0
                ? t("import.preview.newCategoriesTitle", {
                    count: result.newCategories.length,
                  })
                : t("import.preview.newCategoriesNone")}
            </p>
            {result.newCategories.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {result.newCategories.map((path) => (
                  <li
                    key={path}
                    className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {path}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <p className="flex items-start gap-2 text-sm">
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
              ? t("import.preview.errorsSummary", { count: rowErrorCount })
              : t("import.preview.errorsNone")}
          </span>
        </p>
      </div>

      <ImportPreviewGrid
        rows={rows}
        columns={columns}
        errors={result.errors}
        mappedKeys={mappedKeys}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          onClick={onCommit}
          disabled={hasErrors || busy}
          aria-disabled={hasErrors || busy}
          title={hasErrors ? t("import.preview.importDisabled") : undefined}
        >
          {isCommitting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {isCommitting
            ? t("import.preview.importing")
            : t("import.preview.import")}
        </Button>
        {hasErrors ? (
          <p className="sr-only">{t("import.preview.importDisabled")}</p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={onPreviewAgain}
          disabled={busy}
        >
          {isPreviewing ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {isPreviewing
            ? t("import.preview.previewing")
            : t("import.preview.repreview")}
        </Button>
        <Button type="button" variant="outline" onClick={onBack} disabled={busy}>
          <BackIcon data-icon="inline-start" />
          {t("import.preview.back")}
        </Button>
      </div>
    </div>
  );
}
