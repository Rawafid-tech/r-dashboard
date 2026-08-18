import type {
  Product,
  ProductPayload,
  ProductsListParams,
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

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>("/api/products", payload);
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
