import { AxiosError } from "axios";
import type { ImportRowError } from "@/features/products/types";

interface ImportErrorBody {
  errors?: Array<{
    row?: number | null;
    name?: string | null;
    reason?: string;
  }>;
}

export function extractImportErrors(error: unknown): ImportRowError[] {
  if (!(error instanceof AxiosError) || !error.response?.data) {
    return [];
  }

  const data = error.response.data as ImportErrorBody;
  if (!data.errors?.length) return [];

  return data.errors.map((err) => ({
    row: typeof err.row === "number" ? err.row : null,
    name: err.name ?? null,
    reason: err.reason ?? "",
  }));
}

export function groupImportErrors(errors: ImportRowError[]): {
  fileErrors: ImportRowError[];
  rowErrors: Map<number, ImportRowError[]>;
} {
  const fileErrors: ImportRowError[] = [];
  const rowErrors = new Map<number, ImportRowError[]>();

  for (const error of errors) {
    if (error.row == null) {
      fileErrors.push(error);
      continue;
    }

    const list = rowErrors.get(error.row) ?? [];
    list.push(error);
    rowErrors.set(error.row, list);
  }

  return { fileErrors, rowErrors };
}

export function fieldErrorReason(
  errors: ImportRowError[] | undefined,
  field: string | null,
): string | undefined {
  return errors?.find((error) => error.name === field)?.reason;
}
