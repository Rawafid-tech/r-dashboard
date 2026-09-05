import { findMissingVariantSkus } from "@/features/products/lib/import-variant-resolve-skus";
import {
  MAX_VARIANT_NAME_LENGTH,
  MAX_VARIANT_PRICE,
  MAX_VARIANTS_PER_PRODUCT,
  type ImportVariantError,
  type ImportVariantPreview,
  type ImportVariantRow,
} from "@/features/products/types";

function normalizeSku(value: string): string {
  return value.trim();
}

function normalizeName(value: string): string {
  return value.trim();
}

function validatePrice(
  value: string | number | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  if (value == null || value === "") return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return t("import.variants.validation.priceInvalid");
  }

  if (parsed < 0) {
    return t("import.variants.validation.priceMinZero");
  }

  if (parsed > MAX_VARIANT_PRICE) {
    return t("import.variants.validation.priceMax", { max: MAX_VARIANT_PRICE });
  }

  const decimalPart = trimmed.includes(".")
    ? (trimmed.split(".")[1] ?? "")
    : "";
  if (decimalPart.length > 2) {
    return t("import.variants.validation.priceDecimals");
  }

  return null;
}

export function previewImportVariants(
  rows: ImportVariantRow[],
  productSkusInBatch: Set<string>,
  t: (key: string, options?: Record<string, unknown>) => string,
): ImportVariantPreview {
  const errors: ImportVariantError[] = [];
  const groups = new Map<
    string,
    Array<{ rowNumber: number; name: string; nameKey: string }>
  >();

  rows.forEach((row) => {
    const sku = normalizeSku(row.productSku ?? "");
    const name = normalizeName(row.variantName ?? "");

    if (!sku) {
      errors.push({
        row: row.rowNumber,
        productSku: null,
        reason: t("import.variants.validation.productSkuRequired"),
      });
    }

    if (!name) {
      errors.push({
        row: row.rowNumber,
        productSku: sku || null,
        reason: t("import.variants.validation.variantNameRequired"),
      });
    } else if (name.length > MAX_VARIANT_NAME_LENGTH) {
      errors.push({
        row: row.rowNumber,
        productSku: sku || null,
        reason: t("import.variants.validation.variantNameMax", {
          max: MAX_VARIANT_NAME_LENGTH,
        }),
      });
    }

    const priceError = validatePrice(row.variantPrice, t);
    if (priceError) {
      errors.push({
        row: row.rowNumber,
        productSku: sku || null,
        reason: priceError,
      });
    }

    if (!sku || !name) return;

    const group = groups.get(sku) ?? [];
    group.push({
      rowNumber: row.rowNumber,
      name,
      nameKey: name.toLocaleLowerCase(),
    });
    groups.set(sku, group);
  });

  groups.forEach((entries, sku) => {
    if (entries.length > MAX_VARIANTS_PER_PRODUCT) {
      errors.push({
        row: null,
        productSku: sku,
        reason: t("import.variants.validation.maxPerProduct", {
          max: MAX_VARIANTS_PER_PRODUCT,
          count: entries.length,
        }),
      });
    }

    const seen = new Map<string, number>();
    entries.forEach((entry) => {
      const firstRow = seen.get(entry.nameKey);
      if (firstRow != null) {
        errors.push({
          row: entry.rowNumber,
          productSku: sku,
          reason: t("import.variants.validation.duplicateName"),
        });
        if (!errors.some((error) => error.row === firstRow)) {
          errors.push({
            row: firstRow,
            productSku: sku,
            reason: t("import.variants.validation.duplicateName"),
          });
        }
        return;
      }
      seen.set(entry.nameKey, entry.rowNumber);
    });

    if (!productSkusInBatch.has(sku)) {
      // SKU resolution happens at commit — flagged separately if missing.
    }
  });

  return {
    totalRows: rows.length,
    productCount: groups.size,
    errors,
  };
}

export function groupVariantRowsBySku(
  rows: ImportVariantRow[],
): Map<string, ImportVariantRow[]> {
  const groups = new Map<string, ImportVariantRow[]>();

  rows.forEach((row) => {
    const sku = normalizeSku(row.productSku ?? "");
    const name = normalizeName(row.variantName ?? "");
    if (!sku || !name) return;

    const group = groups.get(sku) ?? [];
    group.push(row);
    groups.set(sku, group);
  });

  return groups;
}

export function toVariantRequestsFromImportRows(
  rows: ImportVariantRow[],
): Array<{ name: string; price?: number }> {
  return rows.map((row) => {
    const name = normalizeName(row.variantName ?? "");
    const request: { name: string; price?: number } = { name };

    const trimmed = row.variantPrice == null ? "" : String(row.variantPrice).trim();
    if (trimmed) {
      request.price = Math.round(Number(trimmed) * 100) / 100;
    }

    return request;
  });
}

export function hasVariantPreviewErrors(preview: ImportVariantPreview): boolean {
  return preview.errors.length > 0;
}

export async function previewImportVariantsAsync(
  rows: ImportVariantRow[],
  productSkusInBatch: Set<string>,
  t: (key: string, options?: Record<string, unknown>) => string,
): Promise<ImportVariantPreview> {
  const preview = previewImportVariants(rows, productSkusInBatch, t);
  if (preview.errors.length > 0) return preview;

  const skus = [...groupVariantRowsBySku(rows).keys()];
  const missing = await findMissingVariantSkus(skus, productSkusInBatch);

  if (missing.length === 0) return preview;

  return {
    ...preview,
    errors: [
      ...preview.errors,
      ...missing.map((sku) => ({
        row: null as number | null,
        productSku: sku,
        reason: t("import.variants.validation.productSkuNotFound"),
      })),
    ],
  };
}
