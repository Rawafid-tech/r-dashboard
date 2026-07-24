import { AxiosError } from "axios";
import type { ApiError } from "@/shared/types/api";

export function parseApiError(error: unknown): ApiError {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiError;
    return {
      type: data.type || "about:blank",
      title: data.title || "Error",
      status: data.status || error.response.status,
      detail: data.detail || "An unexpected error occurred",
      instance: data.instance || "",
      errors: data.errors,
    };
  }

  return {
    type: "about:blank",
    title: "Network Error",
    status: 0,
    detail: "Unable to connect to the server. Please check your connection.",
    instance: "",
  };
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
