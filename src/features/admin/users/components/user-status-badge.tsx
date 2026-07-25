import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { UserStatus } from "@/shared/types/enums";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const { t } = useTranslation("admin");

  return (
    <Badge
      variant={status === UserStatus.ACTIVE ? "success" : "destructive"}
      className="text-[10px] uppercase"
    >
      {t(`users.status.${status}`)}
    </Badge>
  );
}
