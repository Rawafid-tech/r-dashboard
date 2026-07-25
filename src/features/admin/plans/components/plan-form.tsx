import { useEffect, useId, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
  Textarea,
} from "@/shared/components/ui";
import { PlanFeaturesEditor } from "@/features/admin/plans/components/plan-features-editor";
import { PlanTiersEditor } from "@/features/admin/plans/components/plan-tiers-editor";
import {
  applyPlanFieldErrors,
  useCreatePlan,
} from "@/features/admin/plans/hooks/use-create-plan";
import { applyPlanFieldErrors as applyUpdateFieldErrors, useUpdatePlan } from "@/features/admin/plans/hooks/use-update-plan";
import {
  EMPTY_PLAN_FORM_VALUES,
  toCreatePlanPayload,
  toPlanFormValues,
  toUpdatePlanPayload,
} from "@/features/admin/plans/lib/plan-form-mapper";
import {
  createPlanSchema,
  createUpdatePlanSchema,
  type PlanFormValues,
} from "@/features/admin/plans/schema";
import type { AdminPlan } from "@/features/admin/plans/types";
import { useAppForm } from "@/shared/hooks/use-app-form";

interface PlanFormProps {
  mode: "create" | "edit";
  plan?: AdminPlan;
  canEdit: boolean;
  onCreateSuccess?: (plan: AdminPlan) => void;
}

export function PlanForm({
  mode,
  plan,
  canEdit,
  onCreateSuccess,
}: PlanFormProps) {
  const { t, i18n } = useTranslation("admin");
  const formId = useId();
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan(plan?.id ?? "");
  const isCreate = mode === "create";

  const schema = useMemo(
    () => (isCreate ? createPlanSchema(t) : createUpdatePlanSchema(t)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language, isCreate],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useAppForm({
    schema,
    defaultValues: EMPTY_PLAN_FORM_VALUES,
    mode: "onBlur",
  });

  const customPricing = watch("customPricing");

  useEffect(() => {
    if (isCreate || !plan) return;
    reset(toPlanFormValues(plan));
  }, [isCreate, plan, reset]);

  useEffect(() => {
    if (!customPricing) return;
    setValue("tiers", [], { shouldDirty: true });
  }, [customPricing, setValue]);

  const onSubmit = handleSubmit(async (values: PlanFormValues) => {
    try {
      if (isCreate) {
        const created = await createMutation.mutateAsync(
          toCreatePlanPayload(values),
        );
        onCreateSuccess?.(created);
        return;
      }

      if (!plan) return;

      await updateMutation.mutateAsync(toUpdatePlanPayload(values));
    } catch (error) {
      if (isCreate) {
        applyPlanFieldErrors(error, setError);
      } else {
        applyUpdateFieldErrors(error, setError);
      }
    }
  });

  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;
  const readOnly = !canEdit;

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="space-y-6">
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>{t("plans.form.basics.title")}</CardTitle>
          <CardDescription>{t("plans.form.basics.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet disabled={readOnly || isSaving}>
            <FieldGroup>
              {isCreate ? (
                <Field>
                  <FieldLabel htmlFor={`${formId}-code`}>
                    {t("plans.form.basics.code")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-code`}
                    placeholder={t("plans.form.basics.codePlaceholder")}
                    className="font-mono uppercase"
                    aria-invalid={Boolean(errors.code)}
                    {...register("code", {
                      setValueAs: (value: string) =>
                        value.trim().toUpperCase(),
                    })}
                  />
                  <FieldDescription>
                    {t("plans.form.basics.codeHint")}
                  </FieldDescription>
                  <FieldError errors={errors.code ? [errors.code] : undefined} />
                </Field>
              ) : (
                <Field>
                  <FieldLabel>{t("plans.form.basics.code")}</FieldLabel>
                  <p className="font-mono text-sm uppercase text-foreground">
                    {plan?.code}
                  </p>
                  <FieldDescription>
                    {t("plans.form.basics.codeImmutable")}
                  </FieldDescription>
                </Field>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`${formId}-name-en`}>
                    {t("plans.form.basics.nameEn")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-name-en`}
                    aria-invalid={Boolean(errors.nameEn)}
                    {...register("nameEn")}
                  />
                  <FieldError
                    errors={errors.nameEn ? [errors.nameEn] : undefined}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${formId}-name-ar`}>
                    {t("plans.form.basics.nameAr")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-name-ar`}
                    aria-invalid={Boolean(errors.nameAr)}
                    {...register("nameAr")}
                  />
                  <FieldError
                    errors={errors.nameAr ? [errors.nameAr] : undefined}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`${formId}-description-en`}>
                    {t("plans.form.basics.descriptionEn")}
                  </FieldLabel>
                  <Textarea
                    id={`${formId}-description-en`}
                    rows={3}
                    aria-invalid={Boolean(errors.descriptionEn)}
                    {...register("descriptionEn")}
                  />
                  <FieldError
                    errors={
                      errors.descriptionEn ? [errors.descriptionEn] : undefined
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${formId}-description-ar`}>
                    {t("plans.form.basics.descriptionAr")}
                  </FieldLabel>
                  <Textarea
                    id={`${formId}-description-ar`}
                    rows={3}
                    aria-invalid={Boolean(errors.descriptionAr)}
                    {...register("descriptionAr")}
                  />
                  <FieldError
                    errors={
                      errors.descriptionAr ? [errors.descriptionAr] : undefined
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor={`${formId}-sort-order`}>
                    {t("plans.form.basics.sortOrder")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-sort-order`}
                    type="number"
                    min={0}
                    step={1}
                    aria-invalid={Boolean(errors.sortOrder)}
                    {...register("sortOrder", { valueAsNumber: true })}
                  />
                  <FieldError
                    errors={errors.sortOrder ? [errors.sortOrder] : undefined}
                  />
                </Field>

                <Field orientation="horizontal">
                  <Controller
                    control={control}
                    name="highlighted"
                    render={({ field }) => (
                      <Checkbox
                        id={`${formId}-highlighted`}
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        disabled={readOnly || isSaving}
                      />
                    )}
                  />
                  <FieldLabel htmlFor={`${formId}-highlighted`}>
                    {t("plans.form.basics.highlighted")}
                  </FieldLabel>
                </Field>

                <Field orientation="horizontal">
                  <Controller
                    control={control}
                    name="customPricing"
                    render={({ field }) => (
                      <Checkbox
                        id={`${formId}-custom-pricing`}
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        disabled={readOnly || isSaving}
                      />
                    )}
                  />
                  <FieldLabel htmlFor={`${formId}-custom-pricing`}>
                    {t("plans.form.basics.customPricing")}
                  </FieldLabel>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>{t("plans.form.tiers.cardTitle")}</CardTitle>
          <CardDescription>{t("plans.form.tiers.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanTiersEditor
            control={control}
            errors={errors}
            disabled={readOnly || isSaving}
            customPricing={customPricing}
          />
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>{t("plans.form.features.cardTitle")}</CardTitle>
          <CardDescription>
            {t("plans.form.features.cardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanFeaturesEditor
            control={control}
            errors={errors}
            disabled={readOnly || isSaving}
          />
        </CardContent>
      </Card>

      {canEdit ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={isSaving || (!isCreate && !isDirty)}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("plans.form.saving")}
              </>
            ) : isCreate ? (
              t("plans.form.create")
            ) : (
              t("plans.form.save")
            )}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          {t("plans.form.readOnlyHint")}
        </p>
      )}
    </form>
  );
}
