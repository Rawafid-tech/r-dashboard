import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { flattenCategoryTree } from "@/features/products/lib/category-tree-utils";
import type { ProductCategory } from "@/features/products/types";

interface ProductCategorySelectProps {
  id: string;
  categories: ProductCategory[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

export function ProductCategorySelect({
  id,
  categories,
  value,
  onChange,
  disabled,
  invalid,
}: ProductCategorySelectProps) {
  const { t } = useTranslation("products");

  const options = useMemo(
    () => flattenCategoryTree(categories),
    [categories],
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t("form.category")}</Label>
      <Select
        value={value || "__none__"}
        onValueChange={(next) => onChange(next === "__none__" ? "" : next)}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={invalid || undefined}
          aria-label={t("form.category")}
        >
          <SelectValue placeholder={t("form.categoryPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">{t("form.categoryPlaceholder")}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.depth === 1 && option.parentName
                ? `${option.parentName} › ${option.name}`
                : option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{t("form.categoryHint")}</p>
    </div>
  );
}
