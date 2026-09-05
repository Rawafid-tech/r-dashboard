import * as XLSX from "xlsx";
import { resolveHandlingValue } from "@/features/products/lib/import-handling-labels";
import { getMappedKeys, type ColumnMapping } from "@/features/products/lib/import-map-columns";
import {
  IMPORT_FIELD_KEYS,
  IMPORT_MAX_ROWS,
  type ImportFieldKey,
  type ImportRow,
} from "@/features/products/types";

export const SPREADSHEET_ACCEPT =
  ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;

export type SpreadsheetParseCode = "invalidType" | "empty" | "unreadable";

export class SpreadsheetParseError extends Error {
  constructor(readonly code: SpreadsheetParseCode) {
    super(code);
    this.name = "SpreadsheetParseError";
  }
}

export interface ParsedSheetRow {
  rowNumber: number;
  cells: Array<string | number>;
}

export interface ParsedSheet {
  headers: string[];
  rows: ParsedSheetRow[];
  totalDataRows: number;
  truncated: boolean;
}

export function isAcceptedSpreadsheet(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function detectCsvSeparator(text: string): string {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

function isBlankRow(cells: unknown[]): boolean {
  return cells.every((cell) => String(cell ?? "").trim() === "");
}

function toCellValue(cell: unknown): string | number {
  if (typeof cell === "number" && Number.isFinite(cell)) {
    return cell;
  }

  return String(cell ?? "");
}

function extractSheet(workbook: XLSX.WorkBook): ParsedSheet {
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new SpreadsheetParseError("empty");
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new SpreadsheetParseError("empty");
  }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: true,
  });

  let headerIndex = -1;
  for (let index = 0; index < matrix.length; index += 1) {
    if (!isBlankRow(matrix[index] ?? [])) {
      headerIndex = index;
      break;
    }
  }

  if (headerIndex < 0) {
    throw new SpreadsheetParseError("empty");
  }

  const headers = (matrix[headerIndex] ?? []).map((cell) =>
    String(cell ?? "").trim(),
  );

  const dataRows: ParsedSheetRow[] = [];
  for (let index = headerIndex + 1; index < matrix.length; index += 1) {
    const raw = matrix[index] ?? [];
    if (isBlankRow(raw)) continue;

    dataRows.push({
      rowNumber: index + 1,
      cells: raw.map(toCellValue),
    });
  }

  if (dataRows.length === 0) {
    throw new SpreadsheetParseError("empty");
  }

  const truncated = dataRows.length > IMPORT_MAX_ROWS;

  return {
    headers,
    rows: truncated ? dataRows.slice(0, IMPORT_MAX_ROWS) : dataRows,
    totalDataRows: dataRows.length,
    truncated,
  };
}

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  if (!isAcceptedSpreadsheet(file)) {
    throw new SpreadsheetParseError("invalidType");
  }

  try {
    const name = file.name.toLowerCase();
    let workbook: XLSX.WorkBook;

    if (name.endsWith(".csv")) {
      const text = await file.text();
      workbook = XLSX.read(text, {
        type: "string",
        FS: detectCsvSeparator(text),
        raw: false,
      });
    } else {
      const buffer = await file.arrayBuffer();
      workbook = XLSX.read(buffer, { type: "array", raw: false });
    }

    return extractSheet(workbook);
  } catch (error) {
    if (error instanceof SpreadsheetParseError) {
      throw error;
    }

    throw new SpreadsheetParseError("unreadable");
  }
}

function isImportField(key: string): key is ImportFieldKey {
  return (IMPORT_FIELD_KEYS as readonly string[]).includes(key);
}

export function buildImportRows(
  parsed: ParsedSheet,
  mapping: ColumnMapping,
  applyDefaultHandling: boolean,
): ImportRow[] {
  const mappedKeys = getMappedKeys(mapping);

  return parsed.rows.map(({ rowNumber, cells }) => {
    const row: ImportRow = { rowNumber };

    for (const [index, key] of Object.entries(mapping)) {
      if (!key || !isImportField(key)) continue;

      const cell = cells[Number(index)];
      if (cell == null) continue;

      const trimmed = typeof cell === "string" ? cell.trim() : cell;
      if (trimmed === "") continue;

      if (key === "handling" && typeof trimmed === "string") {
        row.handling = resolveHandlingValue(trimmed);
        continue;
      }

      row[key] = trimmed as never;
    }

    if (
      applyDefaultHandling &&
      !mappedKeys.has("handling") &&
      (row.handling == null || row.handling === "")
    ) {
      row.handling = "GENERAL";
    }

    return row;
  });
}
