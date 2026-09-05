import type { Ref } from "react";
import { AlertCircle, CheckCircle2, FolderPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImportStepHeading } from "@/features/products/components/import-stepper";
import type {
  ImportResult,
  ImportVariantCommitResult,
} from "@/features/products/types";
import { Button } from "@/shared/components/ui";

interface ImportResultStepProps {
  headingRef: Ref<HTMLHeadingElement>;
  result: ImportResult;
  variantResult: ImportVariantCommitResult | null;
  onGoToProducts: () => void;
  onImportAnother: () => void;
}

export function ImportResultStep({
  headingRef,
  result,
  variantResult,
  onGoToProducts,
  onImportAnother,
}: ImportResultStepProps) {
  const { t } = useTranslation("products");
  const variantHasErrors = (variantResult?.errors.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <ImportStepHeading
        headingRef={headingRef}
        title={t("import.result.title")}
        description={t("import.result.description", {
          created: result.created,
        })}
      />

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        {result.created > 0 ? (
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
            {t("import.result.description", { created: result.created })}
          </p>
        ) : null}

        {result.newCategories.length > 0 ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FolderPlus className="size-4 text-primary" aria-hidden="true" />
              {t("import.result.categoriesTitle", {
                count: result.newCategories.length,
              })}
            </p>
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
          </div>
        ) : null}

        {variantResult && variantResult.variantsApplied > 0 ? (
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
            {t("import.variants.resultApplied", {
              variants: variantResult.variantsApplied,
              products: variantResult.productsUpdated,
            })}
          </p>
        ) : null}

        {variantHasErrors ? (
          <div className="space-y-2" role="alert">
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {t("import.variants.resultPartialFailure")}
            </p>
            <ul className="space-y-1 text-sm text-destructive">
              {variantResult?.errors.map((error, index) => (
                <li key={`${error.productSku}-${error.row}-${index}`}>
                  {error.productSku
                    ? `${error.productSku}: ${error.reason}`
                    : error.reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={onGoToProducts}>
          {t("import.result.backToList")}
        </Button>
        <Button type="button" variant="outline" onClick={onImportAnother}>
          {t("import.result.importAnother")}
        </Button>
      </div>
    </div>
  );
}
