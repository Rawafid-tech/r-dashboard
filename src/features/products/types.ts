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

export const VARIANT_NAME_SEPARATOR = " / " as const;
export const MAX_VARIANTS_PER_PRODUCT = 100;
export const MAX_VARIANT_NAME_LENGTH = 100;
export const MAX_VARIANT_PRICE = 9999999999.99;

export interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  sortOrder: number;
}

export interface VariantRequest {
  name: string;
  price?: number | null;
}

export interface ReplaceVariantsPayload {
  variants: VariantRequest[];
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
  variants: ProductVariant[];
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

export interface CreateProductPayload extends ProductPayload {
  variants?: VariantRequest[];
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

export type ProductsTab = "products" | "categories" | "import";

export const IMPORT_FIELD_KEYS = [
  "name",
  "sku",
  "barcode",
  "hsCode",
  "description",
  "price",
  "weightKg",
  "lengthCm",
  "widthCm",
  "heightCm",
  "handling",
  "categoryPath",
] as const;

export type ImportFieldKey = (typeof IMPORT_FIELD_KEYS)[number];

export type ImportColumnType = "TEXT" | "DECIMAL" | "ENUM";

export interface ImportTemplateColumn {
  key: string;
  label: string;
  required: boolean;
  type: ImportColumnType;
  example: string | null;
  defaultValue: string | null;
  allowedValues: string[];
  aliases: string[];
}

export interface ImportRow {
  rowNumber: number;
  name?: string;
  sku?: string;
  barcode?: string;
  hsCode?: string;
  description?: string;
  price?: string | number;
  weightKg?: string | number;
  lengthCm?: string | number;
  widthCm?: string | number;
  heightCm?: string | number;
  handling?: string;
  categoryPath?: string;
}

export type ImportMode = "INSERT_ONLY" | "UPSERT";

export interface ImportRequest {
  dryRun: boolean;
  rows: ImportRow[];
  /** Omit for insert-only imports; send `"UPSERT"` for bulk updates. */
  mode?: "UPSERT";
  /** Required with `UPSERT`; must not be sent for insert-only imports. */
  columns?: ImportFieldKey[];
}

export interface ImportRowError {
  row: number | null;
  name: string | null;
  reason: string;
}

export interface ImportResult {
  dryRun: boolean;
  totalRows: number;
  created: number;
  updatedSkus: string[];
  newCategories: string[];
  errors: ImportRowError[];
}

export const IMPORT_MAX_ROWS = 1000;
export const IMPORT_MAX_VARIANT_ROWS = 5000;

export const IMPORT_VARIANT_FIELD_KEYS = [
  "productSku",
  "variantName",
  "variantPrice",
] as const;

export type ImportVariantFieldKey =
  (typeof IMPORT_VARIANT_FIELD_KEYS)[number];

export interface ImportVariantRow {
  rowNumber: number;
  productSku?: string;
  variantName?: string;
  variantPrice?: string | number;
}

export interface ImportVariantError {
  row: number | null;
  productSku: string | null;
  reason: string;
}

export interface ImportVariantPreview {
  totalRows: number;
  productCount: number;
  errors: ImportVariantError[];
}

export interface ImportVariantCommitResult {
  totalRows: number;
  productsUpdated: number;
  variantsApplied: number;
  errors: ImportVariantError[];
}
