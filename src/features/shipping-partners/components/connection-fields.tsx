import { Eye, EyeOff } from "lucide-react";
import type { FieldErrors, FieldPath } from "react-hook-form";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  PICKUP_NONE,
  SELECT_NONE,
} from "@/features/shipping-partners/lib/connection-payload";
import type {
  CarrierField,
  ConnectionFormValues,
  PickupLocation,
} from "@/features/shipping-partners/types";
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

function nestedMessage(
  errors: FieldErrors<ConnectionFormValues>,
  group: "credentials" | "options",
  key: string,
): string | undefined {
  const bucket = errors[group];
  if (!bucket || typeof bucket !== "object") return undefined;
  const entry = (bucket as Record<string, { message?: string } | undefined>)[key];
  return typeof entry?.message === "string" ? entry.message : undefined;
}

interface SecretFieldsProps {
  formId: string;
  fields: CarrierField[];
  control: Control<ConnectionFormValues>;
  errors: FieldErrors<ConnectionFormValues>;
  revealed: Record<string, boolean>;
  onToggleReveal: (key: string) => void;
  credentialHint: string | null;
  preserveSaved?: boolean;
  disabled?: boolean;
}

export function SecretFields({
  formId,
  fields,
  control,
  errors,
  revealed,
  onToggleReveal,
  credentialHint,
  preserveSaved = false,
  disabled,
}: SecretFieldsProps) {
  const { t } = useTranslation("shippingPartners");
  const secrets = fields.filter((field) => field.kind === "SECRET");

  return (
    <>
      {secrets.map((field) => {
        const inputId = `${formId}-secret-${field.key}`;
        const errorId = `${inputId}-error`;
        const message = nestedMessage(errors, "credentials", field.key);
        const shown = revealed[field.key] === true;
        const placeholder = credentialHint
          ? `••••${credentialHint}`
          : t("form.secretPlaceholder");

        return (
          <Controller
            key={field.key}
            name={
              `credentials.${field.key}` as FieldPath<ConnectionFormValues>
            }
            control={control}
            render={({ field: input }) => (
              <Field data-invalid={Boolean(message) || undefined}>
                <FieldLabel htmlFor={inputId}>
                  {field.label}
                  {field.required ? (
                    <>
                      <span className="text-destructive" aria-hidden="true">
                        {" "}
                        *
                      </span>
                      <span className="sr-only"> ({t("form.requiredSuffix")})</span>
                    </>
                  ) : null}
                </FieldLabel>
                <div className="relative">
                  <Input
                    id={inputId}
                    type={shown ? "text" : "password"}
                    inputMode="text"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={typeof input.value === "string" ? input.value : ""}
                    onChange={input.onChange}
                    onBlur={input.onBlur}
                    name={input.name}
                    ref={input.ref}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={Boolean(message) || undefined}
                    aria-describedby={message ? errorId : undefined}
                    aria-required={field.required || undefined}
                    className="pe-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute end-1 top-1/2 -translate-y-1/2"
                    aria-pressed={shown}
                    aria-label={t(shown ? "form.hideSecret" : "form.showSecret", {
                      label: field.label,
                    })}
                    onClick={() => onToggleReveal(field.key)}
                  >
                    {shown ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {preserveSaved ? (
                  <FieldDescription>{t("form.keepSavedKey")}</FieldDescription>
                ) : null}
                <FieldError id={errorId} errors={message ? [{ message }] : undefined} />
              </Field>
            )}
          />
        );
      })}
    </>
  );
}

interface OptionFieldsProps {
  formId: string;
  fields: CarrierField[];
  control: Control<ConnectionFormValues>;
  errors: FieldErrors<ConnectionFormValues>;
  pickupLocations: PickupLocation[];
  savedPickupId: string;
  disabled?: boolean;
}

export function OptionFields({
  formId,
  fields,
  control,
  errors,
  pickupLocations,
  savedPickupId,
  disabled,
}: OptionFieldsProps) {
  const { t } = useTranslation("shippingPartners");
  const options = fields.filter((field) => field.kind !== "SECRET");

  return (
    <>
      {options.map((field) => {
        const inputId = `${formId}-option-${field.key}`;
        const errorId = `${inputId}-error`;
        const message = nestedMessage(errors, "options", field.key);
        const label = (
          <FieldLabel htmlFor={inputId}>
            {field.label}
            {field.required ? (
              <>
                <span className="text-destructive" aria-hidden="true">
                  {" "}
                  *
                </span>
                <span className="sr-only"> ({t("form.requiredSuffix")})</span>
              </>
            ) : null}
          </FieldLabel>
        );

        if (field.kind === "BOOLEAN") {
          return (
            <Controller
              key={field.key}
              name={`options.${field.key}` as FieldPath<ConnectionFormValues>}
              control={control}
              render={({ field: input }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={Boolean(message) || undefined}
                >
                  <Switch
                    id={inputId}
                    checked={Boolean(input.value)}
                    onCheckedChange={input.onChange}
                    disabled={disabled}
                    aria-invalid={Boolean(message) || undefined}
                    aria-describedby={message ? errorId : undefined}
                  />
                  <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
                  <FieldError
                    id={errorId}
                    errors={message ? [{ message }] : undefined}
                  />
                </Field>
              )}
            />
          );
        }

        if (field.kind === "TEXT") {
          return (
            <Controller
              key={field.key}
              name={`options.${field.key}` as FieldPath<ConnectionFormValues>}
              control={control}
              render={({ field: input }) => (
                <Field data-invalid={Boolean(message) || undefined}>
                  {label}
                  <Input
                    id={inputId}
                    value={typeof input.value === "string" ? input.value : ""}
                    onChange={input.onChange}
                    onBlur={input.onBlur}
                    name={input.name}
                    ref={input.ref}
                    maxLength={500}
                    disabled={disabled}
                    aria-invalid={Boolean(message) || undefined}
                    aria-describedby={message ? errorId : undefined}
                    aria-required={field.required || undefined}
                  />
                  <FieldError
                    id={errorId}
                    errors={message ? [{ message }] : undefined}
                  />
                </Field>
              )}
            />
          );
        }

        if (field.kind === "SELECT") {
          return (
            <Controller
              key={field.key}
              name={`options.${field.key}` as FieldPath<ConnectionFormValues>}
              control={control}
              render={({ field: input }) => {
                const current =
                  typeof input.value === "string" ? input.value : "";
                return (
                  <Field data-invalid={Boolean(message) || undefined}>
                    {label}
                    <Select
                      value={current || (field.required ? undefined : SELECT_NONE)}
                      onValueChange={(next) =>
                        input.onChange(next === SELECT_NONE ? "" : next)
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger
                        id={inputId}
                        aria-invalid={Boolean(message) || undefined}
                        aria-describedby={message ? errorId : undefined}
                        aria-required={field.required || undefined}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {!field.required ? (
                          <SelectItem value={SELECT_NONE}>
                            {t("form.unset")}
                          </SelectItem>
                        ) : null}
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError
                      id={errorId}
                      errors={message ? [{ message }] : undefined}
                    />
                  </Field>
                );
              }}
            />
          );
        }

        if (field.kind !== "PICKUP_LOCATION") return null;

        const locations =
          pickupLocations.length > 0
            ? pickupLocations
            : savedPickupId
              ? [
                  {
                    id: savedPickupId,
                    name: savedPickupId,
                    address: "",
                    isDefault: false,
                  },
                ]
              : [];

        return (
          <Controller
            key={field.key}
            name={`options.${field.key}` as FieldPath<ConnectionFormValues>}
            control={control}
            render={({ field: input }) => {
              const current = typeof input.value === "string" ? input.value : "";
              return (
                <Field data-invalid={Boolean(message) || undefined}>
                  {label}
                  <Select
                    value={current || PICKUP_NONE}
                    onValueChange={(next) =>
                      input.onChange(next === PICKUP_NONE ? "" : next)
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger
                      id={inputId}
                      aria-invalid={Boolean(message) || undefined}
                      aria-describedby={
                        message
                          ? errorId
                          : locations.length === 0
                            ? `${inputId}-hint`
                            : undefined
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PICKUP_NONE}>
                        {t("form.useAccountDefault")}
                      </SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.address
                            ? t("form.pickupAddress", {
                                name: location.name,
                                address: location.address,
                              })
                            : location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pickupLocations.length === 0 ? (
                    <FieldDescription id={`${inputId}-hint`}>
                      {t("form.pickupHint")}
                    </FieldDescription>
                  ) : null}
                  <FieldError
                    id={errorId}
                    errors={message ? [{ message }] : undefined}
                  />
                </Field>
              );
            }}
          />
        );
      })}
    </>
  );
}
