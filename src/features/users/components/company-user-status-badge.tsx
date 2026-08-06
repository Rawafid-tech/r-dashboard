import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { UserStatus } from "@/shared/types/enums";
import type { UserStatus as UserStatusType } from "@/shared/types/enums";

const STATUS_VARIANT: Record<
  UserStatusType,
  "warning" | "success" | "destructive"
> = {
  [UserStatus.INVITED]: "warning",
  [UserStatus.ACTIVE]: "success",
  [UserStatus.SUSPENDED]: "destructive",
};

interface CompanyUserStatusBadgeProps {
  status: UserStatusType;
}

export function CompanyUserStatusBadge({ status }: CompanyUserStatusBadgeProps) {
  const { t } = useTranslation("users");

  return (
    <Badge variant={STATUS_VARIANT[status]} className="text-[10px] uppercase">
      {t(`status.${status}`)}
    </Badge>
  );
}
