import { getMappedKeys, type ColumnMapping } from "@/features/products/lib/import-map-columns";
import type {
  ImportFieldKey,
  ImportMode,
  ImportRequest,
  ImportRow,
} from "@/features/products/types";

export interface BuildImportRequestInput {
  dryRun: boolean;
  mode: ImportMode;
  mapping: ColumnMapping;
  rows: ImportRow[];
}

export function buildImportRequest({
  dryRun,
  mode,
  mapping,
  rows,
}: BuildImportRequestInput): ImportRequest {
  const request: ImportRequest = { dryRun, rows };

  if (mode === "UPSERT") {
    request.mode = "UPSERT";
    request.columns = [...getMappedKeys(mapping)].sort((a, b) =>
      a.localeCompare(b),
    ) as ImportFieldKey[];
  }

  return request;
}
