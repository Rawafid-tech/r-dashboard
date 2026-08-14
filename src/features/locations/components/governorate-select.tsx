import { useTranslation } from "react-i18next";
import {
  FieldDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { useGovernorates } from "@/features/locations/hooks/use-governorates";
import { getGovernorateLabel } from "@/features/locations/lib/location-form-errors";
import { useLocaleStore } from "@/stores/locale.store";

interface GovernorateSelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  label: string;
  placeholder: string;
  hint?: string;
}

export function GovernorateSelectField({
  id,
  value,
  onChange,
  disabled,
  invalid,
  label,
  placeholder,
  hint,
}: GovernorateSelectFieldProps) {
  const { t } = useTranslation("locations");
  const locale = useLocaleStore((state) => state.locale);
  const governoratesQuery = useGovernorates("EG");

  const governorates = governoratesQuery.data ?? [];
  const selectValue = value && value.length > 0 ? value : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {hint ? <FieldDescription className="m-0">{hint}</FieldDescription> : null}
      <Select
        value={selectValue}
        onValueChange={onChange}
        disabled={disabled || governoratesQuery.isLoading}
      >
        <SelectTrigger
          id={id}
          aria-label={label}
          aria-invalid={invalid || undefined}
          className="w-full"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {governorates.map((governorate) => (
            <SelectItem key={governorate.id} value={governorate.id}>
              {getGovernorateLabel(governorate, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {governoratesQuery.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {t("form.governoratesLoadFailed")}
        </p>
      ) : null}
    </div>
  );
}
