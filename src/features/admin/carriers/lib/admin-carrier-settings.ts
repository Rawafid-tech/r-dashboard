import type {
  AdminCarrierPlatform,
  AdminCarrierSettings,
  CarrierPlatformField,
  CarrierPlatformFieldKind,
  CarrierPlatformFieldOption,
} from "@/features/admin/carriers/types";

const KNOWN_FIELD_KINDS: ReadonlySet<CarrierPlatformFieldKind> = new Set([
  "TEXT",
  "BOOLEAN",
  "SELECT",
  "SECRET",
]);

/** Platforms whose carriers an admin adds, edits and removes from the catalog form. */
const CATALOG_MANAGED_PLATFORMS: ReadonlySet<string> = new Set([
  "ACCURATE",
  "MEGA",
]);

/** The API does not list SELECT options yet (Mega Technology Part 1 §2). */
const SELECT_FALLBACK_OPTIONS: Record<string, readonly string[]> = {
  bookAction: ["addBulkShipments", "addShipment"],
  sectorsBody: ["form", "json"],
};

/** Support-only settings, shown under the "Advanced" fold. */
export const ADVANCED_SETTING_KEYS: ReadonlySet<string> = new Set([
  "bookAction",
  "sectorsBody",
]);

const MEGA_BASE_URL_PATTERN = /^https:\/\/[^/?#\s]+(?:\/[^?#\s]*)?\/api\/shipment\.php$/;

export function isCatalogManagedPlatform(
  platform: AdminCarrierPlatform | undefined,
): boolean {
  return platform !== undefined && CATALOG_MANAGED_PLATFORMS.has(platform);
}

export function carrierFieldKind(
  field: CarrierPlatformField,
): CarrierPlatformFieldKind {
  return field.kind && KNOWN_FIELD_KINDS.has(field.kind) ? field.kind : "TEXT";
}

export function selectOptions(
  field: CarrierPlatformField,
): CarrierPlatformFieldOption[] {
  if (field.options && field.options.length > 0) return field.options;
  return (SELECT_FALLBACK_OPTIONS[field.key] ?? []).map((value) => ({ value }));
}

/** Returns true when the value is acceptable for the platform's base URL. */
export function isValidBaseUrl(
  platform: AdminCarrierPlatform | undefined,
  value: string,
): boolean {
  if (platform !== "MEGA") return true;
  return MEGA_BASE_URL_PATTERN.test(value.trim());
}

export function defaultSettingValue(field: CarrierPlatformField): string {
  if (carrierFieldKind(field) === "BOOLEAN") {
    const value = field.defaultValue;
    if (value === true || value === "true") return "true";
    return "false";
  }
  if (typeof field.defaultValue === "string") return field.defaultValue;
  return "";
}

function readStoredSetting(
  settings: AdminCarrierSettings | undefined,
  key: string,
): string | undefined {
  if (!settings) return undefined;
  const value = settings[key];
  return typeof value === "string" ? value : undefined;
}

export function settingValueFromCarrier(
  field: CarrierPlatformField,
  settings: AdminCarrierSettings | Record<string, string> | undefined,
): string {
  const stored = readStoredSetting(settings, field.key);
  const kind = carrierFieldKind(field);
  if (kind === "BOOLEAN") {
    return stored === "true" ? "true" : "false";
  }
  // Secrets are never returned by the API, so they always start empty.
  if (kind === "SECRET") return stored ?? "";
  return stored ?? defaultSettingValue(field);
}

export function buildSettingsRecord(
  fields: CarrierPlatformField[],
  source?: AdminCarrierSettings | Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [field.key, settingValueFromCarrier(field, source)]),
  );
}

/**
 * Builds the `settings` body. A blank SECRET is left out, so on edit the
 * saved value is kept; on create the form requires it before submit.
 */
export function settingsPayloadFromForm(
  fields: CarrierPlatformField[],
  formSettings: Record<string, string> | undefined,
): Record<string, string> {
  const record = buildSettingsRecord(fields, formSettings);
  for (const field of fields) {
    if (carrierFieldKind(field) === "SECRET" && !record[field.key]?.trim()) {
      delete record[field.key];
    }
  }
  return record;
}
