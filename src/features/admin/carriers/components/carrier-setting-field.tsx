import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { AdminCarrierFormValues } from "@/features/admin/carriers/lib/admin-carrier-form-errors";
import {
  carrierFieldKind,
  isValidBaseUrl,
  selectOptions,
} from "@/features/admin/carriers/lib/admin-carrier-settings";
import type {
  AdminCarrierPlatform,
  CarrierPlatformField,
} from "@/features/admin/carriers/types";
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/shared/components/ui";

const SECRET_HINT_KEYS = new Set(["syncUser", "syncPassword"]);

interface CarrierSettingFieldProps {
  field: CarrierPlatformField;
  form: UseFormReturn<AdminCarrierFormValues>;
  formId: string;
  platform: AdminCarrierPlatform | undefined;
  /** Edit mode with saved secrets: a blank SECRET keeps the saved value. */
  secretsSaved: boolean;
  disabled: boolean;
}

function settingLabel(
  field: CarrierPlatformField,
  t: (key: string) => string,
): string {
  if (field.label) return field.label;
  switch (field.key) {
    case "baseUrl":
    case "clientId":
    case "returns":
    case "bookAction":
    case "sectorsBody":
    case "syncUser":
    case "syncPassword":
      return t(`carriers.form.fields.${field.key}`);
    default:
      return field.key;
  }
}

function settingHint(
  field: CarrierPlatformField,
  platform: AdminCarrierPlatform | undefined,
  secretsSaved: boolean,
  t: (key: string) => string,
): string | null {
  if (field.key === "baseUrl") {
    return platform === "MEGA"
      ? t("carriers.form.fields.baseUrlHintMega")
      : t("carriers.form.fields.baseUrlHint");
  }
  if (field.key === "returns") return t("carriers.form.fields.returnsHint");
  if (carrierFieldKind(field) === "SECRET") {
    const parts = [
      secretsSaved ? t("carriers.form.secretSaved") : null,
      SECRET_HINT_KEYS.has(field.key)
        ? t("carriers.form.fields.syncAccountHint")
        : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : null;
  }
  return null;
}

export function CarrierSettingField({
  field,
  form,
  formId,
  platform,
  secretsSaved,
  disabled,
}: CarrierSettingFieldProps) {
  const { t } = useTranslation("admin");
  const [revealed, setRevealed] = useState(false);
  const kind = carrierFieldKind(field);
  const name = `settings.${field.key}` as const;
  const inputId = `${formId}-setting-${field.key}`;
  const label = settingLabel(field, t);
  const hint = settingHint(field, platform, secretsSaved, t);
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = `${inputId}-error`;
  const error = form.formState.errors.settings?.[field.key];
  const describedBy =
    [hintId, error ? errorId : undefined].filter(Boolean).join(" ") ||
    undefined;
  const required = kind === "SECRET" ? field.required && !secretsSaved : field.required;
  const hintNode = hint ? (
    <FieldDescription id={hintId}>{hint}</FieldDescription>
  ) : null;
  const errorNode = (
    <FieldError id={errorId} errors={error ? [error] : undefined} />
  );

  if (kind === "BOOLEAN") {
    return (
      <Controller
        name={name}
        control={form.control}
        render={({ field: input }) => (
          <Field
            orientation="horizontal"
            data-invalid={Boolean(error) || undefined}
          >
            <Switch
              id={inputId}
              checked={input.value === "true"}
              onCheckedChange={(checked) =>
                input.onChange(checked ? "true" : "false")
              }
              disabled={disabled}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={describedBy}
            />
            <div className="space-y-1">
              <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
              {hintNode}
              {errorNode}
            </div>
          </Field>
        )}
      />
    );
  }

  if (kind === "SELECT") {
    const options = selectOptions(field);
    return (
      <Controller
        name={name}
        control={form.control}
        rules={{ required }}
        render={({ field: input }) => (
          <Field data-invalid={Boolean(error) || undefined}>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <Select
              value={input.value || undefined}
              onValueChange={input.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={inputId}
                ref={input.ref}
                onBlur={input.onBlur}
                aria-invalid={Boolean(error) || undefined}
                aria-required={required || undefined}
                aria-describedby={describedBy}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span dir="ltr">{option.label ?? option.value}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hintNode}
            {errorNode}
          </Field>
        )}
      />
    );
  }

  if (kind === "SECRET") {
    return (
      <Field data-invalid={Boolean(error) || undefined}>
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
        <div className="relative">
          <Input
            id={inputId}
            type={revealed ? "text" : "password"}
            dir="ltr"
            autoComplete="new-password"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            className="pe-10"
            {...form.register(name, { required })}
            aria-invalid={Boolean(error) || undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute end-1 top-1/2 -translate-y-1/2"
            aria-pressed={revealed}
            aria-label={t(
              revealed ? "carriers.form.hideSecret" : "carriers.form.showSecret",
              { label },
            )}
            disabled={disabled}
            onClick={() => setRevealed((current) => !current)}
          >
            {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </Button>
        </div>
        {hintNode}
        {errorNode}
      </Field>
    );
  }

  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        id={inputId}
        dir="ltr"
        autoComplete="off"
        disabled={disabled}
        {...form.register(name, {
          required,
          validate:
            field.key === "baseUrl"
              ? (value) =>
                  !value ||
                  isValidBaseUrl(platform, value) ||
                  t("carriers.form.fields.baseUrlInvalidMega")
              : undefined,
        })}
        aria-invalid={Boolean(error) || undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
      />
      {hintNode}
      {errorNode}
    </Field>
  );
}
