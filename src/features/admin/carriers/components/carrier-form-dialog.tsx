import { useEffect, useId, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAdminCarriers } from "@/features/admin/carriers/hooks/use-admin-carriers";
import { useCarrierPlatforms } from "@/features/admin/carriers/hooks/use-carrier-platforms";
import {
  createAdminCarrierErrorDetail,
  useCreateAdminCarrier,
} from "@/features/admin/carriers/hooks/use-create-admin-carrier";
import {
  patchAdminCarrierErrorDetail,
  usePatchAdminCarrier,
} from "@/features/admin/carriers/hooks/use-patch-admin-carrier";
import { CarrierLogoUploader } from "@/features/admin/carriers/components/carrier-logo-uploader";
import {
  applyAdminCarrierFieldErrors,
  type AdminCarrierFormValues,
} from "@/features/admin/carriers/lib/admin-carrier-form-errors";
import {
  buildSettingsRecord,
  carrierFieldKind,
  settingsPayloadFromForm,
} from "@/features/admin/carriers/lib/admin-carrier-settings";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import type { AdminCarrier, CarrierPlatformField } from "@/features/admin/carriers/types";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/shared/components/ui";

interface CarrierFormDialogProps {
  mode: "create" | "edit";
  carrier: AdminCarrier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function settingLabel(
  field: CarrierPlatformField,
  t: (key: string) => string,
): string {
  if (field.label) return field.label;
  if (field.key === "baseUrl") return t("carriers.form.fields.baseUrl");
  if (field.key === "clientId") return t("carriers.form.fields.clientId");
  if (field.key === "returns") return t("carriers.form.fields.returns");
  return field.key;
}

export function CarrierFormDialog({
  mode,
  carrier,
  open,
  onOpenChange,
}: CarrierFormDialogProps) {
  const { t, i18n } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const carriersQuery = useAdminCarriers();
  const platformsQuery = useCarrierPlatforms({ enabled: open });
  const createMutation = useCreateAdminCarrier();
  const patchMutation = usePatchAdminCarrier();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const platforms = platformsQuery.data ?? [];
  const defaultPlatform = platforms[0]?.platform ?? "ACCURATE";

  const form = useForm<AdminCarrierFormValues>({
    defaultValues: {
      code: "",
      platform: defaultPlatform,
      nameEn: "",
      nameAr: "",
      sortOrder: "100",
      settings: {},
    },
  });

  const selectedPlatform = form.watch("platform");
  const platformDef = useMemo(
    () => platforms.find((item) => item.platform === selectedPlatform),
    [platforms, selectedPlatform],
  );
  const editPlatformDef = useMemo(
    () =>
      platforms.find(
        (item) => item.platform === (carrier?.platform ?? "ACCURATE"),
      ),
    [platforms, carrier?.platform],
  );
  const settingFields = useMemo((): CarrierPlatformField[] => {
    if (mode === "edit") {
      return editPlatformDef?.carrierFields ?? [];
    }
    return platformDef?.carrierFields ?? [];
  }, [mode, platformDef, editPlatformDef]);

  useEffect(() => {
    if (!open) return;
    setGlobalError(null);
    if (mode === "edit" && carrier) {
      const fields = editPlatformDef?.carrierFields ?? [];
      form.reset({
        code: carrier.code,
        platform: carrier.platform ?? "ACCURATE",
        nameEn: carrier.nameEn ?? "",
        nameAr: carrier.nameAr ?? "",
        sortOrder: String(carrier.sortOrder ?? 100),
        settings:
          fields.length > 0
            ? buildSettingsRecord(fields, carrier.settings)
            : {},
      });
      return;
    }
    const createFields =
      platforms.find((item) => item.platform === defaultPlatform)
        ?.carrierFields ?? [];
    form.reset({
      code: "",
      platform: defaultPlatform,
      nameEn: "",
      nameAr: "",
      sortOrder: "100",
      settings:
        createFields.length > 0 ? buildSettingsRecord(createFields) : {},
    });
  }, [open, mode, carrier, form, defaultPlatform, platforms, editPlatformDef]);

  const isPending = createMutation.isPending || patchMutation.isPending;
  const settingsReady =
    settingFields.length > 0 &&
    !platformsQuery.isLoading &&
    !platformsQuery.isError;

  const handleSubmit = form.handleSubmit(async (values) => {
    setGlobalError(null);
    const sortOrder = values.sortOrder.trim()
      ? Number.parseInt(values.sortOrder, 10)
      : undefined;
    const settings = settingsPayloadFromForm(settingFields, values.settings);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          code: values.code.trim(),
          platform: values.platform,
          nameEn: values.nameEn.trim(),
          nameAr: values.nameAr.trim(),
          settings,
          sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
        });
      } else if (carrier) {
        await patchMutation.mutateAsync({
          code: carrier.code,
          payload: {
            nameEn: values.nameEn.trim(),
            nameAr: values.nameAr.trim(),
            settings,
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
          },
        });
      }
      onOpenChange(false);
    } catch (error) {
      const message =
        mode === "create"
          ? createAdminCarrierErrorDetail(error)
          : patchAdminCarrierErrorDetail(error);
      const global = applyAdminCarrierFieldErrors(error, form.setError);
      if (global) {
        setGlobalError(global);
        toast.error(global);
      } else if (message) {
        toast.error(message);
      }
    }
  });

  const editLogoUrl =
    mode === "edit" && carrier
      ? (carriersQuery.data?.find((item) => item.code === carrier.code)
          ?.logoUrl ?? carrier.logoUrl)
      : null;

  const title =
    mode === "create"
      ? t("carriers.form.createTitle")
      : t("carriers.form.editTitle");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w3"
        className="gap-0 overflow-hidden p-0"
        showCloseButton={!isPending}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? t("carriers.form.createDescription")
              : t("carriers.form.editDescription")}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={(event) => void handleSubmit(event)}>
          <DialogBody className="space-y-4">
            {globalError ? (
              <p role="alert" className="text-sm text-destructive">
                {globalError}
              </p>
            ) : null}

            {mode === "create" ? (
              <>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor={`${formId}-platform`}>
                      {t("carriers.form.fields.platform")}
                    </FieldLabel>
                    <Select
                      value={selectedPlatform}
                      onValueChange={(value) => {
                        form.setValue("platform", value);
                        const fields =
                          platforms.find((item) => item.platform === value)
                            ?.carrierFields ?? [];
                        form.setValue("settings", buildSettingsRecord(fields));
                      }}
                      disabled={platformsQuery.isLoading || isPending}
                    >
                      <SelectTrigger
                        id={`${formId}-platform`}
                        aria-label={t("carriers.form.fields.platform")}
                      >
                        <SelectValue
                          placeholder={t("carriers.form.fields.platformPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((item) => (
                          <SelectItem key={item.platform} value={item.platform}>
                            {item.platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={`${formId}-code`}>
                      {t("carriers.form.fields.code")}
                    </FieldLabel>
                    <Input
                      id={`${formId}-code`}
                      dir="ltr"
                      autoComplete="off"
                      disabled={isPending}
                      {...form.register("code", { required: true })}
                      aria-invalid={Boolean(form.formState.errors.code)}
                    />
                    <FieldError errors={[form.formState.errors.code]} />
                  </Field>
                </FieldGroup>
              </>
            ) : null}

            {mode === "edit" && carrier ? (
              <CarrierLogoUploader
                code={carrier.code}
                name={carrierDisplayName(
                  {
                    code: carrier.code,
                    nameEn: carrier.nameEn ?? "",
                    nameAr: carrier.nameAr ?? "",
                  },
                  i18n.language,
                )}
                logoUrl={editLogoUrl}
              />
            ) : null}

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${formId}-nameEn`}>
                  {t("carriers.form.fields.nameEn")}
                </FieldLabel>
                <Input
                  id={`${formId}-nameEn`}
                  disabled={isPending}
                  {...form.register("nameEn", { required: true })}
                  aria-invalid={Boolean(form.formState.errors.nameEn)}
                />
                <FieldError errors={[form.formState.errors.nameEn]} />
              </Field>

              <Field>
                <FieldLabel htmlFor={`${formId}-nameAr`}>
                  {t("carriers.form.fields.nameAr")}
                </FieldLabel>
                <Input
                  id={`${formId}-nameAr`}
                  disabled={isPending}
                  {...form.register("nameAr", { required: true })}
                  aria-invalid={Boolean(form.formState.errors.nameAr)}
                />
                <FieldError errors={[form.formState.errors.nameAr]} />
              </Field>

              <Field>
                <FieldLabel htmlFor={`${formId}-sortOrder`}>
                  {t("carriers.form.fields.sortOrder")}
                </FieldLabel>
                <Input
                  id={`${formId}-sortOrder`}
                  type="number"
                  min={0}
                  dir="ltr"
                  disabled={isPending}
                  {...form.register("sortOrder")}
                  aria-invalid={Boolean(form.formState.errors.sortOrder)}
                />
                <FieldError errors={[form.formState.errors.sortOrder]} />
              </Field>
            </FieldGroup>

            {platformsQuery.isLoading && open ? (
              <p className="text-sm text-muted-foreground" role="status">
                {t("carriers.form.loadingPlatformFields")}
              </p>
            ) : null}

            {settingFields.length > 0 ? (
              <FieldGroup>
                {settingFields.map((field) => {
                  const inputId = `${formId}-setting-${field.key}`;
                  const hintId =
                    field.key === "baseUrl" || field.key === "returns"
                      ? `${inputId}-hint`
                      : undefined;
                  const errorId = `${inputId}-error`;
                  const error = form.formState.errors.settings?.[field.key];
                  const describedBy = [hintId, error ? errorId : undefined]
                    .filter(Boolean)
                    .join(" ");

                  if (carrierFieldKind(field) === "BOOLEAN") {
                    return (
                      <Controller
                        key={field.key}
                        name={`settings.${field.key}`}
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
                              disabled={isPending}
                              aria-invalid={Boolean(error) || undefined}
                              aria-describedby={
                                describedBy || undefined
                              }
                            />
                            <div className="space-y-1">
                              <FieldLabel htmlFor={inputId}>
                                {settingLabel(field, t)}
                              </FieldLabel>
                              {field.key === "returns" ? (
                                <FieldDescription id={hintId}>
                                  {t("carriers.form.fields.returnsHint")}
                                </FieldDescription>
                              ) : null}
                              <FieldError
                                id={errorId}
                                errors={error ? [error] : undefined}
                              />
                            </div>
                          </Field>
                        )}
                      />
                    );
                  }

                  return (
                    <Field key={field.key}>
                      <FieldLabel htmlFor={inputId}>
                        {settingLabel(field, t)}
                      </FieldLabel>
                      <Input
                        id={inputId}
                        dir="ltr"
                        autoComplete="off"
                        disabled={isPending}
                        {...form.register(`settings.${field.key}`, {
                          required: field.required,
                        })}
                        aria-invalid={Boolean(error)}
                        aria-required={field.required}
                        aria-describedby={describedBy || undefined}
                      />
                      {field.key === "baseUrl" ? (
                        <FieldDescription id={hintId}>
                          {t("carriers.form.fields.baseUrlHint")}
                        </FieldDescription>
                      ) : null}
                      <FieldError id={errorId} errors={[error]} />
                    </Field>
                  );
                })}
              </FieldGroup>
            ) : null}
          </DialogBody>

          <DialogFooter className="gap-2 border-t border-border/60 px-4 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {tCommon("common.cancel")}
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={isPending || !settingsReady}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("carriers.form.saving")}
                </>
              ) : mode === "create" ? (
                t("carriers.form.createSubmit")
              ) : (
                t("carriers.form.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
