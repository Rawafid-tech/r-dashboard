import { useEffect, useId, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  FieldLegend,
  FieldSet,
  Input,
  Switch,
} from "@/shared/components/ui";
import { DimensionInput } from "@/features/shipping-boxes/components/dimension-input";
import { ShippingBoxPreview } from "@/features/shipping-boxes/components/shipping-box-preview";
import { useCreateShippingBox } from "@/features/shipping-boxes/hooks/use-create-shipping-box";
import { useShippingBox } from "@/features/shipping-boxes/hooks/use-shipping-box";
import { useUpdateShippingBox } from "@/features/shipping-boxes/hooks/use-update-shipping-box";
import {
  handleShippingBoxFormError,
  isConcurrentDefaultConflict,
  toShippingBoxFormValues,
  toShippingBoxPayload,
} from "@/features/shipping-boxes/lib/shipping-box-form-errors";
import {
  createShippingBoxFormSchema,
  EMPTY_SHIPPING_BOX_FORM_VALUES,
  type ShippingBoxFormValues,
} from "@/features/shipping-boxes/schema";
import type { ShippingBox } from "@/features/shipping-boxes/types";
import { useAppForm } from "@/shared/hooks/use-app-form";

interface ShippingBoxFormDialogProps {
  mode: "create" | "edit";
  box: ShippingBox | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShippingBoxFormDialog({
  mode,
  box,
  open,
  onOpenChange,
}: ShippingBoxFormDialogProps) {
  const { t, i18n } = useTranslation("shippingBoxes");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const boxId = box?.id ?? null;

  const boxQuery = useShippingBox(boxId, {
    enabled: open && mode === "edit" && Boolean(boxId),
  });
  const createMutation = useCreateShippingBox();
  const updateMutation = useUpdateShippingBox(boxId ?? "");

  const schema = useMemo(
    () => createShippingBoxFormSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: EMPTY_SHIPPING_BOX_FORM_VALUES,
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) {
      reset(EMPTY_SHIPPING_BOX_FORM_VALUES);
      return;
    }

    if (mode === "edit") {
      const source = boxQuery.data ?? box;
      if (!source) return;
      reset(toShippingBoxFormValues(source));
      return;
    }

    reset(EMPTY_SHIPPING_BOX_FORM_VALUES);
  }, [open, mode, box, boxQuery.data, reset]);

  const busy =
    isSubmitting || createMutation.isPending || updateMutation.isPending;
  const isLoading =
    open && mode === "edit" && boxQuery.isLoading && !boxQuery.data;
  const lengthCm = watch("lengthCm");
  const widthCm = watch("widthCm");
  const heightCm = watch("heightCm");

  const onSubmit = handleSubmit(async (values: ShippingBoxFormValues) => {
    const payload = toShippingBoxPayload(values);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (boxId) {
        await updateMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      if (isConcurrentDefaultConflict(error)) {
        onOpenChange(false);
        return;
      }

      handleShippingBoxFormError(error, setError);
    }
  });

  const title =
    mode === "create" ? t("form.createTitle") : t("form.editTitle");
  const description =
    mode === "create"
      ? t("form.createDescription")
      : t("form.editDescription");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w5"
        className="gap-0 overflow-hidden"
        showCloseButton={!busy}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div
            className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground"
            role="status"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("form.loading")}
          </div>
        ) : (
          <form
            id={formId}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={onSubmit}
            noValidate
          >
            <DialogBody className="space-y-4">
              <FieldGroup className="gap-4">
                <Field data-invalid={Boolean(errors.name) || undefined}>
                  <FieldLabel htmlFor={`${formId}-name`}>
                    {t("form.name")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-name`}
                    placeholder={t("form.namePlaceholder")}
                    aria-invalid={Boolean(errors.name) || undefined}
                    {...register("name")}
                  />
                  <FieldError errors={errors.name ? [errors.name] : undefined} />
                </Field>

                <FieldSet>
                  <FieldLegend>{t("form.dimensionsLegend")}</FieldLegend>
                  <FieldDescription>{t("form.dimensionsHint")}</FieldDescription>
                  <div className="grid gap-4 pt-2 lg:grid-cols-[minmax(9rem,11rem)_1fr] lg:items-start">
                    <ShippingBoxPreview
                      lengthCm={lengthCm}
                      widthCm={widthCm}
                      heightCm={heightCm}
                      className="lg:sticky lg:top-0"
                    />
                    <FieldGroup className="grid gap-4 sm:grid-cols-3">
                    <Controller
                      name="lengthCm"
                      control={control}
                      render={({ field }) => (
                        <Field
                          data-invalid={Boolean(errors.lengthCm) || undefined}
                        >
                          <DimensionInput
                            id={`${formId}-lengthCm`}
                            label={t("form.lengthCm")}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={busy}
                            invalid={Boolean(errors.lengthCm)}
                            unitLabel={t("form.unit")}
                            decreaseLabel={t("form.decrease", {
                              field: t("form.lengthCm"),
                            })}
                            increaseLabel={t("form.increase", {
                              field: t("form.lengthCm"),
                            })}
                          />
                          <FieldError
                            errors={
                              errors.lengthCm ? [errors.lengthCm] : undefined
                            }
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name="widthCm"
                      control={control}
                      render={({ field }) => (
                        <Field
                          data-invalid={Boolean(errors.widthCm) || undefined}
                        >
                          <DimensionInput
                            id={`${formId}-widthCm`}
                            label={t("form.widthCm")}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={busy}
                            invalid={Boolean(errors.widthCm)}
                            unitLabel={t("form.unit")}
                            decreaseLabel={t("form.decrease", {
                              field: t("form.widthCm"),
                            })}
                            increaseLabel={t("form.increase", {
                              field: t("form.widthCm"),
                            })}
                          />
                          <FieldError
                            errors={
                              errors.widthCm ? [errors.widthCm] : undefined
                            }
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name="heightCm"
                      control={control}
                      render={({ field }) => (
                        <Field
                          data-invalid={Boolean(errors.heightCm) || undefined}
                        >
                          <DimensionInput
                            id={`${formId}-heightCm`}
                            label={t("form.heightCm")}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={busy}
                            invalid={Boolean(errors.heightCm)}
                            unitLabel={t("form.unit")}
                            decreaseLabel={t("form.decrease", {
                              field: t("form.heightCm"),
                            })}
                            increaseLabel={t("form.increase", {
                              field: t("form.heightCm"),
                            })}
                          />
                          <FieldError
                            errors={
                              errors.heightCm ? [errors.heightCm] : undefined
                            }
                          />
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  </div>
                </FieldSet>

                <Field
                  orientation="horizontal"
                  className="items-center justify-between rounded-lg border border-border/60 px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor={`${formId}-isDefault`}>
                      {t("form.isDefault")}
                    </FieldLabel>
                    <FieldDescription>{t("form.isDefaultHint")}</FieldDescription>
                  </div>
                  <Controller
                    name="isDefault"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id={`${formId}-isDefault`}
                        checked={field.value}
                        disabled={busy}
                        onCheckedChange={field.onChange}
                        aria-describedby={`${formId}-isDefault-hint`}
                      />
                    )}
                  />
                </Field>
              </FieldGroup>
            </DialogBody>

            <DialogFooter className="border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => onOpenChange(false)}
              >
                {tCommon("common.cancel")}
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {t("form.saving")}
                  </>
                ) : (
                  tCommon("common.save")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
