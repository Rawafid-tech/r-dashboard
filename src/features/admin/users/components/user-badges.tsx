import { useTranslation } from "react-i18next";
import { getUserInitials } from "@/features/admin/users/lib/user-label";
import { UserStatusBadge } from "@/features/admin/users/components/user-status-badge";
import { UserVerifiedBadge } from "@/features/admin/users/components/user-verified-badge";
import type { AdminUser } from "@/features/admin/users/types";

interface UserRoleBadgeProps {
  role: AdminUser["role"];
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const { t } = useTranslation("admin");

  return (
    <span className="inline-flex items-center rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {t(`users.roles.${role}`)}
    </span>
  );
}

interface UserIdentityCellProps {
  user: AdminUser;
}

export function UserIdentityCell({ user }: UserIdentityCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-500/12 dark:text-emerald-200"
        aria-hidden="true"
      >
        {getUserInitials(user.fullName)}
      </span>
      <p dir="auto" className="min-w-0 truncate font-medium text-foreground">
        {user.fullName}
      </p>
    </div>
  );
}

interface UserStatusStackProps {
  user: AdminUser;
}

export function UserStatusStack({ user }: UserStatusStackProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <UserRoleBadge role={user.role} />
      <UserStatusBadge status={user.status} />
      <UserVerifiedBadge verified={user.verified} compact />
    </div>
  );
}
