import type { UseFormSetError } from "react-hook-form";
import type { ProductFormValues } from "@/features/products/schema";
import type { VariantFormErrors } from "@/features/products/lib/product-variants";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

const DUPLICATE_SKU_MARKERS = [
  "already have a product with this SKU",
  "لديك بالفعل منتج بنفس رمز التخزين",
] as const;

const DUPLICATE_VARIANT_NAME_MARKERS = [
  "already has a variant with this name",
  "يحتوي بالفعل على متغير بنفس الاسم",
] as const;

export function isDuplicateSkuConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return DUPLICATE_SKU_MARKERS.some((marker) => detail.includes(marker));
}

export function isDuplicateVariantNameConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return DUPLICATE_VARIANT_NAME_MARKERS.some((marker) =>
    detail.includes(marker),
  );
}

export function isVariantsFieldError(error: unknown): boolean {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return false;
  return Object.keys(fieldErrors).some(
    (name) => name === "variants" || name.startsWith("variants["),
  );
}

const VARIANT_FIELD_PATTERN =
  /^variants\[(\d+)\]\.(name|price)$/;

export function mapVariantFieldErrors(
  error: unknown,
  rowIds: string[],
): VariantFormErrors {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return {};

  const mapped: VariantFormErrors = { rows: {} };

  Object.entries(fieldErrors).forEach(([name, message]) => {
    if (name === "variants") {
      mapped.global = message;
      return;
    }

    const match = name.match(VARIANT_FIELD_PATTERN);
    if (!match) return;

    const index = Number(match[1]);
    const field = match[2] as "name" | "price";
    const rowId = rowIds[index];
    if (!rowId) return;

    if (!mapped.rows![rowId]) {
      mapped.rows![rowId] = {};
    }
    mapped.rows![rowId][field] = message;
  });

  if (Object.keys(mapped.rows!).length === 0) {
    delete mapped.rows;
  }

  return mapped;
}

export function applyDuplicateVariantNameError(
  error: unknown,
): VariantFormErrors {
  return { global: parseApiError(error).detail };
}

const FORM_FIELD_KEYS: Record<keyof ProductFormValues, true> = {
  name: true,
  sku: true,
  barcode: true,
  hsCode: true,
  description: true,
  price: true,
  weightKg: true,
  lengthCm: true,
  widthCm: true,
  heightCm: true,
  handling: true,
  categoryId: true,
  imageMediaId: true,
};

export function applyProductFieldErrors(
  error: unknown,
  setError: UseFormSetError<ProductFormValues>,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  Object.entries(fieldErrors).forEach(([name, message]) => {
    if (name === "dimensionSetComplete") {
      setError("lengthCm", { type: "server", message });
      setError("widthCm", { type: "server", message });
      setError("heightCm", { type: "server", message });
      return;
    }

    if (name in FORM_FIELD_KEYS) {
      setError(name as keyof ProductFormValues, {
        type: "server",
        message,
      });
    }
  });
}

export function handleProductFormError(
  error: unknown,
  setError: UseFormSetError<ProductFormValues>,
): boolean {
  if (isDuplicateSkuConflict(error)) {
    setError("sku", {
      type: "server",
      message: parseApiError(error).detail,
    });
    return true;
  }

  if (isVariantsFieldError(error)) {
    return false;
  }

  applyProductFieldErrors(error, setError);
  return true;
}

export function handleVariantFormError(
  error: unknown,
  rowIds: string[],
): VariantFormErrors {
  if (isDuplicateVariantNameConflict(error)) {
    return applyDuplicateVariantNameError(error);
  }

  const mapped = mapVariantFieldErrors(error, rowIds);
  if (hasMappedVariantErrors(mapped)) {
    return mapped;
  }

  return { global: parseApiError(error).detail };
}

function hasMappedVariantErrors(errors: VariantFormErrors): boolean {
  return Boolean(errors.global || (errors.rows && Object.keys(errors.rows).length > 0));
}
