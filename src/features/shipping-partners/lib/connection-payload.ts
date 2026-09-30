import type {
  CarrierConnection,
  CarrierField,
  ConnectionFormValues,
  CreateCarrierConnectionPayload,
  PickupLocation,
  UpdateCarrierConnectionPayload,
} from "@/features/shipping-partners/types";

export const PICKUP_NONE = "__account_default__";
export const SELECT_NONE = "__unset__";

export function booleanDefault(
  value: string | boolean | null | undefined,
): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return false;
}

function readSavedOption(
  options: CarrierConnection["options"] | undefined,
  key: string,
): string | boolean | null | undefined {
  const value = options?.[key];
  if (typeof value === "string" || typeof value === "boolean" || value === null) {
    return value;
  }
  return undefined;
}

export function buildConnectionFormValues(
  fields: CarrierField[],
  connection?: CarrierConnection | null,
): ConnectionFormValues {
  const credentials: Record<string, string> = {};
  const options: Record<string, string | boolean> = {};

  for (const field of fields) {
    if (field.kind === "SECRET") {
      credentials[field.key] = "";
      continue;
    }

    const saved = readSavedOption(connection?.options, field.key);

    if (field.kind === "BOOLEAN") {
      options[field.key] =
        typeof saved === "boolean" ? saved : booleanDefault(field.defaultValue);
      continue;
    }

    if (typeof saved === "string") {
      options[field.key] = saved;
      continue;
    }

    options[field.key] =
      typeof field.defaultValue === "string" ? field.defaultValue : "";
  }

  return {
    name: connection?.name ?? "",
    active: connection?.active ?? true,
    credentials,
    options,
  };
}

export function nonEmptyCredentials(
  credentials: Record<string, string>,
): Record<string, string> {
  const next: Record<string, string> = {};

  for (const [key, value] of Object.entries(credentials)) {
    const trimmed = value.trim();
    if (trimmed) next[key] = trimmed;
  }

  return next;
}

export function credentialFingerprint(
  credentials: Record<string, string>,
): string {
  const entries = Object.entries(nonEmptyCredentials(credentials)).sort(
    ([left], [right]) => left.localeCompare(right),
  );
  return JSON.stringify(entries);
}

export function toOptionsMap(
  fields: CarrierField[],
  options: Record<string, string | boolean>,
): Record<string, string | boolean> {
  const map: Record<string, string | boolean> = {};

  for (const field of fields) {
    if (field.kind === "SECRET") continue;
    const value = options[field.key];

    if (field.kind === "BOOLEAN") {
      map[field.key] = Boolean(value);
      continue;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (
        trimmed &&
        trimmed !== PICKUP_NONE &&
        trimmed !== SELECT_NONE
      ) {
        map[field.key] = trimmed;
      }
    }
  }

  return map;
}

export function toCreatePayload(
  carrierCode: string,
  fields: CarrierField[],
  values: ConnectionFormValues,
): CreateCarrierConnectionPayload {
  return {
    carrierCode,
    name: values.name.trim(),
    credentials: nonEmptyCredentials(values.credentials),
    options: toOptionsMap(fields, values.options),
  };
}

export function toUpdatePayload(
  fields: CarrierField[],
  values: ConnectionFormValues,
): UpdateCarrierConnectionPayload {
  const credentials = nonEmptyCredentials(values.credentials);
  const payload: UpdateCarrierConnectionPayload = {
    name: values.name.trim(),
    options: toOptionsMap(fields, values.options),
  };

  if (Object.keys(credentials).length > 0) {
    payload.credentials = credentials;
  }

  return payload;
}

export function preferredPickupId(
  locations: PickupLocation[],
): string | null {
  return locations.find((location) => location.isDefault)?.id ?? null;
}

export function pickupFieldKey(fields: CarrierField[]): string | null {
  return fields.find((field) => field.kind === "PICKUP_LOCATION")?.key ?? null;
}

export function savedPickupId(
  connection: CarrierConnection | null | undefined,
  fields: CarrierField[],
): string {
  const key = pickupFieldKey(fields);
  if (!key || !connection) return "";
  const value = connection.options[key];
  return typeof value === "string" ? value : "";
}
