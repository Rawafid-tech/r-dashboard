import type {
  ProductCategory,
  ProductCategoryPayload,
} from "@/features/products/types";
import { apiClient } from "@/shared/api/client";

export async function getProductCategories(): Promise<ProductCategory[]> {
  const { data } = await apiClient.get<ProductCategory[]>(
    "/api/product-categories",
  );
  return data;
}

export async function createProductCategory(
  payload: ProductCategoryPayload,
): Promise<ProductCategory> {
  const { data } = await apiClient.post<ProductCategory>(
    "/api/product-categories",
    payload,
  );
  return data;
}

export async function updateProductCategory(
  id: string,
  payload: ProductCategoryPayload,
): Promise<ProductCategory> {
  const { data } = await apiClient.put<ProductCategory>(
    `/api/product-categories/${id}`,
    payload,
  );
  return data;
}

export async function deleteProductCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/product-categories/${id}`);
}
