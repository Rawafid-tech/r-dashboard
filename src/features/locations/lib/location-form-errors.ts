import { getFieldErrors } from "@/shared/api/error-handler";
import type { SenderLocationPayload } from "@/features/locations/types";
import type { LocationFormValues } from "@/features/locations/schema";

const COORDINATE_PAIR_ERROR = "coordinatePairComplete";

export function applyLocationFieldErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    if (name === COORDINATE_PAIR_ERROR) {
      setError("root.coordinatePairComplete", { type: "server", message: reason });
      continue;
    }

    setError(name, { type: "server", message: reason });
  }
}

function optionalTrimmed(value: string | undefined): string | undefined {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalCoordinate(value: string | undefined): number | undefined {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;

  return parsed;
}

export function toSenderLocationPayload(
  values: LocationFormValues,
): SenderLocationPayload {
  const payload: SenderLocationPayload = {
    name: values.name.trim(),
    contactName: values.contactName.trim(),
    contactPhone: values.contactPhone.trim(),
    contactEmail: values.contactEmail.trim(),
    countryCode: "EG",
    governorateId: values.governorateId,
    area: values.area.trim(),
    addressLine: values.addressLine.trim(),
  };

  const street = optionalTrimmed(values.street);
  const buildingNumber = optionalTrimmed(values.buildingNumber);
  const postalCode = optionalTrimmed(values.postalCode);
  const latitude = parseOptionalCoordinate(values.latitude);
  const longitude = parseOptionalCoordinate(values.longitude);

  if (street) payload.street = street;
  if (buildingNumber) payload.buildingNumber = buildingNumber;
  if (postalCode) payload.postalCode = postalCode;
  if (latitude !== undefined) payload.latitude = latitude;
  if (longitude !== undefined) payload.longitude = longitude;

  return payload;
}

export function toLocationFormValues(
  location: {
    name: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    governorateId: string;
    area: string;
    addressLine: string;
    street: string | null;
    buildingNumber: string | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
  },
): LocationFormValues {
  return {
    name: location.name,
    contactName: location.contactName,
    contactPhone: location.contactPhone,
    contactEmail: location.contactEmail,
    governorateId: location.governorateId,
    area: location.area,
    addressLine: location.addressLine,
    street: location.street ?? "",
    buildingNumber: location.buildingNumber ?? "",
    postalCode: location.postalCode ?? "",
    latitude:
      location.latitude !== null && location.latitude !== undefined
        ? String(location.latitude)
        : "",
    longitude:
      location.longitude !== null && location.longitude !== undefined
        ? String(location.longitude)
        : "",
  };
}

export function getGeoAreaLabel(
  area: { nameAr: string; nameEn: string | null },
  locale: "ar" | "en",
): string {
  if (locale === "ar") {
    return area.nameAr || area.nameEn || "";
  }

  return area.nameEn || area.nameAr;
}

export function getGovernorateLabel(
  governorate: { nameAr: string; nameEn: string },
  locale: "ar" | "en",
): string {
  return locale === "ar" ? governorate.nameAr : governorate.nameEn;
}

export function getLocationGovernorateLabel(
  location: {
    governorateNameAr: string | null;
    governorateNameEn: string | null;
  },
  locale: "ar" | "en",
): string {
  if (locale === "ar") {
    return location.governorateNameAr || location.governorateNameEn || "—";
  }

  return location.governorateNameEn || location.governorateNameAr || "—";
}
