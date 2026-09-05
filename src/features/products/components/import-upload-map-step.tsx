import type { Ref } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImportColumnMapper } from "@/features/products/components/import-column-mapper";
import { ImportFileZone } from "@/features/products/components/import-file-zone";
import { ImportStepHeading } from "@/features/products/components/import-stepper";
import type { ColumnMapping } from "@/features/products/lib/import-map-columns";
import type { ParsedSheet } from "@/features/products/lib/import-parse-sheet";
import type { ImportTemplateColumn } from "@/features/products/types";
import { Button, Checkbox, Label } from "@/shared/components/ui";

interface ImportUploadMapStepProps {
  headingRef: Ref<HTMLHeadingElement>;
  columns: ImportTemplateColumn[];
  fileName: string | null;
  parsed: ParsedSheet | null;
  mapping: ColumnMapping;
  applyDefaultHandling: boolean;
  showHandlingDefault: boolean;
  unmappedRequired: ImportTemplateColumn[];
  parseError: string | null;
  isParsing: boolean;
  isDragging: boolean;
  isPreviewing: boolean;
  onDraggingChange: (dragging: boolean) => void;
  onFile: (file: File) => void;
  onMappingChange: (mapping: ColumnMapping) => void;
  onApplyDefaultHandlingChange: (value: boolean) => void;
  onBack: () => void;
  onPreview: () => void;
}

export function ImportUploadMapStep({
  headingRef,
  columns,
  fileName,
  parsed,
  mapping,
  applyDefaultHandling,
  showHandlingDefault,
  unmappedRequired,
  parseError,
  isParsing,
  isDragging,
  isPreviewing,
  onDraggingChange,
  onFile,
  onMappingChange,
  onApplyDefaultHandlingChange,
  onBack,
  onPreview,
}: ImportUploadMapStepProps) {
  const { t, i18n } = useTranslation("products");
  const isRtl = i18n.dir() === "rtl";
  const ContinueIcon = isRtl ? ArrowLeft : ArrowRight;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const canPreview = Boolean(parsed) && unmappedRequired.length === 0 && !isParsing;
  const handlingHintId = "import-handling-hint";

  return (
    <div className="space-y-6">
      <ImportStepHeading
        headingRef={headingRef}
        title={t("import.upload.title")}
        description={t("import.upload.description")}
      />

      <ImportFileZone
        fileName={fileName}
        isParsing={isParsing}
        compact={Boolean(parsed)}
        disabled={isPreviewing}
        isDragging={isDragging}
        onDraggingChange={onDraggingChange}
        onFile={onFile}
      />

      {parseError ? (
        <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{parseError}</span>
        </p>
      ) : null}

      {parsed ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {parsed.truncated
              ? t("import.upload.rowCountTruncated", {
                  sent: parsed.rows.length,
                  total: parsed.totalDataRows,
                })
              : t("import.upload.rowCount", { count: parsed.rows.length })}
          </p>

          {parsed.truncated ? (
            <div
              className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm"
              role="status"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-warning"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {t("import.upload.overLimitTitle")}
                </p>
                <p className="text-muted-foreground">
                  {t("import.upload.overLimitDescription")}
                </p>
              </div>
            </div>
          ) : null}

          <ImportColumnMapper
            headers={parsed.headers}
            columns={columns}
            mapping={mapping}
            onMappingChange={onMappingChange}
            disabled={isPreviewing}
          />

          {showHandlingDefault ? (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Checkbox
                id="import-apply-general"
                checked={applyDefaultHandling}
                onCheckedChange={(value) =>
                  onApplyDefaultHandlingChange(value === true)
                }
                disabled={isPreviewing}
                aria-describedby={handlingHintId}
              />
              <div className="space-y-1">
                <Label htmlFor="import-apply-general">
                  {t("import.upload.applyGeneral")}
                </Label>
                <p id={handlingHintId} className="text-sm text-muted-foreground">
                  {t("import.upload.applyGeneralHint")}
                </p>
              </div>
            </div>
          ) : null}

          {unmappedRequired.length > 0 ? (
            <div className="space-y-1" role="alert">
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{t("import.upload.requiredUnmapped")}</span>
              </p>
              <ul className="list-disc ps-8 text-sm text-destructive">
                {unmappedRequired.map((column) => (
                  <li key={column.key}>
                    {t("import.upload.missingRequired", { label: column.label })}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={onPreview}
          disabled={!canPreview || isPreviewing}
        >
          {isPreviewing ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <ContinueIcon data-icon="inline-end" />
          )}
          {isPreviewing
            ? t("import.preview.previewing")
            : t("import.upload.preview")}
        </Button>
        <Button type="button" variant="outline" onClick={onBack} disabled={isPreviewing}>
          <BackIcon data-icon="inline-start" />
          {t("import.upload.back")}
        </Button>
      </div>
    </div>
  );
}
