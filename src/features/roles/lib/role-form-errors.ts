import { AxiosError } from "axios";
import { getFieldErrors } from "@/shared/api/error-handler";

export type RoleApiErrorCode =
  | "auth.roleNotFound"
  | "auth.roleNameTaken"
  | "auth.unknownPermission"
  | "auth.roleInUse";

export function getApiErrorCode(error: unknown): string | null {
  if (!(error instanceof AxiosError) || !error.response?.data) return null;

  const data = error.response.data as Record<string, unknown>;

  if (typeof data.code === "string" && data.code.length > 0) {
    return data.code;
  }

  if (typeof data.type === "string") {
    const type = data.type;
    if (type.startsWith("auth.")) return type;

    const match = type.match(/(auth\.[A-Za-z]+)$/);
    const code = match?.[1];
    if (code) return code;
  }

  return null;
}

export function isRoleApiErrorCode(
  error: unknown,
  code: RoleApiErrorCode,
): boolean {
  return getApiErrorCode(error) === code;
}

export function applyRoleFieldErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name, { type: "server", message: reason });
  }
}

export function toRoleUpsertPayload(values: {
  name: string;
  description?: string;
  permissionIds: string[];
}) {
  const trimmedDescription = values.description?.trim() ?? "";

  return {
    name: values.name.trim(),
    description: trimmedDescription.length > 0 ? trimmedDescription : null,
    permissionIds: values.permissionIds,
  };
}
