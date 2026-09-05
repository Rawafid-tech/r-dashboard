import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { useExportProductCatalog } from "@/features/products/hooks/use-export-product-catalog";
import { useImportTemplate } from "@/features/products/hooks/use-import-template";
import { useImportVariantCommit } from "@/features/products/hooks/use-import-variant-commit";
import { getImportVariantColumns } from "@/features/products/lib/import-variant-columns";
import {
  autoMapColumns,
  getUnmappedRequiredForMode,
  hasHandlingMapped,
  type ColumnMapping,
} from "@/features/products/lib/import-map-columns";
import { buildImportRequest } from "@/features/products/lib/import-request";
import {
  autoMapVariantColumns,
  getUnmappedRequiredVariantColumns,
  type VariantColumnMapping,
} from "@/features/products/lib/import-variant-map-columns";
import { buildImportVariantRows } from "@/features/products/lib/import-variant-rows";
import {
  hasVariantPreviewErrors,
  previewImportVariantsAsync,
} from "@/features/products/lib/import-variant-validate";
import {
  buildImportRows,
  parseSpreadsheetWorkbook,
  SpreadsheetParseError,
  type ParsedSheet,
} from "@/features/products/lib/import-parse-sheet";
import { extractImportErrors } from "@/features/products/lib/import-row-errors";
import { downloadImportTemplate } from "@/features/products/lib/import-template-xlsx";
import type {
  ImportMode,
  ImportResult,
  ImportVariantCommitResult,
  ImportVariantPreview,
} from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";
import { useLocaleStore } from "@/stores/locale.store";

interface ImportTabProps {
  onGoToProducts: () => void;
}

function emptyMapping(): ColumnMapping {
  return {};
}

