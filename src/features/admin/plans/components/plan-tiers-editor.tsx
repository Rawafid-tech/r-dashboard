import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useFieldArray,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
} from "@/shared/components/ui";
import type { PlanFormValues } from "@/features/admin/plans/schema";
import {
  getIndexedFieldError,
  PlanArrayRootError,
  PlanIndexedFieldError,
} from "@/features/admin/plans/lib/plan-form-errors";

interface PlanTiersEditorProps {
  control: Control<PlanFormValues>;
  errors: FieldErrors<PlanFormValues>;
  disabled?: boolean;
  customPricing: boolean;
}

export function PlanTiersEditor({
  control,
  errors,
  disabled = false,
  customPricing,
}: PlanTiersEditorProps) {
  const { t } = useTranslation("admin");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tiers",
  });

  if (customPricing) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">
          {t("plans.form.tiers.customPricingHint")}
        </p>
      </div>
    );
  }

  return (
    <FieldSet disabled={disabled}>
      <FieldLegend>{t("plans.form.tiers.title")}</FieldLegend>
      <FieldDescription>{t("plans.form.tiers.description")}</FieldDescription>

      <FieldGroup className="gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-border/70 bg-card/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {t("plans.form.tiers.tierLabel", { index: index + 1 })}
              </p>
              {fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  aria-label={t("plans.form.tiers.removeTier", {
                    index: index + 1,
                  })}
                >
                  <Trash2 aria-hidden="true" />
                  {t("plans.form.tiers.remove")}
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field>
                <FieldLabel htmlFor={`tier-shipments-${index}`}>
                  {t("plans.form.tiers.shipments")}
                </FieldLabel>
                <Input
                  id={`tier-shipments-${index}`}
                  type="number"
                  min={1}
                  step={1}
                  disabled={disabled}
                  aria-invalid={Boolean(
                    getIndexedFieldError(errors, "tiers", index, "shipmentsPerMonth"),
                  )}
                  {...control.register(`tiers.${index}.shipmentsPerMonth`, {
                    valueAsNumber: true,
                  })}
                />
                <PlanIndexedFieldError
                  errors={errors}
                  root="tiers"
                  index={index}
                  field="shipmentsPerMonth"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`tier-monthly-${index}`}>
                  {t("plans.form.tiers.monthlyPrice")}
                </FieldLabel>
                <Input
                  id={`tier-monthly-${index}`}
                  type="number"
                  min={0}
                  step={0.01}
                  disabled={disabled}
                  dir="ltr"
                  className="text-start tabular-nums"
                  aria-invalid={Boolean(
                    getIndexedFieldError(errors, "tiers", index, "monthlyPrice"),
                  )}
                  {...control.register(`tiers.${index}.monthlyPrice`, {
                    valueAsNumber: true,
                  })}
                />
                <PlanIndexedFieldError
                  errors={errors}
                  root="tiers"
                  index={index}
                  field="monthlyPrice"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`tier-yearly-${index}`}>
                  {t("plans.form.tiers.yearlyPrice")}
                </FieldLabel>
                <Input
                  id={`tier-yearly-${index}`}
                  type="number"
                  min={0}
                  step={0.01}
                  disabled={disabled}
                  dir="ltr"
                  className="text-start tabular-nums"
                  aria-invalid={Boolean(
                    getIndexedFieldError(errors, "tiers", index, "yearlyPrice"),
                  )}
                  {...control.register(`tiers.${index}.yearlyPrice`, {
                    valueAsNumber: true,
                  })}
                />
                <PlanIndexedFieldError
                  errors={errors}
                  root="tiers"
                  index={index}
                  field="yearlyPrice"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`tier-sort-${index}`}>
                  {t("plans.form.tiers.sortOrder")}
                </FieldLabel>
                <Input
                  id={`tier-sort-${index}`}
                  type="number"
                  min={0}
                  step={1}
                  disabled={disabled}
                  aria-invalid={Boolean(
                    getIndexedFieldError(errors, "tiers", index, "sortOrder"),
                  )}
                  {...control.register(`tiers.${index}.sortOrder`, {
                    valueAsNumber: true,
                  })}
                />
                <PlanIndexedFieldError
                  errors={errors}
                  root="tiers"
                  index={index}
                  field="sortOrder"
                />
              </Field>
            </div>
          </div>
        ))}
      </FieldGroup>

      <PlanArrayRootError errors={errors} root="tiers" />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() =>
          append({
            shipmentsPerMonth: 100,
            monthlyPrice: 0,
            yearlyPrice: 0,
            sortOrder: fields.length,
          })
        }
      >
        <Plus aria-hidden="true" />
        {t("plans.form.tiers.addTier")}
      </Button>
    </FieldSet>
  );
}
