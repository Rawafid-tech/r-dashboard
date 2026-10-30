import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { CarrierSettingField } from "@/features/admin/carriers/components/carrier-setting-field";
import {
  applyAdminCarrierFieldErrors,
  type AdminCarrierFormValues,
} from "@/features/admin/carriers/lib/admin-carrier-form-errors";
import {
  ADVANCED_SETTING_KEYS,
  buildSettingsRecord,
  settingsPayloadChanged,
  settingsPayloadFromForm,
} from "@/features/admin/carriers/lib/admin-carrier-settings";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import type { AdminCarrier, CarrierPlatformField } from "@/features/admin/carriers/types";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";

interface CarrierFormDialogProps {
  mode: "create" | "edit";
  carrier: AdminCarrier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const [advancedOpen, setAdvancedOpen] = useState(false);
  // The admin may close the dialog while a save runs, and the edit dialog is
  // reused across carriers: a save only closes, or marks errors on, the form
  // it was sent from.
  const formKey = mode === "edit" ? (carrier?.code ?? null) : "create";
  const shownFormRef = useRef<string | null>(null);

  useEffect(() => {
    shownFormRef.current = open ? formKey : null;
  }, [open, formKey]);

  const platforms = useMemo(
    () => platformsQuery.data ?? [],
    [platformsQuery.data],
  );
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
  const basicFields = settingFields.filter(
    (field) => !ADVANCED_SETTING_KEYS.has(field.key),
  );
  const advancedFields = settingFields.filter((field) =>
    ADVANCED_SETTING_KEYS.has(field.key),
  );
  const settingsPlatform =
    mode === "edit" ? (carrier?.platform ?? "ACCURATE") : selectedPlatform;
  const secretsSaved = mode === "edit" && carrier?.secretsSet === true;
  const settingsErrors = form.formState.errors.settings;
  const advancedHasError = advancedFields.some((field) =>
    Boolean(settingsErrors?.[field.key]),
  );

  useEffect(() => {
    if (advancedHasError) setAdvancedOpen(true);
  }, [advancedHasError]);

  useEffect(() => {
    if (!open) return;
    setGlobalError(null);
    setAdvancedOpen(false);
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

  const isPending =
    mode === "create"
      ? createMutation.isPending
      : patchMutation.isPending &&
        patchMutation.variables?.code === carrier?.code;
  // Saving settings re-downloads the carrier's areas, which can take a while.
  const isSyncingAreas =
    isPending &&
    (mode === "create" ||
      patchMutation.variables?.payload.settings !== undefined);
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
    const savedFormKey = formKey;

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
            settings: settingsPayloadChanged(
              settingFields,
              carrier.settings,
              settings,
            )
              ? settings
              : undefined,
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
          },
        });
      }
      if (shownFormRef.current === savedFormKey) onOpenChange(false);
    } catch (error) {
      const message =
        mode === "create"
          ? createAdminCarrierErrorDetail(error)
          : patchAdminCarrierErrorDetail(error);
      if (shownFormRef.current !== savedFormKey) {
        if (message) toast.error(message);
        return;
      }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="w3"
        className="gap-0 overflow-hidden p-0"
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
                {basicFields.map((field) => (
                  <CarrierSettingField
                    key={field.key}
                    field={field}
                    form={form}
                    formId={formId}
                    platform={settingsPlatform}
                    secretsSaved={secretsSaved}
                    disabled={isPending}
                  />
                ))}
              </FieldGroup>
            ) : null}

            {advancedFields.length > 0 ? (
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="group px-0"
                  >
                    {t("carriers.form.advanced")}
                    <ChevronDown
                      aria-hidden="true"
                      className="transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3 rounded-lg border border-border/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("carriers.form.advancedHint")}
                  </p>
                  <FieldGroup>
                    {advancedFields.map((field) => (
                      <CarrierSettingField
                        key={field.key}
                        field={field}
                        form={form}
                        formId={formId}
                        platform={settingsPlatform}
                        secretsSaved={secretsSaved}
                        disabled={isPending}
                      />
                    ))}
                  </FieldGroup>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </DialogBody>

          {isSyncingAreas ? (
            <p
              role="status"
              className="border-t border-border/60 px-4 pt-3 text-sm text-muted-foreground"
            >
              {t("carriers.form.savingAreas")}
            </p>
          ) : null}

          <DialogFooter className="gap-2 border-t border-border/60 px-4 py-4">
            <Button
              type="button"
              variant="outline"
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
