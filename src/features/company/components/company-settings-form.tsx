import { useEffect, useId, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Button,
  Field,
  FieldDescription,
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
} from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { CompanySize, MonthlyShipmentVolume } from "@/shared/types/enums";
import { SHIP_FROM_COUNTRIES } from "@/shared/lib/countries";
import type { Company } from "@/features/company/types";
import {
  applyCompanyFieldErrors,
  useUpdateCompany,
} from "@/features/company/hooks/use-update-company";
import {
  COMPANY_SIZE_NONE,
  createCompanySchema,
  toUpdateCompanyPayload,
  type CompanyFormValues,
} from "@/features/company/schema";
import { LogoUploader } from "@/features/media";

const VOLUME_OPTIONS = Object.values(MonthlyShipmentVolume);

interface CompanySettingsFormProps {
  company?: Company;
  canEdit: boolean;
}

export function CompanySettingsForm({
  company,
  canEdit,
}: CompanySettingsFormProps) {
  const { t, i18n } = useTranslation("settings");
  const formId = useId();
  const updateMutation = useUpdateCompany();

  const schema = useMemo(
    () => createCompanySchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useAppForm({
    schema,
    defaultValues: {
      name: "",
      size: COMPANY_SIZE_NONE,
      industry: "",
      website: "",
      shipFromCountry: "EG",
      monthlyShipmentVolume: MonthlyShipmentVolume.VOL_0_50,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!company) return;

    reset({
      name: company.name,
      size: company.size ?? COMPANY_SIZE_NONE,
      industry: company.industry ?? "",
      website: company.website ?? "",
      shipFromCountry:
        company.shipFromCountry as CompanyFormValues["shipFromCountry"],
      monthlyShipmentVolume: company.monthlyShipmentVolume,
    });
  }, [company, reset]);

  const busy = isSubmitting || updateMutation.isPending;
  const disabled = busy || !company || !canEdit;

  const onSubmit = handleSubmit(async (values: CompanyFormValues) => {
    try {
      await updateMutation.mutateAsync(toUpdateCompanyPayload(values));
    } catch (error) {
      applyCompanyFieldErrors(error, setError);
    }
  });

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="space-y-5">
      {!canEdit ? (
        <FieldDescription className="rounded-lg bg-muted/50 px-3 py-2 ring-1 ring-border/60">
          {t("sections.company.readOnlyHint")}
        </FieldDescription>
      ) : null}

      {/* Company Logo Section — OWNER only, shown once company data is loaded */}
      {canEdit && company && (
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium">{t("fields.companyLogo")}</h4>
            <p className="text-xs text-muted-foreground">
              {t("fields.companyLogoHint")}
            </p>
          </div>
          <LogoUploader currentLogoUrl={company.logoUrl} size="lg" />
        </div>
      )}

      {company ? (
        <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm ring-1 ring-border/60">
          <span className="text-muted-foreground">
            {t("sections.company.accountLabel")}:{" "}
          </span>
          <span className="font-medium">
            {company.name}-{company.identifier}
          </span>
        </div>
      ) : null}

      <FieldGroup>
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.name || undefined}>
            <FieldLabel htmlFor={`${formId}-name`}>
              {t("fields.companyName")}
            </FieldLabel>
            <Input
              id={`${formId}-name`}
              autoComplete="organization"
              aria-invalid={!!errors.name}
              disabled={disabled}
              {...register("name")}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.size || undefined}>
              <FieldLabel htmlFor={`${formId}-size`}>
                {t("fields.companySize")}
                <span className="ms-1 font-normal text-muted-foreground">
                  ({t("fields.optional")})
                </span>
              </FieldLabel>
              <Controller
                control={control}
                name="size"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger id={`${formId}-size`} className="h-9 w-full">
                      <SelectValue placeholder={t("fields.notSet")} />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      <SelectItem value={COMPANY_SIZE_NONE}>
                        {t("fields.notSet")}
                      </SelectItem>
                      {Object.values(CompanySize).map((size) => (
                        <SelectItem key={size} value={size}>
                          {t(`companySize.${size}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.size?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.industry || undefined}>
              <FieldLabel htmlFor={`${formId}-industry`}>
                {t("fields.industry")}
                <span className="ms-1 font-normal text-muted-foreground">
                  ({t("fields.optional")})
                </span>
              </FieldLabel>
              <Input
                id={`${formId}-industry`}
                disabled={disabled}
                {...register("industry")}
              />
              <FieldError>{errors.industry?.message}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!errors.website || undefined}>
            <FieldLabel htmlFor={`${formId}-website`}>
              {t("fields.website")}
              <span className="ms-1 font-normal text-muted-foreground">
                ({t("fields.optional")})
              </span>
            </FieldLabel>
            <Input
              id={`${formId}-website`}
              type="url"
              inputMode="url"
              dir="ltr"
              className="text-start"
              placeholder="https://"
              disabled={disabled}
              {...register("website")}
            />
            <FieldError>{errors.website?.message}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.shipFromCountry || undefined}>
              <FieldLabel htmlFor={`${formId}-country`}>
                {t("fields.shipFromCountry")}
              </FieldLabel>
              <Controller
                control={control}
                name="shipFromCountry"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger id={`${formId}-country`} className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {SHIP_FROM_COUNTRIES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {t(`countries.${code}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.shipFromCountry?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.monthlyShipmentVolume || undefined}>
              <FieldLabel htmlFor={`${formId}-volume`}>
                {t("fields.monthlyShipmentVolume")}
              </FieldLabel>
              <Controller
                control={control}
                name="monthlyShipmentVolume"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger id={`${formId}-volume`} className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {VOLUME_OPTIONS.map((volume) => (
                        <SelectItem key={volume} value={volume}>
                          {t(`monthlyShipmentVolume.${volume}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.monthlyShipmentVolume?.message}</FieldError>
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>

      {canEdit ? (
        <div className="flex justify-end border-t border-border/60 pt-4">
          <Button type="submit" disabled={disabled || !isDirty}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" />
                {t("actions.saving")}
              </>
            ) : (
              t("actions.save")
            )}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
