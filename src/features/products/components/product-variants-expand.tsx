import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/features/products/lib/format-product";
import type { ProductVariant } from "@/features/products/types";
import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface ProductVariantsExpandProps {
  productName: string;
  variants: ProductVariant[];
  className?: string;
}

export function ProductVariantsExpand({
  productName,
  variants,
  className,
}: ProductVariantsExpandProps) {
  const { t } = useTranslation("products");

  if (variants.length === 0) {
    return null;
  }

  const sortedVariants = [...variants].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );

  return (
    <Collapsible className={cn("group mt-1", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {t("table.variantsCount", { count: variants.length })}
        </Badge>
        <CollapsibleTrigger
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ChevronDown
            className="size-3.5 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
          <span className="group-data-[state=open]:hidden">
            {t("table.variantsExpand", { name: productName })}
          </span>
          <span className="hidden group-data-[state=open]:inline">
            {t("table.variantsCollapse", { name: productName })}
          </span>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <ul
          className="mt-2 space-y-1 rounded-lg border border-border/60 bg-muted/20 p-2 text-sm"
          aria-label={t("table.variantsListLabel")}
        >
          {sortedVariants.map((variant) => (
            <li
              key={variant.id}
              className="flex items-start justify-between gap-3"
            >
              <span dir="auto" className="min-w-0 text-foreground">
                {variant.name}
              </span>
              <span dir="ltr" className="shrink-0 tabular-nums text-muted-foreground">
                {variant.price != null
                  ? formatPrice(variant.price)
                  : t("table.variantPriceSameAsProduct")}
              </span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
