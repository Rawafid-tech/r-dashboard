import { useTranslation } from "react-i18next";
import type { ImportMode } from "@/features/products/types";
import { FieldLegend, FieldSet } from "@/shared/components/ui";

interface ImportModeSelectorProps {
  value: ImportMode;
  onChange: (mode: ImportMode) => void;
  disabled?: boolean;
}

export function ImportModeSelector({
  value,
  onChange,
  disabled = false,
}: ImportModeSelectorProps) {
  const { t } = useTranslation("products");

  return (
    <FieldSet
      role="radiogroup"
      aria-label={t("import.upload.modeLegend")}
      className="rounded-xl border border-border bg-card p-4"
    >
      <FieldLegend variant="label">{t("import.upload.modeLegend")}</FieldLegend>
      <p className="text-sm text-muted-foreground">
        {t("import.upload.modeDescription")}
      </p>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="import-mode"
            value="INSERT_ONLY"
            checked={value === "INSERT_ONLY"}
            onChange={() => onChange("INSERT_ONLY")}
            disabled={disabled}
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span className="space-y-0.5">
            <span className="block text-sm font-medium text-foreground">
              {t("import.upload.modeInsert")}
            </span>
            <span className="block text-sm text-muted-foreground">
              {t("import.upload.modeInsertHint")}
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="import-mode"
            value="UPSERT"
            checked={value === "UPSERT"}
            onChange={() => onChange("UPSERT")}
            disabled={disabled}
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span className="space-y-0.5">
            <span className="block text-sm font-medium text-foreground">
              {t("import.upload.modeUpsert")}
            </span>
            <span className="block text-sm text-muted-foreground">
              {t("import.upload.modeUpsertHint")}
            </span>
          </span>
        </label>
      </div>
    </FieldSet>
  );
}
