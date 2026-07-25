import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface PlanCodeBadgeProps {
  planCode: string;
  className?: string;
}

function getPlanVariant(planCode: string): "success" | "default" | "secondary" | "outline" {
  if (planCode === "FREE") return "secondary";
  if (planCode === "LAUNCH") return "default";
  return "outline";
}

export function PlanCodeBadge({ planCode, className }: PlanCodeBadgeProps) {
  const { t } = useTranslation("admin");

  return (
    <Badge
      variant={getPlanVariant(planCode)}
      className={cn("font-mono uppercase tracking-wide", className)}
    >
      {t(`companies.planCodes.${planCode}`, { defaultValue: planCode })}
    </Badge>
  );
}
