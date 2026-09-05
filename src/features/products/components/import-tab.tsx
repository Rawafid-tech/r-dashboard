import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImportPreviewStep } from "@/features/products/components/import-preview-step";
import { ImportResultStep } from "@/features/products/components/import-result";
import {
  ImportStepper,
  type ImportWizardStep,
} from "@/features/products/components/import-stepper";
import { ImportTemplateStep } from "@/features/products/components/import-template-step";
import { ImportUploadMapStep } from "@/features/products/components/import-upload-map-step";
import { useImportCommit } from "@/features/products/hooks/use-import-commit";
import { useImportPreview } from "@/features/products/hooks/use-import-preview";
import { useImportTemplate } from "@/features/products/hooks/use-import-template";
import {
  autoMapColumns,
  getUnmappedRequiredColumns,
  hasHandlingMapped,
  type ColumnMapping,
} from "@/features/products/lib/import-map-columns";
import {
  buildImportRows,
  parseSpreadsheet,
  SpreadsheetParseError,
  type ParsedSheet,
} from "@/features/products/lib/import-parse-sheet";
import { extractImportErrors } from "@/features/products/lib/import-row-errors";
import { downloadImportTemplate } from "@/features/products/lib/import-template-xlsx";
import type { ImportResult } from "@/features/products/types";
import { isApiError } from "@/shared/api/error-handler";
import { useLocaleStore } from "@/stores/locale.store";

interface ImportTabProps {
  onGoToProducts: () => void;
}

function emptyMapping(): ColumnMapping {
  return {};
}

