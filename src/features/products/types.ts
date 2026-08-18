export const PRODUCT_HANDLING_VALUES = [
  "GENERAL",
  "FRAGILE",
  "LIQUID",
  "BATTERY",
  "FLAMMABLE",
] as const;

export type ProductHandling = (typeof PRODUCT_HANDLING_VALUES)[number];

export type ProductsSortField =
  | "CREATED_AT"
  | "NAME"
  | "SKU"
  | "PRICE"
  | "WEIGHT_KG";

export interface ProductsListParams {
  page?: number;
  size?: number;
  sort?: ProductsSortField;
  direction?: "ASC" | "DESC";
  search?: string;
  handling?: ProductHandling;
  categoryId?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  hsCode: string | null;
  description: string | null;
  price: number;
  weightKg: number;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  handling: ProductHandling;
  imageMediaId: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  sku: string;
  price: number;
  weightKg: number;
  handling: ProductHandling;
  barcode?: string;
  hsCode?: string;
  description?: string;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  imageMediaId?: string;
  categoryId?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  parentId: string | null;
  productCount: number;
  children: ProductCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryPayload {
  name: string;
  parentId?: string | null;
}

export type ProductsTab = "products" | "categories";
