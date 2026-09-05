import ExcelJS from "exceljs";
import { getProductCategories } from "@/features/products/api/product-categories.api";
import { getProducts } from "@/features/products/api/products.api";
import { enumDisplayValue } from "@/features/products/lib/import-handling-labels";
import { findCategoryById } from "@/features/products/lib/category-tree-utils";
import {
  IMPORT_FIELD_KEYS,
  type ImportFieldKey,
  type ImportTemplateColumn,
  type Product,
  type ProductCategory,
} from "@/features/products/types";
import type { SupportedLocale } from "@/shared/lib/constants";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const CATALOG_PAGE_SIZE = 100;

function formatDecimal(value: number | null | undefined): string {
  if (value == null) return "";
  return String(value);
}

function buildCategoryPath(
  product: Product,
  categories: ProductCategory[],
): string {
  if (!product.categoryId) return "";

  const category = findCategoryById(categories, product.categoryId);
  if (!category) return product.categoryName ?? "";

  if (category.parentId) {
    const parent = findCategoryById(categories, category.parentId);
    if (parent) {
      return `${parent.name} > ${category.name}`;
    }
  }

  return category.name;
}

function productCellValue(
  product: Product,
  key: ImportFieldKey,
  categories: ProductCategory[],
  locale: SupportedLocale,
): string | number {
  switch (key) {
    case "name":
      return product.name;
    case "sku":
      return product.sku;
    case "barcode":
      return product.barcode ?? "";
    case "hsCode":
      return product.hsCode ?? "";
    case "description":
      return product.description ?? "";
    case "price":
      return product.price;
    case "weightKg":
      return product.weightKg;
    case "lengthCm":
      return formatDecimal(product.lengthCm);
    case "widthCm":
      return formatDecimal(product.widthCm);
    case "heightCm":
      return formatDecimal(product.heightCm);
    case "handling":
      return enumDisplayValue("handling", product.handling, locale);
    case "categoryPath":
      return buildCategoryPath(product, categories);
    default:
      return "";
  }
}

async function fetchAllProducts(): Promise<Product[]> {
  const products: Product[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const response = await getProducts({
      page,
      size: CATALOG_PAGE_SIZE,
      sort: "CREATED_AT",
      direction: "ASC",
    });

    products.push(...response.content);
    totalPages = response.totalPages;
    page += 1;
  }

  return products;
}

export async function downloadProductCatalog(
  columns: ImportTemplateColumn[],
  filename: string,
  locale: SupportedLocale,
): Promise<number> {
  const [categories, products] = await Promise.all([
    getProductCategories(),
    fetchAllProducts(),
  ]);

  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  const orderedKeys = IMPORT_FIELD_KEYS.filter((key) => columnByKey.has(key));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Rawafid";

  const sheet = workbook.addWorksheet("Products", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.addRow(orderedKeys.map((key) => columnByKey.get(key)?.label ?? key));

  for (const product of products) {
    sheet.addRow(
      orderedKeys.map((key) =>
        productCellValue(product, key, categories, locale),
      ),
    );
  }

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", wrapText: true };

  orderedKeys.forEach((key, index) => {
    const templateColumn = columnByKey.get(key);
    if (!templateColumn) return;
    sheet.getColumn(index + 1).width = Math.min(
      40,
      Math.max(16, templateColumn.label.length + 4),
    );
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: XLSX_MIME });
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }

  return products.length;
}