function emptyVariantMapping(): VariantColumnMapping {
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
  const variantCommitMutation = useImportVariantCommit();

  const variantColumns = useMemo(() => getImportVariantColumns(t), [t]);

  const [step, setStep] = useState<ImportWizardStep>(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const { exportCatalog, isExporting: isExportingCatalog } =
    useExportProductCatalog();
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedSheet | null>(null);
  const [parsedVariants, setParsedVariants] = useState<ParsedSheet | null>(null);
  const [isMultiSheet, setIsMultiSheet] = useState(false);
  const [mapping, setMapping] = useState<ColumnMapping>(emptyMapping);
  const [variantMapping, setVariantMapping] =
    useState<VariantColumnMapping>(emptyVariantMapping);
  const [importMode, setImportMode] = useState<ImportMode>("INSERT_ONLY");
  const [applyDefaultHandling, setApplyDefaultHandling] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [variantPreview, setVariantPreview] =
    useState<ImportVariantPreview | null>(null);
  const [commitResult, setCommitResult] = useState<ImportResult | null>(null);
  const [variantCommitResult, setVariantCommitResult] =
    useState<ImportVariantCommitResult | null>(null);
  const [isVariantPreviewing, setIsVariantPreviewing] = useState(false);

  const columns = templateQuery.data;
  const hasProductRows = (parsedProducts?.rows.length ?? 0) > 0;
  const hasVariantRows = (parsedVariants?.rows.length ?? 0) > 0;
  const showHandlingDefault =
    importMode === "INSERT_ONLY" &&
    Boolean(parsedProducts) &&
    hasProductRows &&
    !hasHandlingMapped(mapping);

  const unmappedRequired = useMemo(
    () =>
      parsedProducts && columns && hasProductRows
        ? getUnmappedRequiredForMode(
            mapping,
            columns,
            importMode,
            showHandlingDefault && applyDefaultHandling,
          )
        : [],
    [
      applyDefaultHandling,
      columns,
      hasProductRows,
      importMode,
      mapping,
      parsedProducts,
      showHandlingDefault,
    ],
  );

  const unmappedRequiredVariants = useMemo(
    () =>
      parsedVariants && hasVariantRows
        ? getUnmappedRequiredVariantColumns(variantMapping, variantColumns)
        : [],
    [hasVariantRows, parsedVariants, variantColumns, variantMapping],
  );

  const importRows = useMemo(() => {
    if (!parsedProducts || !hasProductRows) return [];
    return buildImportRows(
      parsedProducts,
      mapping,
      showHandlingDefault && applyDefaultHandling,
    );
  }, [
    applyDefaultHandling,
    hasProductRows,
    mapping,
    parsedProducts,
    showHandlingDefault,
  ]);

  const importVariantRows = useMemo(() => {
    if (!parsedVariants || !hasVariantRows) return [];
    return buildImportVariantRows(parsedVariants, variantMapping);
  }, [hasVariantRows, parsedVariants, variantMapping]);

  const productSkusInBatch = useMemo(
    () =>
      new Set(
        importRows
          .map((row) => String(row.sku ?? "").trim())
          .filter(Boolean),
      ),
    [importRows],
  );

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!parsedProducts || !templateQuery.data) return;
    previewGeneration.current += 1;
    setMapping(autoMapColumns(parsedProducts.headers, templateQuery.data));
    setPreview(null);
    setVariantPreview(null);
    setStep((current) => (current === 3 ? 2 : current));
  }, [parsedProducts, templateQuery.data]);

  useEffect(() => {
    if (!parsedVariants) return;
    previewGeneration.current += 1;
    setVariantMapping(autoMapVariantColumns(parsedVariants.headers, variantColumns));
    setVariantPreview(null);
    setStep((current) => (current === 3 ? 2 : current));
  }, [parsedVariants, variantColumns]);

  const resetFileState = useCallback(() => {
    previewGeneration.current += 1;
    setFileName(null);
    setParsedProducts(null);
    setParsedVariants(null);
    setIsMultiSheet(false);
    setMapping(emptyMapping());
    setVariantMapping(emptyVariantMapping());
    setImportMode("INSERT_ONLY");
    setApplyDefaultHandling(false);
    setParseError(null);
    setPreview(null);
    setVariantPreview(null);
    setCommitResult(null);
    setVariantCommitResult(null);
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
        t,
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
      setVariantPreview(null);
      setCommitResult(null);
      setVariantCommitResult(null);

      try {
        const workbook = await parseSpreadsheetWorkbook(file);
        setFileName(file.name);
        setParsedProducts(workbook.products);
        setParsedVariants(workbook.variants);
        setIsMultiSheet(workbook.isMultiSheet);
        setMapping(
          workbook.products?.headers.length
            ? autoMapColumns(workbook.products.headers, columns ?? [])
            : emptyMapping(),
        );
        setVariantMapping(
          workbook.variants?.headers.length
            ? autoMapVariantColumns(workbook.variants.headers, variantColumns)
            : emptyVariantMapping(),
        );
        setApplyDefaultHandling(false);
      } catch (error) {
        setFileName(null);
        setParsedProducts(null);
        setParsedVariants(null);
        setIsMultiSheet(false);
        setMapping(emptyMapping());
        setVariantMapping(emptyVariantMapping());

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
    [columns, t, variantColumns],
  );

  const runPreview = useCallback(async () => {
    if (
      (!hasProductRows && !hasVariantRows) ||
      (hasProductRows && unmappedRequired.length > 0) ||
      (hasVariantRows && unmappedRequiredVariants.length > 0)
    ) {
      return;
    }

    const generation = previewGeneration.current + 1;
    previewGeneration.current = generation;

    try {
      let productPreview: ImportResult | null = null;

      if (hasProductRows) {
        productPreview = await previewMutation.mutateAsync(
          buildImportRequest({
            dryRun: true,
            mode: importMode,
            mapping,
            rows: importRows,
          }),
        );
        if (generation !== previewGeneration.current) return;
      }

      let nextVariantPreview: ImportVariantPreview | null = null;
      if (hasVariantRows) {
        setIsVariantPreviewing(true);
        nextVariantPreview = await previewImportVariantsAsync(
          importVariantRows,
          productSkusInBatch,
          t,
        );
        if (generation !== previewGeneration.current) return;
      }

      setPreview(
        productPreview ?? {
          dryRun: true,
          totalRows: 0,
          created: 0,
          updatedSkus: [],
          newCategories: [],
          errors: [],
        },
      );
      setVariantPreview(nextVariantPreview);
      goToStep(3);
    } catch {
      // Toast is handled in the mutation hook.
    } finally {
      setIsVariantPreviewing(false);
    }
  }, [
    goToStep,
    hasProductRows,
    hasVariantRows,
    importMode,
    importRows,
    importVariantRows,
    mapping,
    previewMutation,
    productSkusInBatch,
    t,
    unmappedRequired.length,
    unmappedRequiredVariants.length,
  ]);

  const handleCommit = useCallback(async () => {
    const productHasErrors = preview != null && preview.errors.length > 0;
    const variantHasErrors =
      variantPreview != null && hasVariantPreviewErrors(variantPreview);

    if (
      productHasErrors ||
      variantHasErrors ||
      (!hasProductRows && !hasVariantRows)
    ) {
      return;
    }

    try {
      let productResult: ImportResult = preview ?? {
        dryRun: false,
        totalRows: 0,
        created: 0,
        updatedSkus: [],
        newCategories: [],
        errors: [],
      };

      if (hasProductRows) {
        productResult = await commitMutation.mutateAsync(
          buildImportRequest({
            dryRun: false,
            mode: importMode,
            mapping,
            rows: importRows,
          }),
        );
      }

      let nextVariantCommit: ImportVariantCommitResult | null = null;
      if (hasVariantRows) {
        nextVariantCommit =
          await variantCommitMutation.mutateAsync(importVariantRows);

        if (nextVariantCommit.errors.length > 0) {
          setCommitResult(productResult);
          setVariantCommitResult(nextVariantCommit);
          toast.error(t("import.variants.toast.partialFailure"));
          goToStep(4);
          return;
        }

        if (nextVariantCommit.variantsApplied > 0) {
          toast.success(
            t("import.variants.toast.committed", {
              count: nextVariantCommit.variantsApplied,
              products: nextVariantCommit.productsUpdated,
            }),
          );
        }
      }

      setCommitResult(productResult);
      setVariantCommitResult(nextVariantCommit);
      goToStep(4);
    } catch (error) {
      if (isApiError(error, 409)) {
        toast.error(
          parseApiError(error).detail || t("import.toast.stalePreview"),
        );
        goToStep(3);
        void runPreview();
        return;
      }

      if (isApiError(error, 422)) {
        const errors = extractImportErrors(error);
        setPreview((current) =>
          current
            ? { ...current, dryRun: true, created: 0, errors }
            : {
                dryRun: true,
                totalRows: importRows.length,
                created: 0,
                updatedSkus: [],
                newCategories: [],
                errors,
              },
        );
      }
    }
  }, [
    commitMutation,
    goToStep,
    hasProductRows,
    hasVariantRows,
    importMode,
    importRows,
    importVariantRows,
    mapping,
    preview,
    runPreview,
    t,
    variantCommitMutation,
    variantPreview,
  ]);

  const handleImportAnother = useCallback(() => {
    resetFileState();
    goToStep(2);
  }, [goToStep, resetFileState]);

  const isPreviewing = previewMutation.isPending || isVariantPreviewing;
  const isCommitting =
    commitMutation.isPending || variantCommitMutation.isPending;

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
          variantColumns={variantColumns}
          isLoading={templateQuery.isLoading}
          isError={templateQuery.isError}
          isDownloading={isDownloading}
          isExportingCatalog={isExportingCatalog}
          onRetry={() => void templateQuery.refetch()}
          onDownload={() => void handleDownload()}
          onExportCatalog={() => void exportCatalog()}
          onContinue={() => goToStep(2)}
        />
      ) : null}

      {step === 2 ? (
        <ImportUploadMapStep
          headingRef={headingRef}
          columns={columns ?? []}
          variantColumns={variantColumns}
          fileName={fileName}
          parsed={parsedProducts}
          parsedVariants={parsedVariants}
          isMultiSheet={isMultiSheet}
          mapping={mapping}
          variantMapping={variantMapping}
          importMode={importMode}
          applyDefaultHandling={applyDefaultHandling}
          showHandlingDefault={showHandlingDefault}
          unmappedRequired={unmappedRequired}
          unmappedRequiredVariants={unmappedRequiredVariants}
          parseError={parseError}
          isParsing={isParsing}
          isDragging={isDragging}
          isPreviewing={isPreviewing}
          onDraggingChange={setIsDragging}
          onFile={(file) => void handleFile(file)}
          onMappingChange={(next) => {
            previewGeneration.current += 1;
            setMapping(next);
            setPreview(null);
            setVariantPreview(null);
          }}
          onVariantMappingChange={(next) => {
            previewGeneration.current += 1;
            setVariantMapping(next);
            setVariantPreview(null);
          }}
          onApplyDefaultHandlingChange={(value) => {
            setApplyDefaultHandling(value);
            setPreview(null);
          }}
          onImportModeChange={(mode) => {
            previewGeneration.current += 1;
            setImportMode(mode);
            if (mode === "UPSERT") {
              setApplyDefaultHandling(false);
            }
            setPreview(null);
            setVariantPreview(null);
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
          importMode={importMode}
          variantPreview={variantPreview}
          hasProductRows={hasProductRows}
          isPreviewing={isPreviewing}
          isCommitting={isCommitting}
          onBack={() => goToStep(2)}
          onPreviewAgain={() => void runPreview()}
          onCommit={() => void handleCommit()}
        />
      ) : null}

      {step === 4 && commitResult ? (
        <ImportResultStep
          headingRef={headingRef}
          result={commitResult}
          variantResult={variantCommitResult}
          onGoToProducts={onGoToProducts}
          onImportAnother={handleImportAnother}
        />
      ) : null}
    </section>
  );
}
