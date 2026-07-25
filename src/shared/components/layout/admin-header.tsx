import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { AuthLocaleThemeControls } from "@/features/auth/components/auth-locale-theme-controls";
import { useAdminLogout } from "@/features/admin/auth/hooks/use-admin-logout";
import type { AdminRole } from "@/shared/types/enums";
import { cn } from "@/shared/lib/utils";

interface AdminHeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: AdminRole;
  className?: string;
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();

  const second = parts[1] ?? "";
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}

export function AdminHeader({
  userName,
  userEmail,
  userRole,
  className,
}: AdminHeaderProps) {
  const { t } = useTranslation(["admin", "common"]);
  const logoutMutation = useAdminLogout();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/15 dark:text-violet-300"
          aria-hidden="true"
        >
          <ShieldCheck className="size-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{t("common:app.name")}</p>
          <Badge variant="secondary" className="mt-0.5 text-[10px] uppercase">
            {t("shell.badge")}
          </Badge>
        </div>
      </div>

      <div className="min-w-0 flex-1" aria-hidden="true" />

      <AuthLocaleThemeControls />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="max-w-[min(100%,14rem)] ps-2"
            aria-label={t("shell.userMenuLabel", {
              name: userName ?? t("common:common.loading"),
            })}
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-violet-500/10 text-violet-700 dark:text-violet-200">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {userName ?? t("common:common.loading")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="truncate font-medium">{userName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {userEmail}
              </span>
              {userRole ? (
                <Badge variant="outline" className="mt-1 w-fit text-[10px]">
                  {t(`roles.${userRole}`)}
                </Badge>
              ) : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={logoutMutation.isPending}
            onSelect={(event) => {
              event.preventDefault();
              logoutMutation.mutate();
            }}
          >
            {logoutMutation.isPending
              ? t("shell.loggingOut")
              : t("common:auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
