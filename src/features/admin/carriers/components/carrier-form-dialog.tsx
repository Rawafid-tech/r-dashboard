import { useEffect, useId, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCarrierPlatforms } from "@/features/admin/carriers/hooks/use-carrier-platforms";
import {
  createAdminCarrierErrorDetail,
  useCreateAdminCarrier,
} from "@/features/admin/carriers/hooks/use-create-admin-carrier";
import {
  patchAdminCarrierErrorDetail,
  usePatchAdminCarrier,
} from "@/features/admin/carriers/hooks/use-patch-admin-carrier";
import {
  applyAdminCarrierFieldErrors,
  type AdminCarrierFormValues,
} from "@/features/admin/carriers/lib/admin-carrier-form-errors";
import type { AdminCarrier, CarrierPlatformField } from "@/features/admin/carriers/types";
import { useForm } from "react-hook-form";
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

function emptySettings(keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, ""]));
}

function settingLabel(
  field: CarrierPlatformField,
  t: (key: string) => string,
): string {
  if (field.label) return field.label;
  if (field.key === "baseUrl") return t("carriers.form.fields.baseUrl");
  if (field.key === "clientId") return t("carriers.form.fields.clientId");
  return field.key;
}

export function CarrierFormDialog({
  mode,
  carrier,
  open,
  onOpenChange,
}: CarrierFormDialogProps) {
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const platformsQuery = useCarrierPlatforms({ enabled: open && mode === "create" });
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
      settings: emptySettings(["baseUrl", "clientId"]),
    },
  });

  const selectedPlatform = form.watch("platform");
  const platformDef = useMemo(
    () => platforms.find((item) => item.platform === selectedPlatform),
    [platforms, selectedPlatform],
  );
  const settingFields = useMemo((): CarrierPlatformField[] => {
    if (mode === "edit") {
      return [
        { key: "baseUrl", required: true },
        { key: "clientId", required: true },
      ];
    }
    return platformDef?.carrierFields ?? [];
  }, [mode, platformDef]);

  useEffect(() => {
    if (!open) return;
    setGlobalError(null);
    if (mode === "edit" && carrier) {
      form.reset({
        code: carrier.code,
        platform: carrier.platform ?? "ACCURATE",
        nameEn: carrier.nameEn ?? "",
        nameAr: carrier.nameAr ?? "",
        sortOrder: String(carrier.sortOrder ?? 100),
        settings: {
          baseUrl: carrier.settings?.baseUrl ?? "",
          clientId: carrier.settings?.clientId ?? "",
        },
      });
      return;
    }
    form.reset({
      code: "",
      platform: defaultPlatform,
      nameEn: "",
      nameAr: "",
      sortOrder: "100",
      settings: emptySettings(
        platforms.find((item) => item.platform === defaultPlatform)
          ?.carrierFields.map((field) => field.key) ?? ["baseUrl", "clientId"],
      ),
    });
  }, [open, mode, carrier, form, defaultPlatform, platforms]);

  const isPending = createMutation.isPending || patchMutation.isPending;

  const handleSubmit = form.handleSubmit(async (values) => {
    setGlobalError(null);
    const sortOrder = values.sortOrder.trim()
      ? Number.parseInt(values.sortOrder, 10)
      : undefined;

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          code: values.code.trim(),
          platform: values.platform,
          nameEn: values.nameEn.trim(),
          nameAr: values.nameAr.trim(),
          settings: values.settings,
          sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
        });
      } else if (carrier) {
        await patchMutation.mutateAsync({
          code: carrier.code,
          payload: {
            nameEn: values.nameEn.trim(),
            nameAr: values.nameAr.trim(),
            settings: values.settings,
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
                        form.setValue(
                          "settings",
                          emptySettings(fields.map((field) => field.key)),
                        );
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

            {settingFields.length > 0 ? (
              <FieldGroup>
                {settingFields.map((field) => {
                  const inputId = `${formId}-setting-${field.key}`;
                  const error = form.formState.errors.settings?.[field.key];
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
                      />
                      {field.key === "baseUrl" ? (
                        <p className="text-xs text-muted-foreground">
                          {t("carriers.form.fields.baseUrlHint")}
                        </p>
                      ) : null}
                      <FieldError errors={[error]} />
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
            <Button type="submit" form={formId} disabled={isPending}>
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
