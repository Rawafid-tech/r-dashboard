import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
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
import type { PlanFormValues } from "@/features/admin/plans/schema";
import {
  getIndexedFieldError,
  PlanIndexedFieldError,
} from "@/features/admin/plans/lib/plan-form-errors";
import { PlanFeatureType } from "@/shared/types/enums";

interface PlanFeaturesEditorProps {
  control: Control<PlanFormValues>;
  errors: FieldErrors<PlanFormValues>;
  disabled?: boolean;
}

const FEATURE_TYPES = Object.values(PlanFeatureType);

export function PlanFeaturesEditor({
  control,
  errors,
  disabled = false,
}: PlanFeaturesEditorProps) {
  const { t } = useTranslation("admin");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });
  const watchedFeatures = useWatch({ control, name: "features" });

  return (
    <FieldSet disabled={disabled}>
      <FieldLegend>{t("plans.form.features.title")}</FieldLegend>
      <FieldDescription>{t("plans.form.features.description")}</FieldDescription>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("plans.form.features.empty")}
        </p>
      ) : null}

      <FieldGroup className="gap-4">
        {fields.map((field, index) => {
          const featureType = watchedFeatures?.[index]?.type;

          return (
            <div
              key={field.id}
              className="rounded-xl border border-border/70 bg-card/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {t("plans.form.features.featureLabel", { index: index + 1 })}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  aria-label={t("plans.form.features.removeFeature", {
                    index: index + 1,
                  })}
                >
                  <Trash2 aria-hidden="true" />
                  {t("plans.form.features.remove")}
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`feature-label-en-${index}`}>
                    {t("plans.form.features.labelEn")}
                  </FieldLabel>
                  <Input
                    id={`feature-label-en-${index}`}
                    disabled={disabled}
                    aria-invalid={Boolean(
                      getIndexedFieldError(errors, "features", index, "labelEn"),
                    )}
                    {...control.register(`features.${index}.labelEn`)}
                  />
                  <PlanIndexedFieldError
                    errors={errors}
                    root="features"
                    index={index}
                    field="labelEn"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`feature-label-ar-${index}`}>
                    {t("plans.form.features.labelAr")}
                  </FieldLabel>
                  <Input
                    id={`feature-label-ar-${index}`}
                    disabled={disabled}
                    aria-invalid={Boolean(
                      getIndexedFieldError(errors, "features", index, "labelAr"),
                    )}
                    {...control.register(`features.${index}.labelAr`)}
                  />
                  <PlanIndexedFieldError
                    errors={errors}
                    root="features"
                    index={index}
                    field="labelAr"
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={`feature-type-${index}`}>
                    {t("plans.form.features.type")}
                  </FieldLabel>
                  <Controller
                    control={control}
                    name={`features.${index}.type`}
                    render={({ field: typeField }) => (
                      <Select
                        value={typeField.value}
                        onValueChange={typeField.onChange}
                        disabled={disabled}
                      >
                        <SelectTrigger
                          id={`feature-type-${index}`}
                          aria-invalid={Boolean(
                            getIndexedFieldError(errors, "features", index, "type"),
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FEATURE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`plans.form.features.types.${type}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <PlanIndexedFieldError
                    errors={errors}
                    root="features"
                    index={index}
                    field="type"
                  />
                </Field>

                {featureType === PlanFeatureType.NUMBER ? (
                  <Field>
                    <FieldLabel htmlFor={`feature-number-${index}`}>
                      {t("plans.form.features.numberValue")}
                    </FieldLabel>
                    <Input
                      id={`feature-number-${index}`}
                      type="number"
                      min={0}
                      step={1}
                      disabled={disabled}
                      dir="ltr"
                      className="text-start tabular-nums"
                      aria-invalid={Boolean(
                        getIndexedFieldError(errors, "features", index, "number"),
                      )}
                      {...control.register(`features.${index}.number`, {
                        valueAsNumber: true,
                      })}
                    />
                    <PlanIndexedFieldError
                      errors={errors}
                      root="features"
                      index={index}
                      field="number"
                    />
                  </Field>
                ) : null}

                {featureType === PlanFeatureType.BOOLEAN ? (
                  <Field orientation="horizontal">
                    <Controller
                      control={control}
                      name={`features.${index}.enabled`}
                      render={({ field: enabledField }) => (
                        <Checkbox
                          id={`feature-enabled-${index}`}
                          checked={enabledField.value ?? false}
                          onCheckedChange={(checked) =>
                            enabledField.onChange(checked === true)
                          }
                          disabled={disabled}
                          aria-invalid={Boolean(
                            getIndexedFieldError(errors, "features", index, "enabled"),
                          )}
                        />
                      )}
                    />
                    <FieldLabel htmlFor={`feature-enabled-${index}`}>
                      {t("plans.form.features.enabledValue")}
                    </FieldLabel>
                    <PlanIndexedFieldError
                      errors={errors}
                      root="features"
                      index={index}
                      field="enabled"
                    />
                  </Field>
                ) : null}

                {featureType === PlanFeatureType.TEXT ? (
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor={`feature-text-${index}`}>
                      {t("plans.form.features.textValue")}
                    </FieldLabel>
                    <Textarea
                      id={`feature-text-${index}`}
                      rows={2}
                      disabled={disabled}
                      aria-invalid={Boolean(
                        getIndexedFieldError(errors, "features", index, "text"),
                      )}
                      {...control.register(`features.${index}.text`)}
                    />
                    <PlanIndexedFieldError
                      errors={errors}
                      root="features"
                      index={index}
                      field="text"
                    />
                  </Field>
                ) : null}

                {featureType === PlanFeatureType.UNLIMITED ? (
                  <p className="sm:col-span-2 text-sm text-muted-foreground">
                    {t("plans.form.features.unlimitedHint")}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </FieldGroup>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() =>
          append({
            labelEn: "",
            labelAr: "",
            type: PlanFeatureType.BOOLEAN,
            number: null,
            enabled: true,
            text: null,
          })
        }
      >
        <Plus aria-hidden="true" />
        {t("plans.form.features.addFeature")}
      </Button>
    </FieldSet>
  );
}
