import { Loader2, ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { getUserInitials } from "@/features/admin/users/lib/user-label";
import type { AdminUser } from "@/features/admin/users/types";
import { UserStatus } from "@/shared/types/enums";

interface CompanyTeamSectionProps {
  users?: AdminUser[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function TeamMemberCard({ user }: { user: AdminUser }) {
  const { t } = useTranslation("admin");

  return (
    <li>
      <Link
        to={`/admin/users/${user.id}`}
        className="block rounded-xl border border-border/70 bg-card/40 p-4 transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start gap-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p dir="auto" className="truncate font-medium text-foreground">
                {user.fullName}
              </p>
              <Badge variant="outline" className="text-[10px] uppercase">
                {t(`companies.detail.team.roles.${user.role}`)}
              </Badge>
              <Badge
                variant={
                  user.status === UserStatus.ACTIVE ? "success" : "destructive"
                }
                className="text-[10px] uppercase"
              >
                {t(`companies.detail.team.status.${user.status}`)}
              </Badge>
            </div>

            <p className="truncate text-sm text-muted-foreground" dir="ltr">
              {user.email}
            </p>
            <p className="truncate text-sm text-muted-foreground" dir="ltr">
              {user.phone}
            </p>

            <div className="flex flex-wrap gap-2">
              {user.verified ? (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {t("companies.detail.team.verified")}
                </Badge>
              ) : (
                <Badge variant="muted">
                  {t("companies.detail.team.notVerified")}
                </Badge>
              )}
            </div>

            <span className="text-xs font-medium text-primary">
              {t("users.table.viewUser")}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function CompanyTeamSection({
  users,
  isLoading,
  isError,
  onRetry,
}: CompanyTeamSectionProps) {
  const { t } = useTranslation("admin");

  return (
    <Card className="border-border/80">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span
            className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
            aria-hidden="true"
          >
            <UserRound className="size-4" />
          </span>
          <div>
            <CardTitle>{t("companies.detail.team.title")}</CardTitle>
            <CardDescription>{t("companies.detail.team.subtitle")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("companies.detail.team.loading")}
          </div>
        ) : null}

        {isError ? (
          <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              {t("companies.detail.team.error")}
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-primary hover:underline"
              onClick={onRetry}
            >
              {t("companies.errors.retry")}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && users?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("companies.detail.team.empty")}
          </p>
        ) : null}

        {!isLoading && !isError && users && users.length > 0 ? (
          <ul className="grid gap-3">
            {users.map((user) => (
              <TeamMemberCard key={user.id} user={user} />
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
