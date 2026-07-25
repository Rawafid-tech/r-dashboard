import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";

interface UserVerifiedBadgeProps {
  verified: boolean;
  compact?: boolean;
}

export function UserVerifiedBadge({
  verified,
  compact = false,
}: UserVerifiedBadgeProps) {
  const { t } = useTranslation("admin");

  if (verified) {
    return (
      <Badge variant="success" className="gap-1 text-[10px] uppercase">
        <ShieldCheck className="size-3" aria-hidden="true" />
        {compact ? t("users.verified.short") : t("users.verified.label")}
      </Badge>
    );
  }

  return (
    <Badge variant="muted" className="text-[10px] uppercase">
      {compact ? t("users.verified.notShort") : t("users.verified.notLabel")}
    </Badge>
  );
}
