import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { UserStatus } from "@/shared/types/enums";
import type { UserStatus as UserStatusType } from "@/shared/types/enums";

const STATUS_VARIANT: Record<
  UserStatusType,
  "success" | "destructive" | "warning"
> = {
  [UserStatus.INVITED]: "warning",
  [UserStatus.ACTIVE]: "success",
  [UserStatus.SUSPENDED]: "destructive",
};

interface UserStatusBadgeProps {
  status: UserStatusType;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const { t } = useTranslation("admin");

  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className="text-[10px] uppercase"
    >
      {t(`users.status.${status}`)}
    </Badge>
  );
}
