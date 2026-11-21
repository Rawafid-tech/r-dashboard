import { AxiosError } from "axios";
import i18next from "i18next";
import type { ApiError } from "@/shared/types/api";

/**
 * Fallback messages in the user's language (the app's i18next instance). These used to be hard-coded
 * English, which Arabic users saw in toasts whenever the server sent no `detail`.
 */
function fallbackDetail(status: number): string {
  if (status >= 500) return i18next.t("common:errors.serverError");
  if (status === 429) return i18next.t("common:errors.rateLimited");
  if (status === 403) return i18next.t("common:errors.forbidden");
  if (status === 404) return i18next.t("common:errors.notFound");
  return i18next.t("common:errors.unexpected");
}

export function parseApiError(error: unknown): ApiError {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiError;
    const status = data.status || error.response.status;
    return {
      type: data.type || "about:blank",
      title: data.title || "Error",
      status,
      detail: data.detail || fallbackDetail(status),
      instance: data.instance || "",
      field: typeof data.field === "string" ? data.field : undefined,
      errors: data.errors,
    };
  }

  return {
    type: "about:blank",
    title: "Network Error",
    status: 0,
    detail: i18next.t("common:errors.networkError"),
    instance: "",
  };
}

/**
 * Requests with `responseType: "blob"` (label PDFs) receive their JSON error body as a Blob, so the
 * server's message (e.g. "Only booked shipments have labels") was lost. Turn it back into JSON.
 */
export async function withJsonErrorBody(error: unknown): Promise<never> {
  if (error instanceof AxiosError && error.response?.data instanceof Blob) {
    try {
      error.response.data = JSON.parse(await error.response.data.text());
    } catch {
      // Not JSON: leave it; parseApiError falls back to a generic message.
    }
  }
  throw error;
}

export function getFieldErrors(
  error: unknown,
): Record<string, string> | null {
  const apiError = parseApiError(error);
  if (!apiError.errors?.length) return null;

  const fieldErrors: Record<string, string> = {};
  for (const err of apiError.errors) {
    fieldErrors[err.name] = err.reason;
  }
  return fieldErrors;
}

export function isApiError(error: unknown, status: number): boolean {
  return error instanceof AxiosError && error.response?.status === status;
}
