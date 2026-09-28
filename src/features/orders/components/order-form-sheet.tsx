import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AreaComboboxField } from "@/features/locations/components/area-combobox";
import { GovernorateSelectField } from "@/features/locations/components/governorate-select";
import { useSenderLocations } from "@/features/locations/hooks/use-sender-locations";
import { useCreateOrder } from "@/features/orders/hooks/use-create-order";
import { useOrder } from "@/features/orders/hooks/use-order";
import { useUpdateOrder } from "@/features/orders/hooks/use-update-order";
import {
  applyZodIssues,
  handleOrderFormError,
  isConcurrentOrderChange,
  serverErrorOnStep1,
  summarizeZodIssues,
  toOrderFormValues,
  toOrderPayload,
} from "@/features/orders/lib/order-form";
import {
  createOrderStep1Schema,
  createOrderStep2Schema,
  EMPTY_ORDER_FORM_VALUES,
  EMPTY_ORDER_ITEM,
  EMPTY_ORDER_PACKAGE,
  type OrderFormValues,
} from "@/features/orders/schema";
import type { OrderListRow } from "@/features/orders/types";
import { useProducts } from "@/features/products/hooks/use-products";
import type { Product } from "@/features/products/types";
import { DimensionInput } from "@/features/shipping-boxes/components/dimension-input";
import { useShippingBoxes } from "@/features/shipping-boxes/hooks/use-shipping-boxes";
import type { ShippingBox } from "@/features/shipping-boxes/types";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
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
  FieldSet,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/components/ui";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { cn } from "@/shared/lib/utils";
import { SenderLocationStatus } from "@/shared/types/enums";
import { toast } from "sonner";

function RequiredMark() {
  return (
    <abbr
      className="ms-0.5 text-destructive no-underline"
      title="required"
      aria-hidden="true"
    >
      *
    </abbr>
  );
}

function focusFirstInvalid(formId: string) {
  window.setTimeout(() => {
    const root = document.getElementById(formId);
    const invalid = root?.querySelector<HTMLElement>("[aria-invalid='true']");
    invalid?.focus();
    invalid?.scrollIntoView({ block: "nearest" });
  }, 0);
}

interface OrderFormSheetProps {
  mode: "create" | "edit" | "view";
  orderId: string | null;
  listRow: OrderListRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderFormSheet({
  mode,
  orderId,
  listRow,
  open,
  onOpenChange,
}: OrderFormSheetProps) {
  const { t, i18n } = useTranslation("orders");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebounce(productSearch.trim(), 300);

  const resolvedId = orderId ?? listRow?.id ?? null;
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const orderQuery = useOrder(resolvedId, {
    enabled: open && Boolean(resolvedId) && mode !== "create",
  });

  const readOnly =
    isView ||
    listRow?.status === "CANCELLED" ||
    orderQuery.data?.status === "CANCELLED";
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder(resolvedId ?? "");

  const locationsQuery = useSenderLocations({
    page: 0,
    size: 100,
    status: SenderLocationStatus.ACTIVE,
  });
  const shippingBoxesQuery = useShippingBoxes({ page: 0, size: 100 });
  const productsQuery = useProducts(
    { page: 0, size: 20, search: debouncedProductSearch || undefined },
    { enabled: open && debouncedProductSearch.length > 0 },
  );

  const step1Schema = useMemo(
    () => createOrderStep1Schema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );
  const step2Schema = useMemo(
    () => createOrderStep2Schema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    control,
    reset,
    setError,
    clearErrors,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    defaultValues: EMPTY_ORDER_FORM_VALUES,
    shouldUnregister: false,
  });

