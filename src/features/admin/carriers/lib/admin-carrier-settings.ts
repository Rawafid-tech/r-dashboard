import type {
  AdminCarrierPlatform,
  AdminCarrierSettings,
  CarrierPlatform,
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

/**
 * Platforms whose carriers an admin adds, edits and removes from the catalog
 * form, used only until `GET /api/admin/carrier-platforms` answers (or when it fails).
 */
const FALLBACK_CATALOG_PLATFORMS: ReadonlySet<string> = new Set([
  "ACCURATE",
  "MEGA",
  "WINGEZZ",
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

/**
 * A platform is catalog-managed when the API lists it as one carriers can be
 * added on (Bosta never is). Without that list, the fallback set decides.
 */
export function isCatalogManagedPlatform(
  platform: AdminCarrierPlatform | undefined,
  platforms?: readonly CarrierPlatform[],
): boolean {
  if (platform === undefined) return false;
  if (platforms) return platforms.some((item) => item.platform === platform);
  return FALLBACK_CATALOG_PLATFORMS.has(platform);
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

/**
 * Whether an edit changes the carrier's settings. Saving settings re-downloads
 * the carrier's areas, so an edit of names or sort order alone leaves them out.
 * A typed SECRET always counts as a change.
 */
export function settingsPayloadChanged(
  fields: CarrierPlatformField[],
  savedSettings: AdminCarrierSettings | undefined,
  payload: Record<string, string>,
): boolean {
  const saved = settingsPayloadFromForm(
    fields,
    buildSettingsRecord(fields, savedSettings),
  );
  const keys = new Set([...Object.keys(saved), ...Object.keys(payload)]);
  for (const key of keys) {
    if (saved[key] !== payload[key]) return true;
  }
  return false;
}
