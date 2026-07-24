import { useTranslation } from "react-i18next";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { formatPhone } from "@/shared/lib/formatters";
import type { User } from "@/features/auth/types";

interface AccountOverviewCardProps {
  user?: User;
}

export function AccountOverviewCard({ user }: AccountOverviewCardProps) {
  const { t } = useTranslation("dashboard");

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <CardTitle>{t("cards.account.title")}</CardTitle>
        {user ? (
          <Badge variant={user.verified ? "success" : "muted"}>
            {user.verified
              ? t("cards.account.verified")
              : t("cards.account.unverified")}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.account.fullName")}
          </p>
          <p className="font-medium">{user?.fullName ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.account.email")}
          </p>
          <p className="font-medium break-all">{user?.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.account.phone")}
          </p>
          <p className="font-medium" dir="ltr">
            {user?.phone ? formatPhone(user.phone) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("cards.account.role")}
          </p>
          <p className="font-medium">
            {user ? t(`roles.${user.role}`) : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
