import { Loader2 } from "lucide-react";
import { useEffect, useId, useMemo } from "react";
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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { useCreateProductCategory } from "@/features/products/hooks/use-create-product-category";
import { useUpdateProductCategory } from "@/features/products/hooks/use-update-product-category";
import { toCategoryPayload } from "@/features/products/hooks/use-delete-product-category";
import { isDuplicateCategoryNameConflict } from "@/features/products/hooks/use-create-product-category";
import { getParentPickerOptions } from "@/features/products/lib/category-tree-utils";
import {
  createCategoryFormSchema,
  EMPTY_CATEGORY_FORM_VALUES,
  type CategoryFormValues,
} from "@/features/products/schema";
import type { ProductCategory } from "@/features/products/types";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { parseApiError } from "@/shared/api/error-handler";

interface CategoryFormDialogProps {
  mode: "create" | "edit";
  category: ProductCategory | null;
  categories: ProductCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryFormDialog({
  mode,
  category,
  categories,
  open,
  onOpenChange,
}: CategoryFormDialogProps) {
  const { t, i18n } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const categoryId = category?.id ?? null;

  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory(categoryId ?? "");

  const schema = useMemo(
    () => createCategoryFormSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: EMPTY_CATEGORY_FORM_VALUES,
    mode: "onBlur",
  });

  const parentId = watch("parentId");

  const parentOptions = useMemo(
    () => getParentPickerOptions(categories, categoryId ?? undefined),
    [categories, categoryId],
  );

  useEffect(() => {
    if (!open) {
      reset(EMPTY_CATEGORY_FORM_VALUES);
      return;
    }

    if (mode === "edit" && category) {
      reset({
        name: category.name,
        parentId: category.parentId ?? "",
      });
      return;
    }

    reset(EMPTY_CATEGORY_FORM_VALUES);
  }, [open, mode, category, reset]);

  const busy =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit(async (values: CategoryFormValues) => {
    const payload = toCategoryPayload(values);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (categoryId) {
        await updateMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error) {
      if (isDuplicateCategoryNameConflict(error)) {
        setError("name", {
          type: "server",
          message: parseApiError(error).detail,
        });
      }
    }
  });

  const title =
    mode === "create"
      ? t("categories.form.createTitle")
      : t("categories.form.editTitle");
  const description =
    mode === "create"
      ? t("categories.form.createDescription")
      : t("categories.form.editDescription");

  const showParentPicker =
    mode === "create" ||
    (mode === "edit" && category && category.parentId != null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w2"
        className="gap-0 overflow-hidden"
        showCloseButton={!busy}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

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
                  {t("categories.form.name")}
                </FieldLabel>
                <Input
                  id={`${formId}-name`}
                  placeholder={t("categories.form.namePlaceholder")}
                  aria-invalid={Boolean(errors.name) || undefined}
                  disabled={busy}
                  {...register("name")}
                />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>

              {showParentPicker ? (
                <div className="space-y-1.5">
                  <Label htmlFor={`${formId}-parent`}>
                    {t("categories.form.parent")}
                  </Label>
                  <Select
                    value={parentId || "__top__"}
                    onValueChange={(value) =>
                      setValue("parentId", value === "__top__" ? "" : value, {
                        shouldDirty: true,
                      })
                    }
                    disabled={busy}
                  >
                    <SelectTrigger
                      id={`${formId}-parent`}
                      className="w-full"
                      aria-label={t("categories.form.parent")}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__top__">
                        {t("categories.form.parentTopLevel")}
                      </SelectItem>
                      {parentOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {t("categories.form.parentHint")}
                  </FieldDescription>
                </div>
              ) : null}
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
                  {t("categories.form.saving")}
                </>
              ) : (
                tCommon("common.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
