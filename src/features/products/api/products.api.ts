import type {
  CreateProductPayload,
  Product,
  ProductPayload,
  ProductVariant,
  ProductsListParams,
  ReplaceVariantsPayload,
} from "@/features/products/types";
import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";

export async function getProducts(
  params: ProductsListParams = {},
): Promise<PaginatedResponse<Product>> {
  const { data } = await apiClient.get<PaginatedResponse<Product>>(
    "/api/products",
    { params },
  );
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/api/products/${id}`);
  return data;
}

export async function getProductsByBarcode(
  barcode: string,
): Promise<Product[]> {
  const trimmed = barcode.trim();
  const { data } = await apiClient.get<Product[]>(
    `/api/products/by-barcode/${encodeURIComponent(trimmed)}`,
  );
  return data;
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const { data } = await apiClient.post<Product>("/api/products", payload);
  return data;
}

export async function replaceProductVariants(
  id: string,
  payload: ReplaceVariantsPayload,
): Promise<ProductVariant[]> {
  const { data } = await apiClient.put<ProductVariant[]>(
    `/api/products/${id}/variants`,
    payload,
  );
  return data;
}

export async function updateProduct(
  id: string,
  payload: ProductPayload,
): Promise<Product> {
  const { data } = await apiClient.put<Product>(
    `/api/products/${id}`,
    payload,
  );
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}
