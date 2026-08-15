import type { UseFormSetError } from "react-hook-form";
import type { ShippingBoxFormValues } from "@/features/shipping-boxes/schema";
import type { ShippingBox, ShippingBoxPayload } from "@/features/shipping-boxes/types";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

const DUPLICATE_NAME_MARKERS = [
  "already have a shipping box with this name",
  "لديك بالفعل صندوق شحن بهذا الاسم",
] as const;

const CONCURRENT_DEFAULT_MARKERS = [
  "default box was changed at the same time",
  "تم تغيير الصندوق الافتراضي في نفس الوقت",
] as const;

export function isDuplicateNameConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return DUPLICATE_NAME_MARKERS.some((marker) => detail.includes(marker));
}

export function isConcurrentDefaultConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return CONCURRENT_DEFAULT_MARKERS.some((marker) => detail.includes(marker));
}

export function toShippingBoxPayload(
  values: ShippingBoxFormValues,
): ShippingBoxPayload {
  return {
    name: values.name.trim(),
    lengthCm: Number(values.lengthCm),
    widthCm: Number(values.widthCm),
    heightCm: Number(values.heightCm),
    isDefault: values.isDefault,
  };
}

export function toShippingBoxFormValues(
  box: ShippingBox,
): ShippingBoxFormValues {
  return {
    name: box.name,
    lengthCm: String(box.lengthCm),
    widthCm: String(box.widthCm),
    heightCm: String(box.heightCm),
    isDefault: box.isDefault,
  };
}

export function applyShippingBoxFieldErrors(
  error: unknown,
  setError: UseFormSetError<ShippingBoxFormValues>,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  Object.entries(fieldErrors).forEach(([name, message]) => {
    if (name in EMPTY_FIELD_KEYS) {
      setError(name as keyof ShippingBoxFormValues, {
        type: "server",
        message,
      });
    }
  });
}

const EMPTY_FIELD_KEYS: Record<keyof ShippingBoxFormValues, true> = {
  name: true,
  lengthCm: true,
  widthCm: true,
  heightCm: true,
  isDefault: true,
};

export function handleShippingBoxFormError(
  error: unknown,
  setError: UseFormSetError<ShippingBoxFormValues>,
) {
  if (isDuplicateNameConflict(error)) {
    setError("name", {
      type: "server",
      message: parseApiError(error).detail,
    });
    return;
  }

  applyShippingBoxFieldErrors(error, setError);
}
