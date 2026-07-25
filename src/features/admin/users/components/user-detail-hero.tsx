import { ArrowLeft, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge, Button } from "@/shared/components/ui";
import { UserRoleBadge } from "@/features/admin/users/components/user-badges";
import { UserStatusBadge } from "@/features/admin/users/components/user-status-badge";
import { UserVerifiedBadge } from "@/features/admin/users/components/user-verified-badge";
import type { AdminUser } from "@/features/admin/users/types";

interface UserDetailHeroProps {
  user: AdminUser;
}

export function UserDetailHero({ user }: UserDetailHeroProps) {
  const { t } = useTranslation("admin");

  return (
    <section className="space-y-4" aria-labelledby="user-detail-title">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ms-2 w-fit text-muted-foreground hover:text-foreground"
      >
        <Link to="/admin/users">
          <ArrowLeft aria-hidden="true" />
          {t("users.detail.backToDirectory")}
        </Link>
      </Button>

      <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),color-mix(in_oklab,#059669_8%,transparent))] px-5 py-6 ring-1 ring-foreground/8 sm:px-7 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/12 dark:text-emerald-200"
              aria-hidden="true"
            >
              <UserRound className="size-5" />
            </span>
            <div className="min-w-0 space-y-2">
              <Badge variant="secondary" className="uppercase">
                {t("users.detail.badge")}
              </Badge>
              <h1
                id="user-detail-title"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {user.fullName}
              </h1>
              <p dir="ltr" className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <UserRoleBadge role={user.role} />
                <UserStatusBadge status={user.status} />
                <UserVerifiedBadge verified={user.verified} compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
