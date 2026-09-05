import { useId } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  excelColumnName,
  ImportSheetScroller,
} from "@/features/products/components/import-sheet-scroller";
import {
  assignVariantColumnMapping,
  type VariantColumnMapping,
} from "@/features/products/lib/import-variant-map-columns";
import type {
  ImportTemplateColumn,
  ImportVariantFieldKey,
} from "@/features/products/types";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

const IGNORE_VALUE = "__ignore__";

interface ImportVariantColumnMapperProps {
  headers: string[];
  columns: ImportTemplateColumn[];
  mapping: VariantColumnMapping;
  onMappingChange: (mapping: VariantColumnMapping) => void;
  disabled?: boolean;
}

export function ImportVariantColumnMapper({
  headers,
  columns,
  mapping,
  onMappingChange,
  disabled = false,
}: ImportVariantColumnMapperProps) {
  const { t } = useTranslation("products");
  const formId = useId();

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          {t("import.variants.mappingTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("import.variants.mappingDescription")}
        </p>
      </div>

      <ImportSheetScroller label={t("import.variants.mappingTitle")}>
        <table className="min-w-max border-collapse text-sm">
          <caption className="sr-only">{t("import.variants.mappingTitle")}</caption>
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              {headers.map((header, index) => {
                const mapped = mapping[index] != null;
                const title =
                  header.trim() || t("import.upload.untitledColumn");

                return (
                  <th
                    key={`${header}-${index}`}
                    scope="col"
                    className={cn(
                      "min-w-[13.5rem] max-w-[16rem] border-s border-border/50 px-3 py-2.5 text-start first:border-s-0",
                      mapped ? "bg-primary/[0.04]" : undefined,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <span
                          className="block text-[11px] font-medium text-muted-foreground"
                          dir="ltr"
                        >
                          {excelColumnName(index)} · {t("import.upload.yourColumn")}
                        </span>
                        <span className="block truncate font-semibold text-foreground">
                          {title}
                        </span>
                      </div>
                      {mapped ? (
                        <span
                          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                          aria-hidden="true"
                        >
                          <Check className="size-3" />
                        </span>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {headers.map((header, index) => {
                const selectId = `${formId}-variant-col-${index}`;
                const value = mapping[index] ?? IGNORE_VALUE;
                const mapped = mapping[index] != null;
                const title =
                  header.trim() || t("import.upload.untitledColumn");

                return (
                  <td
                    key={`${header}-${index}-map`}
                    className={cn(
                      "border-s border-border/50 px-3 py-3 align-top first:border-s-0",
                      mapped ? "bg-primary/[0.03]" : undefined,
                    )}
                  >
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={selectId}
                        className="text-[11px] text-muted-foreground"
                      >
                        {t("import.upload.mapsTo")}
                      </Label>
                      <Select
                        value={value}
                        onValueChange={(next) => {
                          const key =
                            next === IGNORE_VALUE
                              ? null
                              : (next as ImportVariantFieldKey);
                          onMappingChange(
                            assignVariantColumnMapping(mapping, index, key),
                          );
                        }}
                        disabled={disabled}
                      >
                        <SelectTrigger
                          id={selectId}
                          className="w-full"
                          aria-label={t("import.upload.mapsToFor", {
                            column: title,
                          })}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={IGNORE_VALUE}>
                            {t("import.upload.ignore")}
                          </SelectItem>
                          {columns.map((column) => (
                            <SelectItem key={column.key} value={column.key}>
                              {column.label}
                              {column.required
                                ? ` (${t("import.template.required")})`
                                : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </ImportSheetScroller>
    </div>
  );
}