  const paymentMethod = watch("paymentMethod");
  const governorateId = watch("governorateId");

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control, name: "items" });

  const {
    fields: packageFields,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({ control, name: "packages" });

  useEffect(() => {
    if (!open) {
      reset(EMPTY_ORDER_FORM_VALUES);
      setStep(1);
      setSubmitError(null);
      setProductSearch("");
      return;
    }

    if (mode === "create") {
      reset(EMPTY_ORDER_FORM_VALUES);
      setStep(1);
      setSubmitError(null);
      return;
    }

    const source = orderQuery.data;
    if (!source) return;
    reset(toOrderFormValues(source));
    setStep(1);
  }, [open, mode, orderQuery.data, reset]);

  const applyProductToRow = useCallback(
    (index: number, product: Product) => {
      setValue(`items.${index}.name`, product.name, { shouldDirty: true });
      setValue(`items.${index}.sku`, product.sku, { shouldDirty: true });
      setValue(`items.${index}.unitPrice`, String(product.price), {
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const applyShippingBoxToRow = useCallback(
    (index: number, box: ShippingBox) => {
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
    },
    [setValue],
  );

  const reportIssues = (error: Parameters<typeof summarizeZodIssues>[0]) => {
    setSubmitError(summarizeZodIssues(error));
    window.setTimeout(() => {
      applyZodIssues(error, setError);
      focusFirstInvalid(formId);
    }, 0);
  };

  const handleNextStep = () => {
    clearErrors();
    const result = step1Schema.safeParse(getValues());
    if (!result.success) {
      reportIssues(result.error);
      return;
    }
    setSubmitError(null);
    setStep(2);
  };

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);

  const handleSave = async () => {
    if (readOnly) return;

    clearErrors();
    const values = getValues();
    const result = step2Schema.safeParse({
      orderNumber: values.orderNumber ?? "",
      senderLocationId: values.senderLocationId ?? "",
      paymentMethod: values.paymentMethod,
      orderValue: values.orderValue ?? "",
      codAmount: values.codAmount ?? "",
      invoiceNumber: values.invoiceNumber ?? "",
      description: values.description ?? "",
      deliveryNotes: values.deliveryNotes ?? "",
      items: (values.items ?? []).map((item) => ({
        name: item.name ?? "",
        sku: item.sku ?? "",
        unitPrice: item.unitPrice ?? "",
        quantity: item.quantity ?? "",
      })),
      packages: (values.packages ?? []).map((pkg) => ({
        boxName: pkg.boxName ?? "",
        lengthCm: pkg.lengthCm ?? "",
        widthCm: pkg.widthCm ?? "",
        heightCm: pkg.heightCm ?? "",
        weightKg: pkg.weightKg ?? "",
      })),
    });
    if (!result.success) {
      reportIssues(result.error);
      return;
    }

    setSubmitError(null);

    try {
      const payload = toOrderPayload(values);
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (isEdit && resolvedId) {
        await updateMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      const message = handleOrderFormError(error, setError);
      const detail = message || parseApiError(error).detail || t("toast.saveFailed");
      setSubmitError(detail);
      if (serverErrorOnStep1(error)) setStep(1);
      if (isConcurrentOrderChange(error)) {
        toast.error(detail);
        void orderQuery.refetch();
      } else if (isApiError(error, 422) || !getFieldErrors(error)) {
        toast.error(detail);
      }
    }
  };

  const isLoadingDetail =
    open && mode !== "create" && orderQuery.isLoading && !orderQuery.data;
  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;
  const locations = locationsQuery.data?.content ?? [];
  const shippingBoxes = shippingBoxesQuery.data?.content ?? [];
  const productSuggestions = productsQuery.data?.content ?? [];

  const title =
    mode === "create"
      ? t("form.createTitle")
      : readOnly
        ? t("form.viewTitle", {
            number: orderQuery.data?.orderNumber ?? listRow?.orderNumber ?? "",
          })
        : t("form.editTitle", {
            number: orderQuery.data?.orderNumber ?? listRow?.orderNumber ?? "",
          });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSaving) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w7"
        className="flex max-h-[min(92dvh,960px)] flex-col gap-0 overflow-hidden p-0"
        showCloseButton={!isSaving}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 px-6 py-4 pe-12">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {step === 1 ? t("form.step1Description") : t("form.step2Description")}
          </DialogDescription>
          <ol
            className="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch"
            aria-label={t("form.stepsLabel")}
          >
            <li>
              <StepCard
                number={1}
                kicker={t("form.stepKicker", { number: 1 })}
                title={t("form.step1Title")}
                description={t("form.step1Description")}
                active={step === 1}
                complete={step === 2}
                onSelect={() => setStep(1)}
              />
            </li>
            <li className="hidden items-center sm:flex" aria-hidden="true">
              <span className="h-px w-8 bg-border" />
            </li>
            <li>
              <StepCard
                number={2}
                kicker={t("form.stepKicker", { number: 2 })}
                title={t("form.step2Title")}
                description={t("form.step2Description")}
                active={step === 2}
                complete={false}
                onSelect={handleNextStep}
              />
            </li>
          </ol>
          <p className="pt-2 text-xs text-muted-foreground">{t("form.requiredHint")}</p>
        </DialogHeader>

        {isLoadingDetail ? (
          <div
            className="flex flex-1 items-center justify-center py-16"
            role="status"
            aria-label={tCommon("common.loading")}
          >
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DialogBody ref={bodyRef} className="flex-1 overflow-y-auto px-6 py-4">
            <form
              id={formId}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (step === 2) void handleSave();
              }}
            >
              <div hidden={step !== 1}>
                <FieldSet disabled={readOnly || isSaving}>
                  <FieldGroup className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`${formId}-first-name`}>
                        {t("form.firstName")}
                        <RequiredMark />
                      </FieldLabel>
                      <Input
                        id={`${formId}-first-name`}
                        autoComplete="given-name"
                        aria-required="true"
                        {...register("receiverFirstName")}
                        aria-invalid={Boolean(errors.receiverFirstName)}
                      />
                      <FieldError errors={[errors.receiverFirstName]} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-last-name`}>
                        {t("form.lastName")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-last-name`}
                        autoComplete="family-name"
                        {...register("receiverLastName")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-phone`}>
                        {t("form.phone")}
                        <RequiredMark />
                      </FieldLabel>
                      <Input
                        id={`${formId}-phone`}
                        type="tel"
                        autoComplete="tel"
                        dir="ltr"
                        aria-required="true"
                        {...register("receiverPhone")}
                        aria-invalid={Boolean(errors.receiverPhone)}
                      />
                      <FieldError errors={[errors.receiverPhone]} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-alt-phone`}>
                        {t("form.altPhone")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-alt-phone`}
                        type="tel"
                        dir="ltr"
                        {...register("receiverAltPhone")}
                        aria-invalid={Boolean(errors.receiverAltPhone)}
                      />
                      <FieldError errors={[errors.receiverAltPhone]} />
                    </Field>

                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor={`${formId}-email`}>
                        {t("form.email")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-email`}
                        type="email"
                        autoComplete="email"
                        {...register("receiverEmail")}
                        aria-invalid={Boolean(errors.receiverEmail)}
                      />
                      <FieldError errors={[errors.receiverEmail]} />
                    </Field>

                    <div className="sm:col-span-2">
                      <Controller
                        name="governorateId"
                        control={control}
                        render={({ field }) => (
                          <GovernorateSelectField
                            id={`${formId}-governorate`}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={readOnly || isSaving}
                            invalid={Boolean(errors.governorateId)}
                            label={
                              <>
                                {t("form.governorate")}
                                <RequiredMark />
                              </>
                            }
                            required
                            placeholder={t("form.governoratePlaceholder")}
                          />
                        )}
                      />
                      <FieldError errors={[errors.governorateId]} />
                    </div>

                    <div className="sm:col-span-2">
                      <Controller
                        name="area"
                        control={control}
                        render={({ field }) => (
                          <AreaComboboxField
                            id={`${formId}-area`}
                            value={field.value}
                            onChange={field.onChange}
                            governorateId={governorateId}
                            disabled={readOnly || isSaving}
                            invalid={Boolean(errors.area)}
                            label={
                              <>
                                {t("form.area")}
                                <RequiredMark />
                              </>
                            }
                            required
                          />
                        )}
                      />
                      <FieldError errors={[errors.area]} />
                    </div>

                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor={`${formId}-address-line`}>
                        {t("form.addressLine")}
                        <RequiredMark />
                      </FieldLabel>
                      <Textarea
                        id={`${formId}-address-line`}
                        rows={2}
                        aria-required="true"
                        {...register("addressLine")}
                        aria-invalid={Boolean(errors.addressLine)}
                      />
                      <FieldError errors={[errors.addressLine]} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-street`}>
                        {t("form.street")}
                      </FieldLabel>
                      <Input id={`${formId}-street`} {...register("street")} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-building`}>
                        {t("form.buildingNumber")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-building`}
                        {...register("buildingNumber")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-floor`}>
                        {t("form.floor")}
                      </FieldLabel>
                      <Input id={`${formId}-floor`} {...register("floor")} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-apartment`}>
                        {t("form.apartment")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-apartment`}
                        {...register("apartment")}
                      />
                    </Field>

                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor={`${formId}-landmark`}>
                        {t("form.landmark")}
                      </FieldLabel>
                      <Input id={`${formId}-landmark`} {...register("landmark")} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-postal`}>
                        {t("form.postalCode")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-postal`}
                        {...register("postalCode")}
                        dir="ltr"
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>
              <div hidden={step !== 2}>
                <FieldSet disabled={readOnly || isSaving}>
                  <FieldGroup className="grid gap-4 sm:grid-cols-2">
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor={`${formId}-pickup`}>
                        {t("form.senderLocation")}
                      </FieldLabel>
                      <Controller
                        name="senderLocationId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id={`${formId}-pickup`}>
                              <SelectValue
                                placeholder={t("form.senderLocationPlaceholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {locations.length === 0 && !locationsQuery.isLoading ? (
                        <p className="text-xs text-muted-foreground">
                          {t("form.noSenderLocations")}{" "}
                          <Link
                            to="/locations"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {t("form.openLocations")}
                          </Link>
                        </p>
                      ) : null}
                      <FieldError errors={[errors.senderLocationId]} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-order-number`}>
                        {t("form.orderNumber")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-order-number`}
                        {...register("orderNumber")}
                        aria-invalid={Boolean(errors.orderNumber)}
                      />
                      <FieldError errors={[errors.orderNumber]} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-invoice`}>
                        {t("form.invoiceNumber")}
                      </FieldLabel>
                      <Input id={`${formId}-invoice`} {...register("invoiceNumber")} />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-payment-method`}>
                        {t("form.paymentMethod")}
                        <RequiredMark />
                      </FieldLabel>
                      <Controller
                        name="paymentMethod"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              id={`${formId}-payment-method`}
                              aria-required="true"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COD">{t("payment.COD")}</SelectItem>
                              <SelectItem value="PREPAID">
                                {t("payment.PREPAID")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`${formId}-order-value`}>
                        {t("form.orderValue")}
                        <RequiredMark />
                      </FieldLabel>
                      <Input
                        id={`${formId}-order-value`}
                        inputMode="decimal"
                        dir="ltr"
                        aria-required="true"
                        {...register("orderValue")}
                        aria-invalid={Boolean(errors.orderValue)}
                      />
                      <FieldError errors={[errors.orderValue]} />
                    </Field>

                    {paymentMethod === "COD" ? (
                      <Field>
                        <FieldLabel htmlFor={`${formId}-cod-amount`}>
                          {t("form.codAmount")}
                        </FieldLabel>
                        <Input
                          id={`${formId}-cod-amount`}
                          inputMode="decimal"
                          dir="ltr"
                          placeholder={t("form.codAmountPlaceholder")}
                          {...register("codAmount")}
                          aria-invalid={Boolean(errors.codAmount)}
                        />
                        <FieldError errors={[errors.codAmount]} />
                      </Field>
                    ) : null}

                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor={`${formId}-description`}>
                        {t("form.description")}
                      </FieldLabel>
                      <Input id={`${formId}-description`} {...register("description")} />
                    </Field>

                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor={`${formId}-delivery-notes`}>
                        {t("form.deliveryNotes")}
                      </FieldLabel>
                      <Textarea
                        id={`${formId}-delivery-notes`}
                        rows={2}
                        {...register("deliveryNotes")}
                      />
                    </Field>
                  </FieldGroup>

                  <div className="mt-8 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{t("form.itemsTitle")}</h3>
                      {!readOnly ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendItem({ ...EMPTY_ORDER_ITEM })}
                        >
                          <Plus aria-hidden="true" />
                          {t("form.addItem")}
                        </Button>
                      ) : null}
                    </div>

                    {itemFields.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t("form.itemsOptional")}
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {itemFields.map((field, index) => (
                          <li
                            key={field.id}
                            className="rounded-lg border border-border/70 p-3"
                          >
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {t("form.itemLabel", { index: index + 1 })}
                              </span>
                              {!readOnly ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={t("form.removeItem")}
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2 aria-hidden="true" />
                                </Button>
                              ) : null}
                            </div>

                            {!readOnly ? (
                              <Field className="mb-3">
                                <FieldLabel htmlFor={`${formId}-product-search-${index}`}>
                                  {t("form.productSearch")}
                                </FieldLabel>
                                <Input
                                  id={`${formId}-product-search-${index}`}
                                  value={productSearch}
                                  placeholder={t("form.productSearchPlaceholder")}
                                  onChange={(event) =>
                                    setProductSearch(event.target.value)
                                  }
                                />
                                {productSuggestions.length > 0 &&
                                debouncedProductSearch ? (
                                  <ul
                                    className="mt-1 max-h-40 overflow-y-auto rounded-md border border-border bg-popover p-1"
                                    role="listbox"
                                    aria-label={t("form.productSuggestions")}
                                  >
                                    {productSuggestions.map((product) => (
                                      <li key={product.id}>
                                        <button
                                          type="button"
                                          role="option"
                                          className="flex w-full flex-col px-2 py-1.5 text-start text-sm hover:bg-muted/70"
                                          onClick={() => {
                                            applyProductToRow(index, product);
                                            setProductSearch("");
                                          }}
                                        >
                                          <span>{product.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {product.sku}
                                          </span>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </Field>
                            ) : null}

                            <div className="grid gap-3 sm:grid-cols-2">
                              <Field className="sm:col-span-2">
                                <FieldLabel htmlFor={`${formId}-item-name-${index}`}>
                                  {t("form.itemName")}
                                  <RequiredMark />
                                </FieldLabel>
                                <Input
                                  id={`${formId}-item-name-${index}`}
                                  aria-required="true"
                                  aria-invalid={Boolean(errors.items?.[index]?.name)}
                                  {...register(`items.${index}.name`)}
                                />
                                <FieldError errors={[errors.items?.[index]?.name]} />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor={`${formId}-item-sku-${index}`}>
                                  {t("form.itemSku")}
                                </FieldLabel>
                                <Input
                                  id={`${formId}-item-sku-${index}`}
                                  dir="ltr"
                                  {...register(`items.${index}.sku`)}
                                />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor={`${formId}-item-price-${index}`}>
                                  {t("form.itemUnitPrice")}
                                  <RequiredMark />
                                </FieldLabel>
                                <Input
                                  id={`${formId}-item-price-${index}`}
                                  inputMode="decimal"
                                  dir="ltr"
                                  aria-required="true"
                                  aria-invalid={Boolean(errors.items?.[index]?.unitPrice)}
                                  {...register(`items.${index}.unitPrice`)}
                                />
                                <FieldError errors={[errors.items?.[index]?.unitPrice]} />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor={`${formId}-item-qty-${index}`}>
                                  {t("form.itemQuantity")}
                                  <RequiredMark />
                                </FieldLabel>
                                <Input
                                  id={`${formId}-item-qty-${index}`}
                                  inputMode="numeric"
                                  dir="ltr"
                                  aria-required="true"
                                  aria-invalid={Boolean(errors.items?.[index]?.quantity)}
                                  {...register(`items.${index}.quantity`)}
                                />
                                <FieldError errors={[errors.items?.[index]?.quantity]} />
                              </Field>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-8 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">
                        {t("form.packagesTitle")}
                      </h3>
                      {!readOnly && packageFields.length < 20 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendPackage({ ...EMPTY_ORDER_PACKAGE })
                          }
                        >
                          <Plus aria-hidden="true" />
                          {t("form.addPackage")}
                        </Button>
                      ) : null}
                    </div>

                    <ul className="space-y-4">
                      {packageFields.map((field, index) => (
                        <li
                          key={field.id}
                          className="rounded-lg border border-border/70 p-3"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {t("form.packageLabel", { index: index + 1 })}
                            </span>
                            {!readOnly && packageFields.length > 1 ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={t("form.removePackage")}
                                onClick={() => removePackage(index)}
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            ) : null}
                          </div>

                          {!readOnly && shippingBoxes.length > 0 ? (
                            <Field className="mb-3">
                              <FieldLabel htmlFor={`${formId}-box-preset-${index}`}>
                                {t("form.boxPreset")}
                              </FieldLabel>
                              <Select
                                onValueChange={(boxId) => {
                                  const box = shippingBoxes.find(
                                    (candidate) => candidate.id === boxId,
                                  );
                                  if (box) applyShippingBoxToRow(index, box);
                                }}
                              >
                                <SelectTrigger id={`${formId}-box-preset-${index}`}>
                                  <SelectValue
                                    placeholder={t("form.boxPresetPlaceholder")}
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
                              <FieldLabel htmlFor={`${formId}-box-name-${index}`}>
                                {t("form.boxName")}
                              </FieldLabel>
                              <Input
                                id={`${formId}-box-name-${index}`}
                                {...register(`packages.${index}.boxName`)}
                              />
                            </Field>
                            <Controller
                              name={`packages.${index}.lengthCm`}
                              control={control}
                              render={({ field: lengthField }) => (
                                <>
                                <DimensionInput
                                  id={`${formId}-length-${index}`}
                                  label={
                                    <>
                                      {t("form.lengthCm")}
                                      <RequiredMark />
                                    </>
                                  }
                                  required
                                  value={lengthField.value}
                                  onChange={lengthField.onChange}
                                  onBlur={lengthField.onBlur}
                                  disabled={readOnly || isSaving}
                                  invalid={Boolean(
                                    errors.packages?.[index]?.lengthCm,
                                  )}
                                  unitLabel={t("form.unit")}
                                  decreaseLabel={t("form.decrease", {
                                    field: t("form.lengthCm"),
                                  })}
                                  increaseLabel={t("form.increase", {
                                    field: t("form.lengthCm"),
                                  })}
                                />
                                <FieldError
                                  errors={[errors.packages?.[index]?.lengthCm]}
                                />
                                </>
                              )}
                            />
                            <Controller
                              name={`packages.${index}.widthCm`}
                              control={control}
                              render={({ field: widthField }) => (
                                <>
                                <DimensionInput
                                  id={`${formId}-width-${index}`}
                                  label={
                                    <>
                                      {t("form.widthCm")}
                                      <RequiredMark />
                                    </>
                                  }
                                  required
                                  value={widthField.value}
                                  onChange={widthField.onChange}
                                  onBlur={widthField.onBlur}
                                  disabled={readOnly || isSaving}
                                  invalid={Boolean(
                                    errors.packages?.[index]?.widthCm,
                                  )}
                                  unitLabel={t("form.unit")}
                                  decreaseLabel={t("form.decrease", {
                                    field: t("form.widthCm"),
                                  })}
                                  increaseLabel={t("form.increase", {
                                    field: t("form.widthCm"),
                                  })}
                                />
                                <FieldError
                                  errors={[errors.packages?.[index]?.widthCm]}
                                />
                                </>
                              )}
                            />
                            <Controller
                              name={`packages.${index}.heightCm`}
                              control={control}
                              render={({ field: heightField }) => (
                                <>
                                <DimensionInput
                                  id={`${formId}-height-${index}`}
                                  label={
                                    <>
                                      {t("form.heightCm")}
                                      <RequiredMark />
                                    </>
                                  }
                                  required
                                  value={heightField.value}
                                  onChange={heightField.onChange}
                                  onBlur={heightField.onBlur}
                                  disabled={readOnly || isSaving}
                                  invalid={Boolean(
                                    errors.packages?.[index]?.heightCm,
                                  )}
                                  unitLabel={t("form.unit")}
                                  decreaseLabel={t("form.decrease", {
                                    field: t("form.heightCm"),
                                  })}
                                  increaseLabel={t("form.increase", {
                                    field: t("form.heightCm"),
                                  })}
                                />
                                <FieldError
                                  errors={[errors.packages?.[index]?.heightCm]}
                                />
                                </>
                              )}
                            />
                            <Field>
                              <FieldLabel htmlFor={`${formId}-weight-${index}`}>
                                {t("form.weightKg")}
                                <RequiredMark />
                              </FieldLabel>
                              <Input
                                id={`${formId}-weight-${index}`}
                                inputMode="decimal"
                                dir="ltr"
                                aria-required="true"
                                aria-invalid={Boolean(
                                  errors.packages?.[index]?.weightKg,
                                )}
                                {...register(`packages.${index}.weightKg`)}
                              />
                              <FieldError
                                errors={[errors.packages?.[index]?.weightKg]}
                              />
                            </Field>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {errors.packages?.root ? (
                      <FieldError errors={[errors.packages.root]} />
                    ) : null}
                  </div>
                </FieldSet>
              </div>
            </form>
          </DialogBody>
        )}

        <DialogFooter className="flex-col items-stretch border-t border-border/60 px-6 py-4 sm:flex-col sm:items-stretch">
          {submitError ? (
            <p
              role="alert"
              className="whitespace-pre-line text-sm text-destructive"
            >
              {submitError}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {step === 2 ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => setStep(1)}
            >
              {tCommon("common.back")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              {tCommon("common.cancel")}
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              disabled={isLoadingDetail}
              onClick={() =>
                void (readOnly ? setStep(2) : handleNextStep())
              }
            >
              {readOnly ? tCommon("common.next") : tCommon("common.next")}
            </Button>
          ) : readOnly ? (
            <Button type="button" onClick={() => onOpenChange(false)}>
              {tCommon("common.close")}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSaving || isLoadingDetail}
              onClick={() => void handleSave()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("form.saving")}
                </>
              ) : (
                tCommon("common.save")
              )}
            </Button>
          )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepCard({
  number,
  kicker,
  title,
  description,
  active,
  complete,
  onSelect,
}: {
  number: number;
  kicker: string;
  title: string;
  description: string;
  active: boolean;
  complete: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "step" : undefined}
      className={cn(
        "flex h-full w-full items-start gap-3 rounded-xl border px-3 py-3 text-start transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:bg-muted/40",
      )}
      onClick={onSelect}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold",
          active || complete
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {complete ? <Check className="size-4" /> : number}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">
          {kicker}
        </span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}
