import type { UseFormSetError } from "react-hook-form";
import type { ProductFormValues } from "@/features/products/schema";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

const DUPLICATE_SKU_MARKERS = [
  "already have a product with this SKU",
  "لديك بالفعل منتج بنفس رمز التخزين",
] as const;

export function isDuplicateSkuConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return DUPLICATE_SKU_MARKERS.some((marker) => detail.includes(marker));
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
) {
  if (isDuplicateSkuConflict(error)) {
    setError("sku", {
      type: "server",
      message: parseApiError(error).detail,
    });
    return;
  }

  applyProductFieldErrors(error, setError);
}
