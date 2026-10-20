import type {
  AdminCarrierSettings,
  CarrierPlatformField,
} from "@/features/admin/carriers/types";

export function carrierFieldKind(
  field: CarrierPlatformField,
): "TEXT" | "BOOLEAN" {
  return field.kind === "BOOLEAN" ? "BOOLEAN" : "TEXT";
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
  if (carrierFieldKind(field) === "BOOLEAN") {
    return stored === "true" ? "true" : "false";
  }
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

export function settingsPayloadFromForm(
  fields: CarrierPlatformField[],
  formSettings: Record<string, string> | undefined,
): Record<string, string> {
  return buildSettingsRecord(fields, formSettings);
}