export function ImportTab({ onGoToProducts }: ImportTabProps) {
  const { t } = useTranslation("products");
  const locale = useLocaleStore((state) => state.locale);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previewGeneration = useRef(0);

  const templateQuery = useImportTemplate();
  const previewMutation = useImportPreview();
  const commitMutation = useImportCommit();

  const [step, setStep] = useState<ImportWizardStep>(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>(emptyMapping);
  const [applyDefaultHandling, setApplyDefaultHandling] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [commitResult, setCommitResult] = useState<ImportResult | null>(null);

  const columns = templateQuery.data;
  const showHandlingDefault = Boolean(parsed) && !hasHandlingMapped(mapping);
  const unmappedRequired = useMemo(
    () =>
      parsed && columns
        ? getUnmappedRequiredColumns(
            mapping,
            columns,
            showHandlingDefault && applyDefaultHandling,
          )
        : [],
    [applyDefaultHandling, columns, mapping, parsed, showHandlingDefault],
  );

  const importRows = useMemo(() => {
    if (!parsed) return [];
    return buildImportRows(
      parsed,
      mapping,
      showHandlingDefault && applyDefaultHandling,
    );
  }, [applyDefaultHandling, mapping, parsed, showHandlingDefault]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!parsed || !templateQuery.data) return;
    previewGeneration.current += 1;
    setMapping(autoMapColumns(parsed.headers, templateQuery.data));
    setPreview(null);
    setStep((current) => (current === 3 ? 2 : current));
  }, [parsed, templateQuery.data]);

  const resetFileState = useCallback(() => {
    previewGeneration.current += 1;
    setFileName(null);
    setParsed(null);
    setMapping(emptyMapping());
    setApplyDefaultHandling(false);
    setParseError(null);
    setPreview(null);
    setCommitResult(null);
    setIsDragging(false);
  }, []);

  const goToStep = useCallback((next: ImportWizardStep) => {
    setStep(next);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!columns?.length) return;

    setIsDownloading(true);
    try {
      await downloadImportTemplate(
        columns,
        locale === "ar" ? "منتجات-قالب.xlsx" : "products-template.xlsx",
        {
          enumErrorTitle: t("import.template.enumErrorTitle"),
          enumError: t("import.template.enumError"),
          enumPrompt: t("import.template.enumPrompt"),
        },
        locale,
      );
    } finally {
      setIsDownloading(false);
    }
  }, [columns, locale, t]);

  const handleFile = useCallback(
    async (file: File) => {
      previewGeneration.current += 1;
      setIsParsing(true);
      setParseError(null);
      setPreview(null);
      setCommitResult(null);

      try {
        const sheet = await parseSpreadsheet(file);
        setFileName(file.name);
        setParsed(sheet);
        setMapping(autoMapColumns(sheet.headers, columns ?? []));
        setApplyDefaultHandling(false);
      } catch (error) {
        setFileName(null);
        setParsed(null);
        setMapping(emptyMapping());

        if (error instanceof SpreadsheetParseError) {
          const messages: Record<SpreadsheetParseError["code"], string> = {
            invalidType: t("import.upload.invalidType"),
            empty: t("import.upload.emptyFile"),
            unreadable: t("import.upload.unreadable"),
          };
          setParseError(messages[error.code]);
        } else {
          setParseError(t("import.upload.unreadable"));
        }
      } finally {
        setIsParsing(false);
      }
    },
    [columns, t],
  );

  const runPreview = useCallback(async () => {
    if (importRows.length === 0 || unmappedRequired.length > 0) return;

    const generation = previewGeneration.current + 1;
    previewGeneration.current = generation;

    try {
      const result = await previewMutation.mutateAsync(importRows);
      if (generation !== previewGeneration.current) return;
      setPreview(result);
      goToStep(3);
    } catch {
      // Toast is handled in the mutation hook.
    }
  }, [goToStep, importRows, previewMutation, unmappedRequired.length]);

  const handleCommit = useCallback(async () => {
    if (!preview || preview.errors.length > 0 || importRows.length === 0) {
      return;
    }

    try {
      const result = await commitMutation.mutateAsync(importRows);
      setCommitResult(result);
      goToStep(4);
    } catch (error) {
      if (isApiError(error, 422)) {
        const errors = extractImportErrors(error);
        setPreview((current) =>
          current
            ? { ...current, dryRun: true, created: 0, errors }
            : {
                dryRun: true,
                totalRows: importRows.length,
                created: 0,
                newCategories: [],
                errors,
              },
        );
      }
    }
  }, [commitMutation, goToStep, importRows, preview]);

  const handleImportAnother = useCallback(() => {
    resetFileState();
    goToStep(2);
  }, [goToStep, resetFileState]);

  return (
    <section className="space-y-6" aria-labelledby="import-wizard-title">
      <h2 id="import-wizard-title" className="sr-only">
        {t("import.template.title")}
      </h2>

      <ImportStepper step={step} />

      {step === 1 ? (
        <ImportTemplateStep
          headingRef={headingRef}
          columns={columns ?? []}
          isLoading={templateQuery.isLoading}
          isError={templateQuery.isError}
          isDownloading={isDownloading}
          onRetry={() => void templateQuery.refetch()}
          onDownload={handleDownload}
          onContinue={() => goToStep(2)}
        />
      ) : null}

      {step === 2 ? (
        <ImportUploadMapStep
          headingRef={headingRef}
          columns={columns ?? []}
          fileName={fileName}
          parsed={parsed}
          mapping={mapping}
          applyDefaultHandling={applyDefaultHandling}
          showHandlingDefault={showHandlingDefault}
          unmappedRequired={unmappedRequired}
          parseError={parseError}
          isParsing={isParsing}
          isDragging={isDragging}
          isPreviewing={previewMutation.isPending}
          onDraggingChange={setIsDragging}
          onFile={(file) => void handleFile(file)}
          onMappingChange={(next) => {
            previewGeneration.current += 1;
            setMapping(next);
            setPreview(null);
          }}
          onApplyDefaultHandlingChange={(value) => {
            setApplyDefaultHandling(value);
            setPreview(null);
          }}
          onBack={() => goToStep(1)}
          onPreview={() => void runPreview()}
        />
      ) : null}

      {step === 3 && preview ? (
        <ImportPreviewStep
          headingRef={headingRef}
          columns={columns ?? []}
          rows={importRows}
          mapping={mapping}
          result={preview}
          isPreviewing={previewMutation.isPending}
          isCommitting={commitMutation.isPending}
          onBack={() => goToStep(2)}
          onPreviewAgain={() => void runPreview()}
          onCommit={() => void handleCommit()}
        />
      ) : null}

      {step === 4 && commitResult ? (
        <ImportResultStep
          headingRef={headingRef}
          result={commitResult}
          onGoToProducts={onGoToProducts}
          onImportAnother={handleImportAnother}
        />
      ) : null}
    </section>
  );
}
