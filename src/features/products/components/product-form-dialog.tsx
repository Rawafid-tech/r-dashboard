import { Loader2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DimensionInput } from "@/features/shipping-boxes/components/dimension-input";
import { ProductCategorySelect } from "@/features/products/components/product-category-select";
import { ProductImageField } from "@/features/products/components/product-image-field";
import {
  hasVariantFormErrors,
  ProductVariantsEditor,
  type ProductVariantsEditorHandle,
} from "@/features/products/components/product-variants-editor";
import { useCreateProduct } from "@/features/products/hooks/use-create-product";
import { useProduct } from "@/features/products/hooks/use-product";
import { useProductCategories } from "@/features/products/hooks/use-product-categories";
import { useReplaceProductVariants } from "@/features/products/hooks/use-replace-product-variants";
import { useUpdateProduct } from "@/features/products/hooks/use-update-product";
import {
  handleProductFormError,
  handleVariantFormError,
  isVariantsFieldError,
} from "@/features/products/lib/product-form-errors";
import {
  toCreateProductPayload,
  toProductFormValues,
  toProductPayload,
} from "@/features/products/lib/product-payload";
import type { VariantFormErrors } from "@/features/products/lib/product-variants";
import {
  createProductFormSchema,
  EMPTY_PRODUCT_FORM_VALUES,
  type ProductFormValues,
} from "@/features/products/schema";
import { PRODUCT_HANDLING_VALUES, type Product } from "@/features/products/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";

interface ProductFormDialogProps {
  mode: "create" | "edit";
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createDefaults?: { barcode?: string };
}

