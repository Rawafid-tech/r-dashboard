import type { FieldPath, UseFormSetError } from "react-hook-form";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

export interface AdminCarrierFormValues {
  code: string;
  platform: string;
  nameEn: string;
  nameAr: string;
  sortOrder: string;
  settings: Record<string, string>;
}

const TOP_LEVEL_FIELD_KEYS = new Set([
  "code",
  "nameEn",
  "nameAr",
  "sortOrder",
  "platform",
]);

function assignFieldError(
  fieldName: string,
  message: string,
  setError: UseFormSetError<AdminCarrierFormValues>,
): boolean {
  if (fieldName === "code") {
    setError("code", { type: "server", message });
    return true;
  }
  if (fieldName === "nameEn" || fieldName === "nameAr" || fieldName === "sortOrder") {
    setError(fieldName, { type: "server", message });
    return true;
  }
  if (!TOP_LEVEL_FIELD_KEYS.has(fieldName)) {
    setError(`settings.${fieldName}` as FieldPath<AdminCarrierFormValues>, {
      type: "server",
      message,
    });
    return true;
  }
  return false;
}

export function applyAdminCarrierFieldErrors(
  error: unknown,
  setError: UseFormSetError<AdminCarrierFormValues>,
): string | undefined {
  const parsed = parseApiError(error);

  if (parsed.field) {
    if (assignFieldError(parsed.field, parsed.detail, setError)) {
      return undefined;
    }
    return parsed.detail;
  }

  const fieldErrors = getFieldErrors(error);
  if (fieldErrors) {
    let hasField = false;
    for (const [name, message] of Object.entries(fieldErrors)) {
      if (assignFieldError(name, message, setError)) {
        hasField = true;
      }
    }
    if (hasField) return undefined;
  }

  if (isApiError(error, 400) || isApiError(error, 409) || isApiError(error, 422)) {
    return parsed.detail;
  }

  return parsed.detail;
}
