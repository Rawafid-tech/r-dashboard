import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { AuthLocaleThemeControls } from "@/features/auth/components/auth-locale-theme-controls";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { SidebarExpandButton } from "@/shared/components/layout/sidebar-toggle-button";
import { useSidebar } from "@/shared/components/layout/sidebar-provider";
import { cn } from "@/shared/lib/utils";

interface MerchantHeaderProps {
  userName?: string;
  userEmail?: string;
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

export function MerchantHeader({
  userName,
  userEmail,
  className,
}: MerchantHeaderProps) {
  const { t } = useTranslation(["common", "dashboard"]);
  const { mobileOpen, setMobileOpen, isMobile, collapsed } = useSidebar();
  const logoutMutation = useLogout();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-6",
        className,
      )}
    >
      {isMobile ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("dashboard:shell.openNavigation")}
          aria-expanded={mobileOpen}
          aria-controls="merchant-mobile-nav"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
        </Button>
      ) : collapsed ? (
        <SidebarExpandButton />
      ) : null}

      <div className="min-w-0 flex-1 md:hidden">
        <p className="truncate text-sm font-semibold">{t("common:app.name")}</p>
      </div>

      <div className="hidden min-w-0 flex-1 md:block" aria-hidden="true" />

      <AuthLocaleThemeControls />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="max-w-[min(100%,14rem)] ps-2"
            aria-label={t("dashboard:shell.userMenuLabel", {
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
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            {t("dashboard:shell.menu.account")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            {t("dashboard:shell.menu.settings")}
          </DropdownMenuItem>
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
              ? t("dashboard:shell.loggingOut")
              : t("common:auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
