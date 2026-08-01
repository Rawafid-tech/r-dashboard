import { Menu } from "lucide-react";
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
import { SidebarExpandButton } from "@/shared/components/layout/sidebar-toggle-button";
import { AdminAppBreadcrumbs } from "@/shared/components/layout/app-breadcrumbs";
import { AdminConsoleMark } from "@/shared/components/layout/admin-console-mark";
import { useSidebar } from "@/shared/components/layout/sidebar-provider";
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
  const { mobileOpen, setMobileOpen, isMobile, collapsed } = useSidebar();
  const logoutMutation = useAdminLogout();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-5",
        className,
      )}
    >
      {isMobile ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("shell.openNavigation")}
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-nav"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
        </Button>
      ) : collapsed ? (
        <SidebarExpandButton controlsId="admin-sidebar-nav" />
      ) : null}

      <div className="flex min-w-0 items-center gap-2 md:hidden">
        <AdminConsoleMark className="size-7" />
        <p className="truncate text-sm font-semibold">{t("shell.badge")}</p>
      </div>

      <div className="min-w-0 flex-1">
        <AdminAppBreadcrumbs className="md:flex" />
      </div>

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
              <AvatarFallback className="bg-primary/10 text-primary">
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
