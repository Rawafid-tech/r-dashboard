import ExcelJS from "exceljs";
import { enumDisplayValue } from "@/features/products/lib/import-handling-labels";
import { IMPORT_MAX_ROWS } from "@/features/products/types";
import type { ImportTemplateColumn } from "@/features/products/types";
import type { SupportedLocale } from "@/shared/lib/constants";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export interface ImportTemplateMessages {
  enumErrorTitle: string;
  enumError: string;
  enumPrompt: string;
}

function displayValues(
  column: ImportTemplateColumn,
  locale: SupportedLocale,
): string[] {
  if (!isEnumColumn(column)) return [];
  return column.allowedValues.map((value) =>
    enumDisplayValue(column.key, value, locale),
  );
}

function columnWidth(
  column: ImportTemplateColumn,
  locale: SupportedLocale,
): number {
  const candidates = [
    column.label,
    enumDisplayValue(column.key, column.example ?? "", locale),
    enumDisplayValue(column.key, column.defaultValue ?? "", locale),
    ...displayValues(column, locale),
  ];
  return Math.min(40, Math.max(16, ...candidates.map((value) => value.length + 2)));
}

function columnLetter(index: number): string {
  let position = index + 1;
  let name = "";

  while (position > 0) {
    const remainder = (position - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    position = Math.floor((position - 1) / 26);
  }

  return name;
}

function isEnumColumn(column: ImportTemplateColumn): boolean {
  return column.type === "ENUM" && column.allowedValues.length > 0;
}

export async function downloadImportTemplate(
  columns: ImportTemplateColumn[],
  filename: string,
  messages: ImportTemplateMessages,
  locale: SupportedLocale,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Rawafid";

  const products = workbook.addWorksheet("Products", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  products.addRow(columns.map((column) => column.label));
  products.addRow(
    columns.map((column) =>
      enumDisplayValue(
        column.key,
        column.example ?? column.defaultValue ?? "",
        locale,
      ),
    ),
  );

  const headerRow = products.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", wrapText: true };

  columns.forEach((column, index) => {
    const sheetColumn = products.getColumn(index + 1);
    sheetColumn.width = columnWidth(column, locale);
  });

  const lists = workbook.addWorksheet("Lists");
  let listColumnIndex = 0;

  columns.forEach((column, index) => {
    if (!isEnumColumn(column)) return;

    listColumnIndex += 1;
    const listLetter = columnLetter(listColumnIndex - 1);
    lists.getColumn(listColumnIndex).width = 18;
    lists.getCell(1, listColumnIndex).value = column.label;
    lists.getCell(1, listColumnIndex).font = { bold: true };

    const labels = displayValues(column, locale);
    labels.forEach((label, valueIndex) => {
      lists.getCell(valueIndex + 2, listColumnIndex).value = label;
    });

    const lastListRow = labels.length + 1;
    const source = `Lists!$${listLetter}$2:$${listLetter}$${lastListRow}`;
    const lastDataRow = IMPORT_MAX_ROWS + 1;

    const validation: ExcelJS.DataValidation = {
      type: "list",
      allowBlank: !column.required,
      formulae: [source],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: messages.enumErrorTitle,
      error: messages.enumError,
      showInputMessage: true,
      promptTitle: column.label,
      prompt: messages.enumPrompt,
    };

    for (let row = 2; row <= lastDataRow; row += 1) {
      products.getCell(row, index + 1).dataValidation = validation;
    }
  });

  lists.state = "hidden";

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
}
