import type { ProductCategory } from "@/features/products/types";

export interface FlatCategoryOption {
  id: string;
  name: string;
  depth: 0 | 1;
  parentName?: string;
}

export function flattenCategoryTree(
  categories: ProductCategory[],
): FlatCategoryOption[] {
  const result: FlatCategoryOption[] = [];

  for (const parent of categories) {
    result.push({ id: parent.id, name: parent.name, depth: 0 });
    for (const child of parent.children) {
      result.push({
        id: child.id,
        name: child.name,
        depth: 1,
        parentName: parent.name,
      });
    }
  }

  return result;
}

export function getTopLevelCategories(
  categories: ProductCategory[],
): ProductCategory[] {
  return categories.filter((category) => category.parentId == null);
}

export function getParentPickerOptions(
  categories: ProductCategory[],
  excludeId?: string,
): ProductCategory[] {
  return getTopLevelCategories(categories).filter(
    (category) =>
      category.id !== excludeId && category.children.length === 0,
  );
}

export function findCategoryById(
  categories: ProductCategory[],
  id: string,
): ProductCategory | undefined {
  for (const parent of categories) {
    if (parent.id === id) return parent;
    const child = parent.children.find((item) => item.id === id);
    if (child) return child;
  }

  return undefined;
}

export function categoryHasChildren(category: ProductCategory): boolean {
  return category.children.length > 0;
}
