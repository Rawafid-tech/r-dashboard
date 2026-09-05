import type { VariantColumnMapping } from "@/features/products/lib/import-variant-map-columns";
import type { ParsedSheet } from "@/features/products/lib/import-parse-sheet";
import {
  IMPORT_VARIANT_FIELD_KEYS,
  type ImportVariantFieldKey,
  type ImportVariantRow,
} from "@/features/products/types";

function isVariantField(key: string): key is ImportVariantFieldKey {
  return (IMPORT_VARIANT_FIELD_KEYS as readonly string[]).includes(key);
}

export function buildImportVariantRows(
  parsed: ParsedSheet,
  mapping: VariantColumnMapping,
): ImportVariantRow[] {
  return parsed.rows.map(({ rowNumber, cells }) => {
    const row: ImportVariantRow = { rowNumber };

    for (const [index, key] of Object.entries(mapping)) {
      if (!key || !isVariantField(key)) continue;

      const cell = cells[Number(index)];
      if (cell == null) continue;

      const trimmed = typeof cell === "string" ? cell.trim() : cell;
      if (trimmed === "") continue;

      row[key] = trimmed as never;
    }

    return row;
  });
}
