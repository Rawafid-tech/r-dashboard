import { useEffect, useId, useMemo } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useOrder } from "@/features/orders/hooks/use-order";
import { useUpdateOrderPackages } from "@/features/orders/hooks/use-update-order-packages";
import { toOrderFormValues } from "@/features/orders/lib/order-form";
import {
  createOrderPackageSchema,
  EMPTY_ORDER_PACKAGE,
  type OrderFormValues,
} from "@/features/orders/schema";
import { DimensionInput } from "@/features/shipping-boxes/components/dimension-input";
import { useShippingBoxes } from "@/features/shipping-boxes/hooks/use-shipping-boxes";
import type { ShippingBox } from "@/features/shipping-boxes/types";
import { parseApiError } from "@/shared/api/error-handler";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";

interface OrderPackagesEditDialogProps {
  orderId: string | null;
  orderNumber?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

type PackageFormValues = Pick<OrderFormValues, "packages">;

export function OrderPackagesEditDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
  onSaved,
}: OrderPackagesEditDialogProps) {
  const { t } = useTranslation(["orders", "common"]);
  const formId = useId();
  const orderQuery = useOrder(orderId, { enabled: open && Boolean(orderId) });
  const updateMutation = useUpdateOrderPackages();
  const shippingBoxesQuery = useShippingBoxes({ page: 0, size: 100 });

  const packageSchema = useMemo(
    () =>
      z.object({
        packages: z
          .array(createOrderPackageSchema(t))
          .min(1, t("orders:form.validation.packageRequired"))
          .max(20),
      }),
    [t],
  );

  const {
    register,
    control,
    reset,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormValues>({
    defaultValues: { packages: [{ ...EMPTY_ORDER_PACKAGE }] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });

  useEffect(() => {
    if (!open || !orderQuery.data) return;
    const values = toOrderFormValues(orderQuery.data);
    reset({ packages: values.packages });
  }, [open, orderQuery.data, reset]);

  const shippingBoxes = shippingBoxesQuery.data?.content ?? [];

  const applyShippingBoxToRow = (index: number, box: ShippingBox) => {
    setValue(`packages.${index}.boxName`, box.name, { shouldDirty: true });
    setValue(`packages.${index}.lengthCm`, String(box.lengthCm), {
      shouldDirty: true,
    });
    setValue(`packages.${index}.widthCm`, String(box.widthCm), {
      shouldDirty: true,
    });
    setValue(`packages.${index}.heightCm`, String(box.heightCm), {
      shouldDirty: true,
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!orderId) return;
    const parsed = packageSchema.safeParse(values);
    if (!parsed.success) return;

    const packages = parsed.data.packages.map((pkg) => ({
      boxName: pkg.boxName?.trim() || undefined,
      lengthCm: Number(pkg.lengthCm),
      widthCm: Number(pkg.widthCm),
      heightCm: Number(pkg.heightCm),
      weightKg: Number(pkg.weightKg),
    }));

    try {
      await updateMutation.mutateAsync({ orderId, packages });
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      setError("root", {
        type: "server",
        message: parseApiError(error).detail,
      });
    }
  });

  const isSaving = isSubmitting || updateMutation.isPending;
  const isLoading = open && orderQuery.isLoading && !orderQuery.data;

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent
        size="w4"
        className="gap-0 overflow-hidden"
        closeLabel={t("common:common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>
            {t("orders:form.packagesTitle")}
            {orderNumber ? ` — ${orderNumber}` : ""}
          </DialogTitle>
          <DialogDescription>{t("shipments:bulkBooking.packagesEditDescription")}</DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          className="max-h-[min(65vh,28rem)] overflow-y-auto px-6 py-4"
          onSubmit={(event) => void onSubmit(event)}
        >
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("common:common.loading")}
            </p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {t("shipments:bulkBooking.packagesEditHint")}
                </p>
                {fields.length < 20 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ...EMPTY_ORDER_PACKAGE })}
                  >
                    <Plus aria-hidden="true" />
                    {t("orders:form.addPackage")}
                  </Button>
                ) : null}
              </div>

              <ul className="space-y-4">
                {fields.map((field, index) => (
                  <li
                    key={field.id}
                    className="rounded-lg border border-border/70 p-3"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("orders:form.packageLabel", { index: index + 1 })}
                      </span>
                      {fields.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("orders:form.removePackage")}
                          onClick={() => remove(index)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>

                    {shippingBoxes.length > 0 ? (
                      <Field className="mb-3">
                        <FieldLabel htmlFor={`${formId}-preset-${index}`}>
                          {t("orders:form.boxPreset")}
                        </FieldLabel>
                        <Select
                          onValueChange={(boxId) => {
                            const box = shippingBoxes.find((b) => b.id === boxId);
                            if (box) applyShippingBoxToRow(index, box);
                          }}
                        >
                          <SelectTrigger id={`${formId}-preset-${index}`}>
                            <SelectValue
                              placeholder={t("orders:form.boxPresetPlaceholder")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {shippingBoxes.map((box) => (
                              <SelectItem key={box.id} value={box.id}>
                                {box.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor={`${formId}-name-${index}`}>
                          {t("orders:form.boxName")}
                        </FieldLabel>
                        <Input
                          id={`${formId}-name-${index}`}
                          {...register(`packages.${index}.boxName`)}
                        />
                      </Field>
                      <Controller
                        name={`packages.${index}.lengthCm`}
                        control={control}
                        render={({ field: lengthField }) => (
                          <DimensionInput
                            id={`${formId}-length-${index}`}
                            label={t("orders:form.lengthCm")}
                            required
                            value={lengthField.value}
                            onChange={lengthField.onChange}
                            onBlur={lengthField.onBlur}
                            invalid={Boolean(errors.packages?.[index]?.lengthCm)}
                            unitLabel={t("orders:form.unit")}
                            decreaseLabel={t("orders:form.decrease", {
                              field: t("orders:form.lengthCm"),
                            })}
                            increaseLabel={t("orders:form.increase", {
                              field: t("orders:form.lengthCm"),
                            })}
                          />
                        )}
                      />
                      <Controller
                        name={`packages.${index}.widthCm`}
                        control={control}
                        render={({ field: widthField }) => (
                          <DimensionInput
                            id={`${formId}-width-${index}`}
                            label={t("orders:form.widthCm")}
                            required
                            value={widthField.value}
                            onChange={widthField.onChange}
                            onBlur={widthField.onBlur}
                            invalid={Boolean(errors.packages?.[index]?.widthCm)}
                            unitLabel={t("orders:form.unit")}
                            decreaseLabel={t("orders:form.decrease", {
                              field: t("orders:form.widthCm"),
                            })}
                            increaseLabel={t("orders:form.increase", {
                              field: t("orders:form.widthCm"),
                            })}
                          />
                        )}
                      />
                      <Controller
                        name={`packages.${index}.heightCm`}
                        control={control}
                        render={({ field: heightField }) => (
                          <DimensionInput
                            id={`${formId}-height-${index}`}
                            label={t("orders:form.heightCm")}
                            required
                            value={heightField.value}
                            onChange={heightField.onChange}
                            onBlur={heightField.onBlur}
                            invalid={Boolean(errors.packages?.[index]?.heightCm)}
                            unitLabel={t("orders:form.unit")}
                            decreaseLabel={t("orders:form.decrease", {
                              field: t("orders:form.heightCm"),
                            })}
                            increaseLabel={t("orders:form.increase", {
                              field: t("orders:form.heightCm"),
                            })}
                          />
                        )}
                      />
                      <Field>
                        <FieldLabel htmlFor={`${formId}-weight-${index}`}>
                          {t("orders:form.weightKg")}
                        </FieldLabel>
                        <Input
                          id={`${formId}-weight-${index}`}
                          inputMode="decimal"
                          dir="ltr"
                          aria-invalid={Boolean(errors.packages?.[index]?.weightKg)}
                          {...register(`packages.${index}.weightKg`)}
                        />
                        <FieldError errors={[errors.packages?.[index]?.weightKg]} />
                      </Field>
                    </div>
                  </li>
                ))}
              </ul>

              {errors.root ? (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {errors.root.message}
                </p>
              ) : null}
            </>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            {t("common:common.cancel")}
          </Button>
          <Button type="submit" form={formId} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("orders:form.saving")}
              </>
            ) : (
              t("common:common.save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
