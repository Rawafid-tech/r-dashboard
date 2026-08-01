import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui";
import { UserRoleBadge } from "@/features/admin/users/components/user-badges";
import { UserStatusBadge } from "@/features/admin/users/components/user-status-badge";
import { UserVerifiedBadge } from "@/features/admin/users/components/user-verified-badge";
import type { AdminUser } from "@/features/admin/users/types";
import { PageHeader } from "@/shared/components/layout/page-header";

interface UserDetailHeroProps {
  user: AdminUser;
}

export function UserDetailHero({ user }: UserDetailHeroProps) {
  const { t } = useTranslation("admin");

  return (
    <div className="space-y-4">
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

      <PageHeader
        title={user.fullName}
        description={
          <span dir="ltr" className="block truncate">
            {user.email}
          </span>
        }
        footer={
          <div className="flex flex-wrap items-center gap-2">
            <UserRoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
            <UserVerifiedBadge verified={user.verified} compact />
          </div>
        }
      />
    </div>
  );
}
