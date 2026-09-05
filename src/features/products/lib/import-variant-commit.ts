import { replaceProductVariants } from "@/features/products/api/products.api";
import { resolveProductIdsBySkus } from "@/features/products/lib/import-variant-resolve-skus";
import {
  groupVariantRowsBySku,
  toVariantRequestsFromImportRows,
} from "@/features/products/lib/import-variant-validate";
import type {
  ImportVariantCommitResult,
  ImportVariantError,
  ImportVariantRow,
} from "@/features/products/types";
import { parseApiError } from "@/shared/api/error-handler";

export async function commitImportVariants(
  rows: ImportVariantRow[],
  t: (key: string, options?: Record<string, unknown>) => string,
): Promise<ImportVariantCommitResult> {
  const groups = groupVariantRowsBySku(rows);
  const skus = [...groups.keys()];
  const errors: ImportVariantError[] = [];

  const resolved = await resolveProductIdsBySkus(skus);

  let productsUpdated = 0;
  let variantsApplied = 0;

  for (const [sku, variantRows] of groups) {
    const product = resolved.get(sku.trim());
    if (!product) {
      errors.push({
        row: variantRows[0]?.rowNumber ?? null,
        productSku: sku,
        reason: t("import.variants.validation.productSkuNotFound"),
      });
      continue;
    }

    try {
      const variants = toVariantRequestsFromImportRows(variantRows);
      await replaceProductVariants(product.id, { variants });
      productsUpdated += 1;
      variantsApplied += variants.length;
    } catch (error) {
      errors.push({
        row: variantRows[0]?.rowNumber ?? null,
        productSku: sku,
        reason:
          parseApiError(error).detail || t("import.variants.commitFailed"),
      });
    }
  }

  return {
    totalRows: rows.length,
    productsUpdated,
    variantsApplied,
    errors,
  };
}
