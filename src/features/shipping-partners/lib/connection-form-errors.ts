import axios from "axios";
import type { FieldPath, UseFormSetError } from "react-hook-form";
import type {
  CarrierField,
  ConnectionFormValues,
} from "@/features/shipping-partners/types";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

const DUPLICATE_NAME_MARKERS = [
  "already have a connection with this name",
  "اتصال بهذا الاسم",
] as const;

const UNREADABLE_CREDENTIALS_MARKERS = [
  "can no longer be read",
  "لم يعد بالإمكان قراءة",
  "أدخلها مرة أخرى",
  "enter them again",
] as const;

export function isRequestCanceled(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (error instanceof Error && error.name === "CanceledError")
  );
}

export function isDuplicateNameConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return DUPLICATE_NAME_MARKERS.some((marker) => detail.includes(marker));
}

export function isUnreadableCredentials(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  if (isDuplicateNameConflict(error)) return false;
  const detail = parseApiError(error).detail.toLowerCase();
  return UNREADABLE_CREDENTIALS_MARKERS.some((marker) =>
    detail.includes(marker.toLowerCase()),
  );
}

export interface AppliedConnectionError {
  step?: 1 | 2;
  global?: string;
}

function assignFieldError(
  fieldName: string,
  message: string,
  fields: CarrierField[],
  setError: UseFormSetError<ConnectionFormValues>,
): 1 | 2 | undefined {
  if (fieldName === "name") {
    setError("name", { type: "server", message });
    return 2;
  }

  const field = fields.find((item) => item.key === fieldName);
  if (!field) return undefined;

  if (field.kind === "SECRET") {
    setError(`credentials.${field.key}` as FieldPath<ConnectionFormValues>, {
      type: "server",
      message,
    });
    return 1;
  }

  setError(`options.${field.key}` as FieldPath<ConnectionFormValues>, {
    type: "server",
    message,
  });
  return 2;
}

export function applyConnectionFieldErrors(
  error: unknown,
  fields: CarrierField[],
  setError: UseFormSetError<ConnectionFormValues>,
): AppliedConnectionError {
  const parsed = parseApiError(error);

  if (isUnreadableCredentials(error)) {
    return { step: 1, global: parsed.detail };
  }

  if (isDuplicateNameConflict(error)) {
    setError("name", { type: "server", message: parsed.detail });
    return { step: 2 };
  }

  if (parsed.field) {
    const step = assignFieldError(parsed.field, parsed.detail, fields, setError);
    if (step) return { step };
    return { global: parsed.detail };
  }

  const fieldErrors = getFieldErrors(error);
  if (fieldErrors) {
    let step: 1 | 2 | undefined;
    for (const [name, message] of Object.entries(fieldErrors)) {
      const next = assignFieldError(name, message, fields, setError);
      if (next === 1) step = 1;
      else if (!step) step = next;
    }
    if (step) return { step };
  }

  if (isApiError(error, 400) || isApiError(error, 409) || isApiError(error, 422)) {
    return { global: parsed.detail };
  }

  return { global: parsed.detail };
}
