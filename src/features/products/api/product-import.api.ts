import type {
  ImportRequest,
  ImportResult,
  ImportTemplateColumn,
} from "@/features/products/types";
import { apiClient } from "@/shared/api/client";

export async function getImportTemplate(): Promise<ImportTemplateColumn[]> {
  const { data } = await apiClient.get<ImportTemplateColumn[]>(
    "/api/products/import/template",
  );
  return data;
}

export async function importProducts(
  payload: ImportRequest,
): Promise<ImportResult> {
  const { data } = await apiClient.post<ImportResult>(
    "/api/products/import",
    payload,
  );
  return data;
}
