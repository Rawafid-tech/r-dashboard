import type { ProductHandling } from "@/features/products/types";
import { Badge } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";

const HANDLING_VARIANTS: Record<
  ProductHandling,
  "muted" | "warning" | "outline" | "destructive" | "success"
> = {
  GENERAL: "muted",
  FRAGILE: "warning",
  LIQUID: "outline",
  BATTERY: "success",
  FLAMMABLE: "destructive",
};

interface HandlingBadgeProps {
  handling: ProductHandling;
}

export function HandlingBadge({ handling }: HandlingBadgeProps) {
  const { t } = useTranslation("products");

  return (
    <Badge variant={HANDLING_VARIANTS[handling]}>
      {t(`handling.${handling}`)}
    </Badge>
  );
}
