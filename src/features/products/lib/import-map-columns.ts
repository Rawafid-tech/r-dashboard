import {
  IMPORT_FIELD_KEYS,
  type ImportFieldKey,
  type ImportTemplateColumn,
} from "@/features/products/types";

export type ColumnMapping = Record<number, ImportFieldKey | null>;

export function isImportFieldKey(value: string): value is ImportFieldKey {
  return (IMPORT_FIELD_KEYS as readonly string[]).includes(value);
}

export function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchHeaderToColumn(
  header: string,
  columns: ImportTemplateColumn[],
): ImportFieldKey | null {
  const normalized = normalizeHeader(header);
  if (!normalized) return null;

  for (const column of columns) {
    const candidates = [column.key, column.label, ...column.aliases];
    if (candidates.some((alias) => normalizeHeader(alias) === normalized)) {
      return isImportFieldKey(column.key) ? column.key : null;
    }
  }

  return null;
}

export function autoMapColumns(
  headers: string[],
  columns: ImportTemplateColumn[],
): ColumnMapping {
  const mapping: ColumnMapping = {};
  const usedKeys = new Set<ImportFieldKey>();

  headers.forEach((header, index) => {
    const key = matchHeaderToColumn(header, columns);
    if (key && !usedKeys.has(key)) {
      mapping[index] = key;
      usedKeys.add(key);
      return;
    }

    mapping[index] = null;
  });

  return mapping;
}

export function getMappedKeys(mapping: ColumnMapping): Set<ImportFieldKey> {
  return new Set(
    Object.values(mapping).filter((key): key is ImportFieldKey => key !== null),
  );
}

export function getUnmappedRequiredColumns(
  mapping: ColumnMapping,
  columns: ImportTemplateColumn[],
  applyDefaultHandling: boolean,
): ImportTemplateColumn[] {
  const mapped = getMappedKeys(mapping);

  return columns.filter((column) => {
    if (!column.required) return false;
    if (column.key === "handling" && applyDefaultHandling) return false;
    return !mapped.has(column.key as ImportFieldKey);
  });
}

export function hasHandlingMapped(mapping: ColumnMapping): boolean {
  return Object.values(mapping).includes("handling");
}

export function isSkuMapped(mapping: ColumnMapping): boolean {
  return getMappedKeys(mapping).has("sku");
}

export function getUnmappedRequiredForMode(
  mapping: ColumnMapping,
  columns: ImportTemplateColumn[],
  mode: "INSERT_ONLY" | "UPSERT",
  applyDefaultHandling: boolean,
): ImportTemplateColumn[] {
  if (mode === "UPSERT") {
    if (isSkuMapped(mapping)) return [];
    const skuColumn = columns.find((column) => column.key === "sku");
    return skuColumn ? [skuColumn] : [];
  }

  return getUnmappedRequiredColumns(
    mapping,
    columns,
    applyDefaultHandling,
  );
}

export function assignColumnMapping(
  mapping: ColumnMapping,
  columnIndex: number,
  nextKey: ImportFieldKey | null,
): ColumnMapping {
  const next: ColumnMapping = { ...mapping };

  if (nextKey) {
    for (const [index, key] of Object.entries(next)) {
      if (key === nextKey && Number(index) !== columnIndex) {
        next[Number(index)] = null;
      }
    }
  }

  next[columnIndex] = nextKey;
  return next;
}
