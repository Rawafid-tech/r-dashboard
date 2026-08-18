import type { ProductFormValues } from "@/features/products/schema";
import type { Product, ProductPayload } from "@/features/products/types";
import { roundDimensionInput } from "@/features/shipping-boxes/lib/format-dimension";

function optionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function roundDecimal(value: string, decimals: number): number {
  const parsed = Number(value.trim());
  const factor = 10 ** decimals;
  return Math.round(parsed * factor) / factor;
}

export function toProductPayload(values: ProductFormValues): ProductPayload {
  const payload: ProductPayload = {
    name: values.name.trim(),
    sku: values.sku.trim(),
    price: roundDecimal(values.price, 2),
    weightKg: roundDecimal(values.weightKg, 3),
    handling: values.handling,
  };

  const barcode = optionalString(values.barcode);
  if (barcode) payload.barcode = barcode;

  const hsCode = optionalString(values.hsCode);
  if (hsCode) payload.hsCode = hsCode;

  const description = optionalString(values.description);
  if (description) payload.description = description;

  const lengthCm = values.lengthCm.trim();
  const widthCm = values.widthCm.trim();
  const heightCm = values.heightCm.trim();

  if (lengthCm && widthCm && heightCm) {
    payload.lengthCm = Number(roundDimensionInput(lengthCm));
    payload.widthCm = Number(roundDimensionInput(widthCm));
    payload.heightCm = Number(roundDimensionInput(heightCm));
  }

  const categoryId = optionalString(values.categoryId);
  if (categoryId) payload.categoryId = categoryId;

  const imageMediaId = optionalString(values.imageMediaId);
  if (imageMediaId) payload.imageMediaId = imageMediaId;

  return payload;
}

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    barcode: product.barcode ?? "",
    hsCode: product.hsCode ?? "",
    description: product.description ?? "",
    price: String(product.price),
    weightKg: String(product.weightKg),
    lengthCm: product.lengthCm != null ? String(product.lengthCm) : "",
    widthCm: product.widthCm != null ? String(product.widthCm) : "",
    heightCm: product.heightCm != null ? String(product.heightCm) : "",
    handling: product.handling,
    categoryId: product.categoryId ?? "",
    imageMediaId: product.imageMediaId ?? "",
  };
}
