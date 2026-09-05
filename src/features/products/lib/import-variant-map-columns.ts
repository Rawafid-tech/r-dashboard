import {
  IMPORT_VARIANT_FIELD_KEYS,
  type ImportTemplateColumn,
  type ImportVariantFieldKey,
} from "@/features/products/types";
import {
  matchHeaderToColumn,
  normalizeHeader,
} from "@/features/products/lib/import-map-columns";

export type VariantColumnMapping = Record<number, ImportVariantFieldKey | null>;

export function isImportVariantFieldKey(
  value: string,
): value is ImportVariantFieldKey {
  return (IMPORT_VARIANT_FIELD_KEYS as readonly string[]).includes(value);
}

export function autoMapVariantColumns(
  headers: string[],
  columns: ImportTemplateColumn[],
): VariantColumnMapping {
  const mapping: VariantColumnMapping = {};
  const usedKeys = new Set<ImportVariantFieldKey>();

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    let matched: ImportVariantFieldKey | null = null;

    for (const column of columns) {
      const candidates = [column.key, column.label, ...column.aliases];
      if (
        candidates.some((alias) => normalizeHeader(alias) === normalized) &&
        isImportVariantFieldKey(column.key)
      ) {
        matched = column.key;
        break;
      }
    }

    if (matched && !usedKeys.has(matched)) {
      mapping[index] = matched;
      usedKeys.add(matched);
      return;
    }

    mapping[index] = null;
  });

  return mapping;
}

export function getMappedVariantKeys(
  mapping: VariantColumnMapping,
): Set<ImportVariantFieldKey> {
  return new Set(
    Object.values(mapping).filter(
      (key): key is ImportVariantFieldKey => key !== null,
    ),
  );
}

export function getUnmappedRequiredVariantColumns(
  mapping: VariantColumnMapping,
  columns: ImportTemplateColumn[],
): ImportTemplateColumn[] {
  const mapped = getMappedVariantKeys(mapping);

  return columns.filter((column) => {
    if (!column.required) return false;
    return !mapped.has(column.key as ImportVariantFieldKey);
  });
}

export function assignVariantColumnMapping(
  mapping: VariantColumnMapping,
  columnIndex: number,
  nextKey: ImportVariantFieldKey | null,
): VariantColumnMapping {
  const next: VariantColumnMapping = { ...mapping };

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

export function matchVariantHeaderToColumn(
  header: string,
  columns: ImportTemplateColumn[],
): ImportVariantFieldKey | null {
  const key = matchHeaderToColumn(header, columns);
  return key && isImportVariantFieldKey(key) ? key : null;
}
