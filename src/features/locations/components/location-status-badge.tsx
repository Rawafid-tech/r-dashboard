import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { SenderLocationStatus } from "@/shared/types/enums";
import type { SenderLocationStatus as SenderLocationStatusType } from "@/shared/types/enums";

const STATUS_VARIANT: Record<
  SenderLocationStatusType,
  "success" | "destructive"
> = {
  [SenderLocationStatus.ACTIVE]: "success",
  [SenderLocationStatus.INACTIVE]: "destructive",
};

interface LocationStatusBadgeProps {
  status: SenderLocationStatusType;
}

export function LocationStatusBadge({ status }: LocationStatusBadgeProps) {
  const { t } = useTranslation("locations");

  return (
    <Badge variant={STATUS_VARIANT[status]} className="text-[10px] uppercase">
      {t(`status.${status}`)}
    </Badge>
  );
}
