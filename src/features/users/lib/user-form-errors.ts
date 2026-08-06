import { AxiosError } from "axios";
import { getFieldErrors } from "@/shared/api/error-handler";

export type UserApiErrorCode =
  | "auth.emailAlreadyUsed"
  | "auth.inviteQuotaExceeded"
  | "auth.verificationResendTooSoon"
  | "auth.accountAlreadyActivated"
  | "auth.ownerNotModifiable"
  | "auth.cannotDeleteSelf"
  | "auth.cannotGrantBeyondOwnPermissions"
  | "auth.roleNotAssignable"
  | "auth.userNotFound";

export function getUserApiErrorCode(error: unknown): string | null {
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

export function isUserApiErrorCode(
  error: unknown,
  code: UserApiErrorCode,
): boolean {
  return getUserApiErrorCode(error) === code;
}

export function applyUserFieldErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name, { type: "server", message: reason });
  }
}

export function toUpdateUserPayload(values: {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: string;
}) {
  const dob = values.dateOfBirth?.trim() ?? "";
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    dateOfBirth: dob.length > 0 ? dob : null,
  };
}

export function toInviteUserPayload(values: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId?: string;
}) {
  const roleId = values.roleId?.trim();
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    roleId: roleId && roleId.length > 0 ? roleId : null,
  };
}