export function ProductFormDialog({
  mode,
  product,
  open,
  onOpenChange,
  createDefaults,
}: ProductFormDialogProps) {
  const { t, i18n } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const productId = product?.id ?? null;

  const productQuery = useProduct(productId, {
    enabled: open && mode === "edit" && Boolean(productId),
  });
  const categoriesQuery = useProductCategories({ enabled: open });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId ?? "");
  const replaceVariantsMutation = useReplaceProductVariants(productId ?? "");
  const variantsEditorRef = useRef<ProductVariantsEditorHandle>(null);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [variantErrors, setVariantErrors] = useState<VariantFormErrors>({});

  const schema = useMemo(
    () => createProductFormSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useAppForm({
    schema,
    defaultValues: EMPTY_PRODUCT_FORM_VALUES,
    mode: "onBlur",
  });

  const productName = watch("name");

  useEffect(() => {
    if (!open) {
      reset(EMPTY_PRODUCT_FORM_VALUES);
      setImagePreviewUrl(null);
      setVariantErrors({});
      return;
    }

    if (mode === "edit") {
      const source = productQuery.data ?? product;
      if (!source) return;
      reset(toProductFormValues(source));
      setImagePreviewUrl(source.imageUrl);
      return;
    }

    reset({
      ...EMPTY_PRODUCT_FORM_VALUES,
      ...(createDefaults?.barcode
        ? { barcode: createDefaults.barcode }
        : {}),
    });
    setImagePreviewUrl(null);
  }, [open, mode, product, productQuery.data, reset, createDefaults]);

  const busy =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    replaceVariantsMutation.isPending;
  const isLoading =
    open && mode === "edit" && productQuery.isLoading && !productQuery.data;

  const clearDimensions = () => {
    setValue("lengthCm", "", { shouldDirty: true });
    setValue("widthCm", "", { shouldDirty: true });
    setValue("heightCm", "", { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (values: ProductFormValues) => {
    const editor = variantsEditorRef.current;
    const variantValidation = editor?.validate() ?? {};
    if (hasVariantFormErrors(variantValidation)) {
      setVariantErrors(variantValidation);
      return;
    }

    setVariantErrors({});
    const variantRequests = editor?.getVariantRequests() ?? [];

    try {
      if (mode === "create") {
        try {
          await createMutation.mutateAsync(
            toCreateProductPayload(values, variantRequests),
          );
        } catch (error) {
          if (isVariantsFieldError(error)) {
            const editorState = variantsEditorRef.current;
            if (editorState) {
              setVariantErrors(
                handleVariantFormError(error, editorState.getRowIds()),
              );
            }
            return;
          }
          throw error;
        }
        onOpenChange(false);
        return;
      }

      if (!productId || !editor) return;

      const productPayload = toProductPayload(values);
      const variantsDirty = editor.isDirty();

      if (isDirty) {
        await updateMutation.mutateAsync(productPayload);
      }

      if (variantsDirty) {
        try {
          await replaceVariantsMutation.mutateAsync({
            variants: variantRequests,
          });
        } catch (error) {
          setVariantErrors(
            handleVariantFormError(error, editor.getRowIds()),
          );
          if (isDirty) {
            toast.success(t("toast.updated"));
          }
          return;
        }
      }

      if (variantsDirty && !isDirty) {
        toast.success(t("toast.updated"));
      }

      onOpenChange(false);
    } catch (error) {
      if (isVariantsFieldError(error)) {
        const editorState = variantsEditorRef.current;
        if (editorState) {
          setVariantErrors(
            handleVariantFormError(error, editorState.getRowIds()),
          );
        }
        return;
      }

      handleProductFormError(error, setError);
    }
  });

  const variantsResetKey = open
    ? mode === "edit"
      ? (productId ?? "edit")
      : "create"
    : "closed";

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
        size="w6"
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
            <DialogBody className="max-h-[min(70vh,720px)] space-y-6 overflow-y-auto">
              <FieldSet>
                <FieldLegend>{t("form.identityLegend")}</FieldLegend>
                <FieldGroup className="gap-4 pt-2">
                  <Field data-invalid={Boolean(errors.name) || undefined}>
                    <FieldLabel htmlFor={`${formId}-name`}>
                      {t("form.name")}
                    </FieldLabel>
                    <Input
                      id={`${formId}-name`}
                      placeholder={t("form.namePlaceholder")}
                      disabled={busy}
                      aria-invalid={Boolean(errors.name) || undefined}
                      {...register("name")}
                    />
                    <FieldError
                      errors={errors.name ? [errors.name] : undefined}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field data-invalid={Boolean(errors.sku) || undefined}>
                      <FieldLabel htmlFor={`${formId}-sku`}>
                        {t("form.sku")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-sku`}
                        dir="ltr"
                        placeholder={t("form.skuPlaceholder")}
                        disabled={busy}
                        aria-invalid={Boolean(errors.sku) || undefined}
                        {...register("sku")}
                      />
                      <FieldError
                        errors={errors.sku ? [errors.sku] : undefined}
                      />
                    </Field>

                    <Field data-invalid={Boolean(errors.barcode) || undefined}>
                      <FieldLabel htmlFor={`${formId}-barcode`}>
                        {t("form.barcode")}
                      </FieldLabel>
                      <Input
                        id={`${formId}-barcode`}
                        dir="ltr"
                        placeholder={t("form.barcodePlaceholder")}
                        disabled={busy}
                        aria-invalid={Boolean(errors.barcode) || undefined}
                        {...register("barcode")}
                      />
                      <FieldError
                        errors={errors.barcode ? [errors.barcode] : undefined}
                      />
                    </Field>
                  </div>

                  <Controller
                    name="imageMediaId"
                    control={control}
                    render={({ field }) => (
                      <ProductImageField
                        formId={formId}
                        imageMediaId={field.value ?? ""}
                        imageUrl={imagePreviewUrl}
                        productName={productName}
                        disabled={busy}
                        onImageChange={(mediaId, url) => {
                          field.onChange(mediaId);
                          setImagePreviewUrl(url);
                        }}
                      />
                    )}
                  />
                </FieldGroup>
              </FieldSet>

              <FieldSet>
                <FieldLegend>{t("form.shippingLegend")}</FieldLegend>
                <FieldGroup className="gap-4 pt-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field data-invalid={Boolean(errors.price) || undefined}>
                      <FieldLabel htmlFor={`${formId}-price`}>
                        {t("form.price")}
                      </FieldLabel>
                      <FieldDescription>{t("form.priceHint")}</FieldDescription>
                      <Input
                        id={`${formId}-price`}
                        dir="ltr"
                        inputMode="decimal"
                        disabled={busy}
                        aria-invalid={Boolean(errors.price) || undefined}
                        className="tabular-nums"
                        {...register("price")}
                      />
                      <FieldError
                        errors={errors.price ? [errors.price] : undefined}
                      />
                    </Field>

                    <Field data-invalid={Boolean(errors.weightKg) || undefined}>
                      <FieldLabel htmlFor={`${formId}-weightKg`}>
                        {t("form.weightKg")}
                      </FieldLabel>
                      <FieldDescription>{t("form.weightHint")}</FieldDescription>
                      <div className="relative pt-1">
                        <Input
                          id={`${formId}-weightKg`}
                          dir="ltr"
                          inputMode="decimal"
                          disabled={busy}
                          aria-invalid={Boolean(errors.weightKg) || undefined}
                          className="pe-12 tabular-nums"
                          {...register("weightKg")}
                        />
                        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
                          {t("form.weightUnit")}
                        </span>
                      </div>
                      <FieldError
                        errors={
                          errors.weightKg ? [errors.weightKg] : undefined
                        }
                      />
                    </Field>
                  </div>

                  <FieldSet>
                    <FieldLegend>{t("form.dimensionsLegend")}</FieldLegend>
                    <FieldDescription>{t("form.dimensionsHint")}</FieldDescription>
                    <div className="flex flex-wrap items-end gap-3 pt-2">
                      <FieldGroup className="grid flex-1 gap-4 sm:grid-cols-3">
                        <Controller
                          name="lengthCm"
                          control={control}
                          render={({ field }) => (
                            <Field
                              data-invalid={
                                Boolean(errors.lengthCm) || undefined
                              }
                            >
                              <DimensionInput
                                id={`${formId}-lengthCm`}
                                label={t("form.lengthCm")}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={busy}
                                invalid={Boolean(errors.lengthCm)}
                                unitLabel={t("form.dimensionUnit")}
                                decreaseLabel={t("form.lengthCm")}
                                increaseLabel={t("form.lengthCm")}
                              />
                              <FieldError
                                errors={
                                  errors.lengthCm
                                    ? [errors.lengthCm]
                                    : undefined
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
                                unitLabel={t("form.dimensionUnit")}
                                decreaseLabel={t("form.widthCm")}
                                increaseLabel={t("form.widthCm")}
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
                              data-invalid={
                                Boolean(errors.heightCm) || undefined
                              }
                            >
                              <DimensionInput
                                id={`${formId}-heightCm`}
                                label={t("form.heightCm")}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={busy}
                                invalid={Boolean(errors.heightCm)}
                                unitLabel={t("form.dimensionUnit")}
                                decreaseLabel={t("form.heightCm")}
                                increaseLabel={t("form.heightCm")}
                              />
                              <FieldError
                                errors={
                                  errors.heightCm
                                    ? [errors.heightCm]
                                    : undefined
                                }
                              />
                            </Field>
                          )}
                        />
                      </FieldGroup>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={clearDimensions}
                      >
                        {t("form.clearDimensions")}
                      </Button>
                    </div>
                  </FieldSet>

                  <Field data-invalid={Boolean(errors.handling) || undefined}>
                    <FieldLabel htmlFor={`${formId}-handling`}>
                      {t("form.handling")}
                    </FieldLabel>
                    <FieldDescription>{t("form.handlingHint")}</FieldDescription>
                    <Controller
                      name="handling"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={busy}
                        >
                          <SelectTrigger
                            id={`${formId}-handling`}
                            className="max-w-xs"
                            aria-invalid={Boolean(errors.handling) || undefined}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_HANDLING_VALUES.map((handling) => (
                              <SelectItem key={handling} value={handling}>
                                {t(`handling.${handling}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError
                      errors={errors.handling ? [errors.handling] : undefined}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet>
                <FieldLegend>{t("form.customsLegend")}</FieldLegend>
                <FieldGroup className="gap-4 pt-2">
                  <Field data-invalid={Boolean(errors.hsCode) || undefined}>
                    <FieldLabel htmlFor={`${formId}-hsCode`}>
                      {t("form.hsCode")}
                    </FieldLabel>
                    <FieldDescription>{t("form.hsCodeHint")}</FieldDescription>
                    <Input
                      id={`${formId}-hsCode`}
                      dir="ltr"
                      placeholder={t("form.hsCodePlaceholder")}
                      disabled={busy}
                      aria-invalid={Boolean(errors.hsCode) || undefined}
                      {...register("hsCode")}
                    />
                    <FieldError
                      errors={errors.hsCode ? [errors.hsCode] : undefined}
                    />
                  </Field>

                  <Field data-invalid={Boolean(errors.description) || undefined}>
                    <FieldLabel htmlFor={`${formId}-description`}>
                      {t("form.description")}
                    </FieldLabel>
                    <Textarea
                      id={`${formId}-description`}
                      rows={3}
                      placeholder={t("form.descriptionPlaceholder")}
                      disabled={busy}
                      aria-invalid={Boolean(errors.description) || undefined}
                      {...register("description")}
                    />
                    <FieldError
                      errors={
                        errors.description ? [errors.description] : undefined
                      }
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <ProductVariantsEditor
                ref={variantsEditorRef}
                mode={mode}
                formId={formId}
                disabled={busy}
                resetKey={variantsResetKey}
                initialVariants={(productQuery.data ?? product)?.variants ?? []}
                serverErrors={variantErrors}
              />

              <FieldSet>
                <FieldLegend>{t("form.categoryLegend")}</FieldLegend>
                <div className="pt-2">
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <ProductCategorySelect
                        id={`${formId}-category`}
                        categories={categoriesQuery.data ?? []}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={busy}
                        invalid={Boolean(errors.categoryId)}
                      />
                    )}
                  />
                </div>
              </FieldSet>
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
