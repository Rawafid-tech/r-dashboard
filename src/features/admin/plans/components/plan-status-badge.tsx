import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { PlanStatus } from "@/shared/types/enums";
import { cn } from "@/shared/lib/utils";

interface PlanStatusBadgeProps {
  status: (typeof PlanStatus)[keyof typeof PlanStatus];
  className?: string;
}

export function PlanStatusBadge({ status, className }: PlanStatusBadgeProps) {
  const { t } = useTranslation("admin");

  const variant =
    status === PlanStatus.ACTIVE ? "success" : "muted";

  return (
    <Badge variant={variant} className={cn(className)}>
      {t(`plans.status.${status}`)}
    </Badge>
  );
}
