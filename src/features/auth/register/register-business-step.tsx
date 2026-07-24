import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
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
} from "@/shared/components/ui";
import { MonthlyShipmentVolume } from "@/shared/types/enums";
import {
  REGISTER_COUNTRIES,
  type RegisterFormValues,
} from "@/features/auth/register/schema";

const VOLUME_OPTIONS = Object.values(MonthlyShipmentVolume);

interface RegisterBusinessStepProps {
  formId: string;
  busy: boolean;
  register: UseFormRegister<RegisterFormValues>;
  control: Control<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
}

export function RegisterBusinessStep({
  formId,
  busy,
  register,
  control,
  errors,
}: RegisterBusinessStepProps) {
  const { t } = useTranslation("auth");

  return (
    <FieldGroup className="gap-3">
      <FieldSet className="gap-2.5">
        <Field data-invalid={!!errors.companyName || undefined}>
          <FieldLabel htmlFor={`${formId}-companyName`}>
            {t("register.fields.companyName")}
            <span className="ms-1 font-normal text-muted-foreground">
              ({t("register.fields.optional")})
            </span>
          </FieldLabel>
          <Input
            id={`${formId}-companyName`}
            autoComplete="organization"
            placeholder={t("register.fields.companyNamePlaceholder")}
            title={t("register.fields.companyNameHint")}
            aria-invalid={!!errors.companyName}
            aria-describedby={
              errors.companyName ? `${formId}-companyName-error` : undefined
            }
            disabled={busy}
            {...register("companyName")}
          />
          <FieldError id={`${formId}-companyName-error`}>
            {errors.companyName?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!errors.shipFromCountry || undefined}>
          <FieldLabel htmlFor={`${formId}-shipFromCountry`}>
            {t("register.fields.shipFromCountry")}
          </FieldLabel>
          <Controller
            control={control}
            name="shipFromCountry"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={busy}
              >
                <SelectTrigger
                  id={`${formId}-shipFromCountry`}
                  className="h-9 w-full"
                  aria-invalid={!!errors.shipFromCountry}
                  aria-describedby={
                    errors.shipFromCountry
                      ? `${formId}-shipFromCountry-error`
                      : undefined
                  }
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {REGISTER_COUNTRIES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {t(`register.countries.${code}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id={`${formId}-shipFromCountry-error`}>
            {errors.shipFromCountry?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!errors.monthlyShipmentVolume || undefined}>
          <FieldLabel htmlFor={`${formId}-volume`}>
            {t("register.fields.monthlyShipmentVolume")}
          </FieldLabel>
          <Controller
            control={control}
            name="monthlyShipmentVolume"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={busy}
              >
                <SelectTrigger
                  id={`${formId}-volume`}
                  className="h-9 w-full"
                  aria-invalid={!!errors.monthlyShipmentVolume}
                  aria-describedby={
                    errors.monthlyShipmentVolume
                      ? `${formId}-volume-error`
                      : undefined
                  }
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {VOLUME_OPTIONS.map((volume) => (
                    <SelectItem key={volume} value={volume}>
                      {t(`register.volume.${volume}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id={`${formId}-volume-error`}>
            {errors.monthlyShipmentVolume?.message}
          </FieldError>
        </Field>
      </FieldSet>
    </FieldGroup>
  );
}
