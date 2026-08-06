import { useTranslation } from "react-i18next";
import {
  FieldDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { useRoles } from "@/features/roles/hooks/use-roles";
import { useMerchantPermissions } from "@/shared/hooks/use-merchant-permissions";

interface RoleSelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  enabled?: boolean;
  placeholder: string;
  hint?: string;
  label: string;
}

export function RoleSelectField({
  id,
  value,
  onChange,
  disabled,
  enabled = true,
  placeholder,
  hint,
  label,
}: RoleSelectFieldProps) {
  const { t } = useTranslation("common");
  const { canReadRoles } = useMerchantPermissions();

  const rolesQuery = useRoles(
    { page: 0, size: 100, sort: "NAME", direction: "ASC" },
    { enabled: enabled && canReadRoles },
  );

  const roles = rolesQuery.data?.content ?? [];
  const selectValue = value && value.length > 0 ? value : "__agent__";

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {hint ? <FieldDescription className="m-0">{hint}</FieldDescription> : null}
      <Select
        value={selectValue}
        onValueChange={(next) => {
          onChange(next === "__agent__" ? "" : next);
        }}
        disabled={disabled || rolesQuery.isLoading || !canReadRoles}
      >
        <SelectTrigger id={id} aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__agent__">{placeholder}</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {rolesQuery.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {t("errors.serverError")}
        </p>
      ) : null}
    </div>
  );
}
