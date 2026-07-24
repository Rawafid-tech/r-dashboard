import { useEffect, useId, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { DateFormat, Theme, type FontScale } from "@/shared/types/enums";
import {
  DEFAULT_HOME_PAGES,
  FONT_SCALE_OPTIONS,
  SETTINGS_TIMEZONES,
} from "@/shared/lib/settings-options";
import { applyUserSettings } from "@/shared/lib/apply-user-settings";
import type { UserSettings } from "@/features/account/types";
import {
  applyPreferencesFieldErrors,
  useUpdateSettings,
} from "@/features/account/hooks/use-update-settings";
import {
  createPreferencesSchema,
  type PreferencesFormValues,
} from "@/features/account/schema";

function parseOptionalCoordinate(
  value: string | undefined,
  min: number,
  max: number,
): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return Number.NaN;
  }

  return parsed;
}

interface PreferencesSettingsFormProps {
  settings?: UserSettings;
}

export function PreferencesSettingsForm({ settings }: PreferencesSettingsFormProps) {
  const { t, i18n } = useTranslation("settings");
  const formId = useId();
  const updateMutation = useUpdateSettings();

  const schema = useMemo(
    () => createPreferencesSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useAppForm({
    schema,
    defaultValues: {
      theme: Theme.SYSTEM,
      fontScale: "100",
      defaultHomePage: "home",
      timezone: "Africa/Cairo",
      dateFormat: DateFormat.DD_MM_YYYY,
      mapLat: "",
      mapLng: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!settings) return;

    reset({
      theme: settings.theme,
      fontScale: String(settings.fontScale),
      defaultHomePage: settings.defaultHomePage,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      mapLat: settings.mapLat != null ? String(settings.mapLat) : "",
      mapLng: settings.mapLng != null ? String(settings.mapLng) : "",
    });

    applyUserSettings(settings);
  }, [settings, reset]);

  const busy = isSubmitting || updateMutation.isPending;

  const onSubmit = handleSubmit(async (values: PreferencesFormValues) => {
    const mapLat = parseOptionalCoordinate(values.mapLat, -90, 90);
    const mapLng = parseOptionalCoordinate(values.mapLng, -180, 180);

    if (Number.isNaN(mapLat)) {
      setError("mapLat", { type: "manual", message: t("validation.mapLat") });
      return;
    }

    if (Number.isNaN(mapLng)) {
      setError("mapLng", { type: "manual", message: t("validation.mapLng") });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        theme: values.theme,
        fontScale: Number(values.fontScale) as FontScale,
        defaultHomePage: values.defaultHomePage,
        timezone: values.timezone,
        dateFormat: values.dateFormat,
        mapLat,
        mapLng,
      });
    } catch (error) {
      applyPreferencesFieldErrors(error, setError);
    }
  });

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="space-y-5">
      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.theme || undefined}>
              <FieldLabel htmlFor={`${formId}-theme`}>{t("fields.theme")}</FieldLabel>
              <Controller
                control={control}
                name="theme"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={busy || !settings}
                  >
                    <SelectTrigger id={`${formId}-theme`} className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {Object.values(Theme).map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {t(`theme.${theme}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.theme?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.fontScale || undefined}>
              <FieldLabel htmlFor={`${formId}-fontScale`}>
                {t("fields.fontScale")}
              </FieldLabel>
              <Controller
                control={control}
                name="fontScale"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={busy || !settings}
                  >
                    <SelectTrigger id={`${formId}-fontScale`} className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {FONT_SCALE_OPTIONS.map((scale) => (
                        <SelectItem key={scale} value={String(scale)}>
                          {t(`fontScale.${scale}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.fontScale?.message}</FieldError>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.defaultHomePage || undefined}>
              <FieldLabel htmlFor={`${formId}-home`}>
                {t("fields.defaultHomePage")}
              </FieldLabel>
              <Controller
                control={control}
                name="defaultHomePage"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={busy || !settings}
                  >
                    <SelectTrigger id={`${formId}-home`} className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {DEFAULT_HOME_PAGES.map((page) => (
                        <SelectItem key={page.value} value={page.value}>
                          {t(`homePage.${page.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.defaultHomePage?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.timezone || undefined}>
              <FieldLabel htmlFor={`${formId}-timezone`}>
                {t("fields.timezone")}
              </FieldLabel>
              <Controller
                control={control}
                name="timezone"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={busy || !settings}
                  >
                    <SelectTrigger id={`${formId}-timezone`} className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {SETTINGS_TIMEZONES.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.timezone?.message}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!errors.dateFormat || undefined}>
            <FieldLabel htmlFor={`${formId}-dateFormat`}>
              {t("fields.dateFormat")}
            </FieldLabel>
            <Controller
              control={control}
              name="dateFormat"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={busy || !settings}
                >
                  <SelectTrigger id={`${formId}-dateFormat`} className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    {Object.values(DateFormat).map((format) => (
                      <SelectItem key={format} value={format}>
                        {t(`dateFormat.${format}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.dateFormat?.message}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.mapLat || undefined}>
              <FieldLabel htmlFor={`${formId}-mapLat`}>
                {t("fields.mapLat")}
              </FieldLabel>
              <Input
                id={`${formId}-mapLat`}
                inputMode="decimal"
                dir="ltr"
                className="text-start"
                disabled={busy || !settings}
                {...register("mapLat")}
              />
              <FieldError>{errors.mapLat?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.mapLng || undefined}>
              <FieldLabel htmlFor={`${formId}-mapLng`}>
                {t("fields.mapLng")}
              </FieldLabel>
              <Input
                id={`${formId}-mapLng`}
                inputMode="decimal"
                dir="ltr"
                className="text-start"
                disabled={busy || !settings}
                {...register("mapLng")}
              />
              <FieldError>{errors.mapLng?.message}</FieldError>
            </Field>
          </div>

          <FieldDescription>{t("fields.mapHint")}</FieldDescription>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${formId}-country`}>
                {t("fields.country")}
              </FieldLabel>
              <Input
                id={`${formId}-country`}
                value={settings?.country ?? ""}
                readOnly
                disabled
                aria-readonly="true"
                className="bg-muted/40"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`${formId}-currency`}>
                {t("fields.currency")}
              </FieldLabel>
              <Input
                id={`${formId}-currency`}
                value={settings?.currency ?? ""}
                readOnly
                disabled
                aria-readonly="true"
                className="bg-muted/40"
              />
              <FieldDescription>{t("preferences.derivedHint")}</FieldDescription>
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button type="submit" disabled={busy || !settings || !isDirty}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" />
              {t("actions.saving")}
            </>
          ) : (
            t("actions.save")
          )}
        </Button>
      </div>
    </form>
  );
}
