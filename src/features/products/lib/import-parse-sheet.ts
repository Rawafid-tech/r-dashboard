import * as XLSX from "xlsx";
import { resolveHandlingValue } from "@/features/products/lib/import-handling-labels";
import { getMappedKeys, type ColumnMapping } from "@/features/products/lib/import-map-columns";
import {
  IMPORT_FIELD_KEYS,
  IMPORT_MAX_ROWS,
  IMPORT_MAX_VARIANT_ROWS,
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

export interface ParsedWorkbook {
  products: ParsedSheet | null;
  variants: ParsedSheet | null;
  isMultiSheet: boolean;
}

const PRODUCTS_SHEET_NAMES = ["products", "product", "منتجات"];
const VARIANTS_SHEET_NAMES = ["variants", "variant", "المتغيرات", "متغيرات"];

function normalizeSheetName(value: string): string {
  return value.trim().toLowerCase();
}

function findSheetName(
  workbook: XLSX.WorkBook,
  candidates: string[],
): string | undefined {
  for (const candidate of candidates) {
    const match = workbook.SheetNames.find(
      (name) => normalizeSheetName(name) === normalizeSheetName(candidate),
    );
    if (match) return match;
  }
  return undefined;
}

function extractSheetFromWorkbook(
  workbook: XLSX.WorkBook,
  sheetName: string,
  maxRows: number,
): ParsedSheet | null {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return null;

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: true,
  });

  if (matrix.length === 0) return null;

  let headerIndex = -1;
  for (let index = 0; index < matrix.length; index += 1) {
    if (!isBlankRow(matrix[index] ?? [])) {
      headerIndex = index;
      break;
    }
  }

  if (headerIndex < 0) return null;

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
    return {
      headers,
      rows: [],
      totalDataRows: 0,
      truncated: false,
    };
  }

  const truncated = dataRows.length > maxRows;

  return {
    headers,
    rows: truncated ? dataRows.slice(0, maxRows) : dataRows,
    totalDataRows: dataRows.length,
    truncated,
  };
}

function parseWorkbook(workbook: XLSX.WorkBook): ParsedWorkbook {
  const variantsSheet = findSheetName(workbook, VARIANTS_SHEET_NAMES);
  const productsSheet =
    findSheetName(workbook, PRODUCTS_SHEET_NAMES) ??
    workbook.SheetNames.find((name) => name !== variantsSheet);

  const products = productsSheet
    ? extractSheetFromWorkbook(workbook, productsSheet, IMPORT_MAX_ROWS)
    : null;

  const variants = variantsSheet
    ? extractSheetFromWorkbook(
        workbook,
        variantsSheet,
        IMPORT_MAX_VARIANT_ROWS,
      )
    : null;

  const hasProductRows = (products?.rows.length ?? 0) > 0;
  const hasVariantRows = (variants?.rows.length ?? 0) > 0;

  if (!hasProductRows && !hasVariantRows) {
    throw new SpreadsheetParseError("empty");
  }

  return {
    products,
    variants: hasVariantRows ? variants : null,
    isMultiSheet: Boolean(variantsSheet),
  };
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
  const parsed = parseWorkbook(workbook);
  if (!parsed.products?.rows.length) {
    throw new SpreadsheetParseError("empty");
  }
  return parsed.products;
}

export async function parseSpreadsheetWorkbook(
  file: File,
): Promise<ParsedWorkbook> {
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

      const products = extractSheet(workbook);
      return {
        products,
        variants: null,
        isMultiSheet: false,
      };
    }

    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: "array", raw: false });
    return parseWorkbook(workbook);
  } catch (error) {
    if (error instanceof SpreadsheetParseError) {
      throw error;
    }

    throw new SpreadsheetParseError("unreadable");
  }
}

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const workbook = await parseSpreadsheetWorkbook(file);
  if (!workbook.products?.rows.length) {
    throw new SpreadsheetParseError("empty");
  }
  return workbook.products;
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
