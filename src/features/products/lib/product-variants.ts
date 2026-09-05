import type {
  VariantRequest,
  ProductVariant,
} from "@/features/products/types";
import {
  MAX_VARIANT_NAME_LENGTH,
  MAX_VARIANT_PRICE,
  MAX_VARIANTS_PER_PRODUCT,
  VARIANT_NAME_SEPARATOR,
} from "@/features/products/types";

export interface VariantAxis {
  id: string;
  name: string;
  values: VariantAxisValue[];
}

export interface VariantAxisValue {
  id: string;
  value: string;
}

export interface GeneratedVariantRow {
  id: string;
  name: string;
  price: string;
}

export interface FlatVariantRow {
  id: string;
  name: string;
  price: string;
}

export type VariantFormErrors = {
  global?: string;
  rows?: Record<string, { name?: string; price?: string }>;
};

export function createVariantAxis(name = ""): VariantAxis {
  return {
    id: crypto.randomUUID(),
    name,
    values: [createVariantAxisValue()],
  };
}

export function createVariantAxisValue(value = ""): VariantAxisValue {
  return { id: crypto.randomUUID(), value };
}

export function createFlatVariantRow(
  name = "",
  price = "",
): FlatVariantRow {
  return { id: crypto.randomUUID(), name, price };
}

export function productVariantsToFlatRows(
  variants: ProductVariant[],
): FlatVariantRow[] {
  return [...variants]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((variant) => ({
      id: crypto.randomUUID(),
      name: variant.name,
      price: variant.price != null ? String(variant.price) : "",
    }));
}

export function flattenAxisValues(values: string[]): string {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .join(VARIANT_NAME_SEPARATOR);
}

export function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [];
  return arrays.reduce<T[][]>(
    (acc, current) =>
      acc.flatMap((prefix) => current.map((item) => [...prefix, item])),
    [[]],
  );
}

export function countAxisCombinations(axes: VariantAxis[]): number {
  const valueCounts = axes
    .map((axis) =>
      axis.values.map((entry) => entry.value.trim()).filter(Boolean).length,
    )
    .filter((count) => count > 0);

  if (valueCounts.length === 0) return 0;
  return valueCounts.reduce((total, count) => total * count, 1);
}

export function generateVariantRowsFromAxes(
  axes: VariantAxis[],
  existingPrices: Map<string, string> = new Map(),
): GeneratedVariantRow[] {
  const activeAxes = axes
    .map((axis) => ({
      ...axis,
      values: axis.values
        .map((entry) => entry.value.trim())
        .filter(Boolean),
    }))
    .filter((axis) => axis.values.length > 0);

  if (activeAxes.length === 0) return [];

  const combinations = cartesianProduct(
    activeAxes.map((axis) => axis.values),
  );

  return combinations.map((combination) => {
    const name = flattenAxisValues(combination);
    return {
      id: crypto.randomUUID(),
      name,
      price: existingPrices.get(name) ?? "",
    };
  });
}

function parseVariantPrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

export function toVariantRequests(
  rows: Array<{ name: string; price: string }>,
): VariantRequest[] {
  return rows.map((row) => {
    const name = row.name.trim();
    const price = parseVariantPrice(row.price);

    const request: VariantRequest = { name };
    if (price != null) {
      request.price = price;
    }
    return request;
  });
}

export function variantRequestsEqual(
  left: VariantRequest[],
  right: VariantRequest[],
): boolean {
  if (left.length !== right.length) return false;

  return left.every((item, index) => {
    const other = right[index];
    if (!other) return false;
    const leftPrice = item.price ?? null;
    const rightPrice = other.price ?? null;
    return item.name === other.name && leftPrice === rightPrice;
  });
}

function validateVariantPrice(
  price: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | undefined {
  const trimmed = price.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return t("form.variants.validation.priceInvalid");
  }

  if (parsed < 0) {
    return t("form.variants.validation.priceMinZero");
  }

  if (parsed > MAX_VARIANT_PRICE) {
    return t("form.variants.validation.priceMax", { max: MAX_VARIANT_PRICE });
  }

  const decimalPart = trimmed.includes(".")
    ? (trimmed.split(".")[1] ?? "")
    : "";
  if (decimalPart.length > 2) {
    return t("form.variants.validation.priceDecimals");
  }

  return undefined;
}

export function validateFlatVariantRows(
  rows: FlatVariantRow[],
  t: (key: string, options?: Record<string, unknown>) => string,
): VariantFormErrors {
  const errors: VariantFormErrors = { rows: {} };
  const seen = new Map<string, string>();

  if (rows.length > MAX_VARIANTS_PER_PRODUCT) {
    errors.global = t("form.variants.validation.maxCount", {
      max: MAX_VARIANTS_PER_PRODUCT,
    });
  }

  rows.forEach((row) => {
    const rowErrors: { name?: string; price?: string } = {};
    const trimmedName = row.name.trim();

    if (!trimmedName) {
      rowErrors.name = t("form.variants.validation.nameRequired");
    } else if (trimmedName.length > MAX_VARIANT_NAME_LENGTH) {
      rowErrors.name = t("form.variants.validation.nameMax", {
        max: MAX_VARIANT_NAME_LENGTH,
      });
    } else {
      const normalized = trimmedName.toLocaleLowerCase();
      const duplicateRowId = seen.get(normalized);
      if (duplicateRowId) {
        rowErrors.name = t("form.variants.validation.duplicateName");
        if (!errors.rows![duplicateRowId]) {
          errors.rows![duplicateRowId] = {
            name: t("form.variants.validation.duplicateName"),
          };
        }
      } else {
        seen.set(normalized, row.id);
      }
    }

    const priceError = validateVariantPrice(row.price, t);
    if (priceError) {
      rowErrors.price = priceError;
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.rows![row.id] = rowErrors;
    }
  });

  if (Object.keys(errors.rows!).length === 0) {
    delete errors.rows;
  }

  return errors;
}

export function validateGeneratedVariantRows(
  rows: GeneratedVariantRow[],
  t: (key: string, options?: Record<string, unknown>) => string,
): VariantFormErrors {
  return validateFlatVariantRows(rows, t);
}

export function validateVariantAxes(
  axes: VariantAxis[],
  t: (key: string, options?: Record<string, unknown>) => string,
): VariantFormErrors {
  const errors: VariantFormErrors = {};
  const combinationCount = countAxisCombinations(axes);

  if (combinationCount > MAX_VARIANTS_PER_PRODUCT) {
    errors.global = t("form.variants.validation.combinationLimit", {
      count: combinationCount,
      max: MAX_VARIANTS_PER_PRODUCT,
    });
  }

  const hasEmptyAxis = axes.some((axis) => {
    const hasValues = axis.values.some((entry) => entry.value.trim());
    return !axis.name.trim() && hasValues;
  });

  if (hasEmptyAxis) {
    errors.global = t("form.variants.validation.axisNameRequired");
  }

  return errors;
}

export function hasVariantFormErrors(errors: VariantFormErrors): boolean {
  return Boolean(errors.global || (errors.rows && Object.keys(errors.rows).length > 0));
}

export function formatVariantPriceDisplay(
  price: number | null,
  sameAsProductLabel: string,
): string {
  if (price == null) return sameAsProductLabel;
  return String(price);
}

export { VARIANT_NAME_SEPARATOR, MAX_VARIANTS_PER_PRODUCT };
