import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/shared/components/layout/admin-nav";
import {
  AdminSidebarNavList,
  AdminSidebarRoleFooter,
} from "@/shared/components/layout/admin-sidebar-nav";
import { SidebarCollapseButton } from "@/shared/components/layout/sidebar-toggle-button";
import { useSidebar } from "@/shared/components/layout/sidebar-provider";
import { useLocaleStore } from "@/stores/locale.store";
import type { AdminRole } from "@/shared/types/enums";

interface AdminSidebarProps {
  userRole?: AdminRole;
  className?: string;
}

export function AdminSidebar({ userRole, className }: AdminSidebarProps) {
  const { t } = useTranslation("admin");
  const { collapsed } = useSidebar();
  const dir = useLocaleStore((state) => state.dir);
  const tooltipSide = dir === "rtl" ? "left" : "right";
  const roleLabel = userRole ? t(`roles.${userRole}`) : undefined;

  return (
    <aside
      id="admin-sidebar"
      className={cn(
        "sticky top-0 hidden h-dvh max-h-dvh shrink-0 flex-col self-start border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out md:flex",
        collapsed ? "w-(--sidebar-width-collapsed)" : "w-(--sidebar-width)",
        className,
      )}
      aria-label={t("shell.sidebarLabel")}
    >
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border",
          collapsed ? "h-14 justify-center px-2" : "h-14 justify-between gap-2 px-3",
        )}
      >
        {collapsed ? (
          <NavLink
            to="/admin"
            end
            aria-label={t("shell.nav.home")}
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50"
          >
            <span
              className="grid size-8 place-items-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/15 dark:text-violet-300"
              aria-hidden="true"
            >
              <ShieldCheck className="size-4" />
            </span>
          </NavLink>
        ) : (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/15 dark:text-violet-300"
                aria-hidden="true"
              >
                <ShieldCheck className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{t("shell.badge")}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t("brand.headline")}
                </p>
              </div>
            </div>
            <SidebarCollapseButton controlsId="admin-sidebar-nav" />
          </>
        )}
      </div>

      <AdminSidebarNavList
        collapsed={collapsed}
        tooltipSide={tooltipSide}
        items={ADMIN_NAV_ITEMS}
      />

      <div className="border-t border-sidebar-border p-3">
        <AdminSidebarRoleFooter
          collapsed={collapsed}
          roleLabel={roleLabel}
          tooltipSide={tooltipSide}
        />
      </div>
    </aside>
  );
}

export function AdminMobileSidebar({
  userRole,
  onNavigate,
  onClose,
}: {
  userRole?: AdminRole;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation("admin");
  const dir = useLocaleStore((state) => state.dir);
  const tooltipSide = dir === "rtl" ? "left" : "right";
  const roleLabel = userRole ? t(`roles.${userRole}`) : undefined;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/15 dark:text-violet-300"
          aria-hidden="true"
        >
          <ShieldCheck className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{t("shell.badge")}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t("brand.headline")}
          </p>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label={t("shell.closeNavigation")}
            className="shrink-0 text-sidebar-foreground"
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <AdminSidebarNavList
        collapsed={false}
        tooltipSide={tooltipSide}
        items={ADMIN_NAV_ITEMS}
        onNavigate={onNavigate}
        className="px-3 py-4"
      />

      <div className="border-t border-sidebar-border p-4">
        <AdminSidebarRoleFooter
          collapsed={false}
          roleLabel={roleLabel}
          tooltipSide={tooltipSide}
        />
      </div>
    </div>
  );
}
