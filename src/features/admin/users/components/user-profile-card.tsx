import type { ReactNode } from "react";
import { Building2, Calendar, Mail, Phone, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { formatDate } from "@/shared/lib/formatters";
import type { AdminUser } from "@/features/admin/users/types";

interface UserProfileCardProps {
  user: AdminUser;
}

function ProfileRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/10 p-3">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-md bg-background text-muted-foreground ring-1 ring-border/60"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const { t } = useTranslation("admin");

  return (
    <Card className="border-border/80">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span
            className="grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/12 dark:text-emerald-200"
            aria-hidden="true"
          >
            <UserRound className="size-4" />
          </span>
          <div>
            <CardTitle>{t("users.detail.profile.title")}</CardTitle>
            <CardDescription>{t("users.detail.profile.subtitle")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <ProfileRow icon={Mail} label={t("users.detail.profile.email")}>
          <span dir="ltr" className="break-all">
            {user.email}
          </span>
        </ProfileRow>

        <ProfileRow icon={Phone} label={t("users.detail.profile.phone")}>
          <span dir="ltr">{user.phone}</span>
        </ProfileRow>

        <ProfileRow icon={Calendar} label={t("users.detail.profile.dateOfBirth")}>
          {user.dateOfBirth ? (
            <time dir="ltr" dateTime={user.dateOfBirth}>
              {formatDate(user.dateOfBirth)}
            </time>
          ) : (
            <span className="text-muted-foreground">
              {t("users.detail.profile.notProvided")}
            </span>
          )}
        </ProfileRow>

        <ProfileRow icon={Calendar} label={t("users.detail.profile.registeredAt")}>
          <time dir="ltr" className="tabular-nums" dateTime={user.createdAt}>
            {formatDate(user.createdAt)}
          </time>
        </ProfileRow>

        <div className="sm:col-span-2">
          <ProfileRow icon={Building2} label={t("users.detail.profile.company")}>
            <Link
              to={`/admin/companies/${user.companyId}`}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("users.detail.profile.viewCompany")}
            </Link>
          </ProfileRow>
        </div>

        <div className="sm:col-span-2 rounded-lg border border-dashed border-border/70 bg-muted/10 p-4">
          <p className="text-sm font-medium text-foreground">
            {t("users.detail.profile.workspaceHint")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("users.detail.profile.workspaceDescription")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
