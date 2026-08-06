import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getUserInitials } from "@/features/admin/users/lib/user-label";
import type { CompanyUser } from "@/features/users/types";

interface CompanyUserIdentityCellProps {
  user: CompanyUser;
}

export function CompanyUserIdentityCell({ user }: CompanyUserIdentityCellProps) {
  const { t } = useTranslation("users");

  return (
    <div className="flex min-w-0 items-center gap-3">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt=""
          className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border/60"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/15"
          aria-hidden="true"
        >
          {getUserInitials(user.fullName)}
        </span>
      )}
      <div className="min-w-0">
        <p dir="auto" className="truncate font-medium text-foreground">
          {user.fullName}
          {user.owner ? (
            <span className="ms-1.5 text-xs font-normal text-muted-foreground">
              ({t("table.ownerBadge")})
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

interface EmailWithVerifiedProps {
  email: string;
  verified: boolean;
}

export function EmailWithVerifiedCell({
  email,
  verified,
}: EmailWithVerifiedProps) {
  const { t } = useTranslation("users");

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        dir="ltr"
        className="block max-w-[220px] truncate text-sm text-muted-foreground sm:max-w-xs"
        title={email}
      >
        {email}
      </span>
      {verified ? (
        <span
          className="inline-flex shrink-0 text-success"
          title={t("table.emailVerified")}
        >
          <Check className="size-3.5" aria-hidden="true" />
          <span className="sr-only">{t("table.emailVerified")}</span>
        </span>
      ) : null}
    </div>
  );
}
